import * as Mp4Muxer from 'mp4-muxer';
import type { VideoEngine } from './VideoEngine';

// Prevent TypeScript from throwing errors for WebCodecs that are present in Modern browsers
declare var VideoEncoder: any;
declare var AudioEncoder: any;
declare var VideoFrame: any;
declare var AudioData: any;

let ttsInstance: any = null;
let currentTtsMode: boolean | null = null;

async function loadTTS(gpu: boolean, onProgress: (msg: string) => void) {
    if (ttsInstance && currentTtsMode === gpu) return ttsInstance;
    currentTtsMode = gpu;
    
    if (gpu) {
        const ad = navigator.gpu ? await navigator.gpu.requestAdapter().catch(() => null) : null;
        if (!ad) throw new Error('No GPU available to this browser. Turn on hardware acceleration, restart the browser, or untick "Use GPU".');
    }
    
    const { KokoroTTS } = await import('kokoro-js');
    const modelId = 'onnx-community/Kokoro-82M-v1.0-ONNX';
    const pc = (p: any) => {
        if (p.status === 'progress') onProgress('Downloading voice model ' + Math.round(p.progress) + '% (first time only)');
    };
    
    try {
        ttsInstance = await KokoroTTS.from_pretrained(modelId, gpu ? {
            dtype: 'fp32',
            device: 'webgpu',
            progress_callback: pc
        } : { dtype: 'q8', device: 'wasm', progress_callback: pc });
        return ttsInstance;
    } catch (e: any) {
        ttsInstance = null;
        if (gpu) throw new Error('GPU start-up failed (' + (e.message || e) + '). Reload this page and untick "Use GPU", or fix hardware acceleration first.');
        throw e;
    }
}

async function resampleAudio(f32: Float32Array, sr: number, to: number): Promise<Float32Array> {
    const oc = new OfflineAudioContext(1, Math.ceil(f32.length * to / sr), to);
    const b = oc.createBuffer(1, f32.length, sr);
    b.copyToChannel(f32, 0);
    const n = oc.createBufferSource();
    n.buffer = b;
    n.connect(oc.destination);
    n.start();
    const rendered = await oc.startRendering();
    return rendered.getChannelData(0);
}

const tick = () => new Promise(r => setTimeout(r, 0));

export async function exportVideoMp4(
    engine: VideoEngine,
    voiceId: string,
    useGpu: boolean,
    onProgress: (msg: string | null, url?: string) => void,
    checkAbort: () => boolean
) {
    if (typeof window === 'undefined' || !('VideoEncoder' in window) || !('AudioEncoder' in window)) {
        throw new Error('Needs desktop Chrome or Edge (WebCodecs) and an internet connection.');
    }

    engine.stop();
    const script = engine.script;

    const chk = () => {
        if (checkAbort()) throw new Error('Stopped.');
    };

    const tts = await loadTTS(useGpu, onProgress);
    const clips: any[] = [];

    for (let i = 0; i < script.scenes.length; i++) {
        chk();
        onProgress(`Generating voice ${i + 1} of ${script.scenes.length}…`);
        await tick();
        const generated = await tts.generate(script.scenes[i].text, { voice: voiceId, speed: 1.1 });
        clips.push(generated);
    }

    const LEAD = 0.25;
    const L = clips.map(a => a.audio.length / a.sampling_rate);
    const D = script.scenes.map((x, i) => Math.max(x.duration, L[i] + LEAD + 0.5));
    
    const starts: number[] = [];
    let T = 0;
    for (const d of D) {
        starts.push(T);
        T += d;
    }
    
    const SR = clips[0].sampling_rate;
    const raw = new Float32Array(Math.ceil(T * SR));
    clips.forEach((a, i) => raw.set(a.audio, Math.round((starts[i] + LEAD) * SR)));
    
    const pcm = await resampleAudio(raw, SR, 48000);
    let vc = null;
    for (const codec of ['avc1.64002A', 'avc1.640033', 'avc1.4D0033']) {
        const cfg = { codec, width: engine.width, height: engine.height, bitrate: 6e6, framerate: 30 };
        if ((await VideoEncoder.isConfigSupported(cfg)).supported) {
            vc = cfg;
            break;
        }
    }
    if (!vc) throw new Error('This browser cannot encode H.264 video.');
    
    let ac = { codec: 'mp4a.40.2', sampleRate: 48000, numberOfChannels: 1, bitrate: 128000 };
    let acodec = 'aac';
    if (!(await AudioEncoder.isConfigSupported(ac)).supported) {
        ac = { codec: 'opus', sampleRate: 48000, numberOfChannels: 1, bitrate: 96000 };
        acodec = 'opus';
    }

    const muxer = new Mp4Muxer.Muxer({
        target: new Mp4Muxer.ArrayBufferTarget(),
        video: { codec: 'avc', width: engine.width, height: engine.height },
        audio: { codec: acodec as any, numberOfChannels: 1, sampleRate: 48000 },
        fastStart: 'in-memory'
    });

    let err: Error | null = null;
    const fail = (e: Error) => { err = e; };
    
    const ve = new VideoEncoder({ output: (ch: any, m: any) => muxer.addVideoChunk(ch, m), error: fail });
    const ae = new AudioEncoder({ output: (ch: any, m: any) => muxer.addAudioChunk(ch, m), error: fail });
    
    ve.configure(vc);
    ae.configure(ac);
    
    for (let o = 0; o < pcm.length; o += 48000) {
        const part = pcm.slice(o, o + 48000);
        const ad = new AudioData({
            format: 'f32-planar',
            sampleRate: 48000,
            numberOfFrames: part.length,
            numberOfChannels: 1,
            timestamp: Math.round((o / 48000) * 1e6),
            data: part
        });
        ae.encode(ad);
        ad.close();
    }
    
    const N = Math.ceil(T * 30);
    let si = 0;
    
    for (let f = 0; f < N; f++) {
        chk();
        if (err) throw err;
        
        const t = f / 30;
        while (si < script.scenes.length - 1 && t >= starts[si + 1]) si++;
        
        const el = t - starts[si];
        const textLen = script.scenes[si].text.length;
        const pos = Math.floor(Math.max(0, Math.min(1, (el - LEAD) / L[si])) * textLen);
        
        engine.renderFrame(si, el, D[si], pos, false);
        
        const vf = new VideoFrame(engine.ctx.canvas, { timestamp: Math.round(f * 1e6 / 30), duration: Math.round(1e6 / 30) });
        ve.encode(vf, { keyFrame: f % 60 === 0 });
        vf.close();
        
        while (ve.encodeQueueSize > 10) await new Promise(r => setTimeout(r, 5));
        
        if (f % 8 === 0) {
            onProgress(`Rendering video ${Math.round((f / N) * 100)}%`);
            await tick();
        }
    }
    
    await ve.flush();
    await ae.flush();
    if (err) throw err;
    
    muxer.finalize();
    const url = URL.createObjectURL(new Blob([muxer.target.buffer], { type: 'video/mp4' }));
    
    engine.stop();
    onProgress(`Done: ${T.toFixed(1)} s MP4${T > 60 ? ' (over 60 s, too long for a Short)' : ''}.`, url);
}