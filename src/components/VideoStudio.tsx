import { useEffect, useRef, useState } from 'react';
import { VideoEngine } from '../engine/VideoEngine';
import { exportVideoMp4 } from '../engine/VideoExporter';
import type { VideoScript } from '../engine/types';

interface VideoStudioProps {
    script: VideoScript;
    onBack: () => void;
}

export function VideoStudio({ script, onBack }: VideoStudioProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const engineRef = useRef<VideoEngine | null>(null);
    
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [previewVoice, setPreviewVoice] = useState('');
    const [exportVoice, setExportVoice] = useState('af_heart');
    const [useGpu, setUseGpu] = useState(false);
    
    const [statusMsg, setStatusMsg] = useState('');
    const [downloadUrl, setDownloadUrl] = useState('');
    const [isExporting, setIsExporting] = useState(false);
    
    const abortRef = useRef(false);

    useEffect(() => {
        if (!canvasRef.current) return;
        engineRef.current = new VideoEngine(canvasRef.current, script);

        const loadVoices = () => {
            const v = window.speechSynthesis.getVoices().filter(x => /^en/i.test(x.lang));
            setVoices(v);
            if (v.length > 0 && !previewVoice) {
                setPreviewVoice(v[0].name);
            }
        };

        if ('speechSynthesis' in window) {
            loadVoices();
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }

        return () => {
            if (engineRef.current) engineRef.current.stop();
        };
    }, [script]);

    const handlePreview = () => {
        if (!engineRef.current || isExporting) return;
        setStatusMsg('');
        setDownloadUrl('');
        engineRef.current.playPreview(previewVoice, () => {
            // onDone
        });
    };

    const handleStop = () => {
        abortRef.current = true;
        if (engineRef.current) engineRef.current.stop();
        if (!isExporting) setStatusMsg('');
    };

    const handleExport = async () => {
        if (!engineRef.current || isExporting) return;
        setIsExporting(true);
        abortRef.current = false;
        setStatusMsg('Starting export...');
        setDownloadUrl('');
        
        try {
            await exportVideoMp4(
                engineRef.current,
                exportVoice,
                useGpu,
                (msg, url) => {
                    if (msg) setStatusMsg(msg);
                    if (url) setDownloadUrl(url);
                },
                () => abortRef.current
            );
        } catch (e: any) {
            setStatusMsg('Export failed: ' + (e.message || e));
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <>
            <canvas ref={canvasRef}></canvas>
            
            <div className="panel">
                <button onClick={onBack} disabled={isExporting} style={{ marginBottom: '8px' }}>
                    &larr; Back to Scripts
                </button>
                
                <h1>{script.name}</h1>
                
                <button onClick={handlePreview} disabled={isExporting}>
                    Preview with voice
                </button>
                <button className="rec" onClick={handleExport} disabled={isExporting}>
                    Export MP4 (works anywhere)
                </button>
                <button onClick={handleStop}>Stop</button>
                
                <select 
                    aria-label="Preview voice" 
                    value={previewVoice} 
                    onChange={e => setPreviewVoice(e.target.value)}
                    disabled={isExporting}
                >
                    {voices.map((v, i) => (
                        <option key={i} value={v.name}>{v.name} ({v.lang})</option>
                    ))}
                </select>
                
                <label className="chk">
                    <input 
                        type="checkbox" 
                        checked={useGpu} 
                        onChange={e => setUseGpu(e.target.checked)} 
                        disabled={isExporting} 
                    /> 
                    Use GPU for the voice (faster)
                </label>
                
                <details>
                    <summary>How to turn on GPU</summary>
                    <p><b>Chrome:</b> Settings, System, switch on <i>Use graphics acceleration when available</i>, then relaunch. 
                        Open <code>chrome://gpu</code> and check that <i>WebGPU</i> says hardware accelerated.</p>
                    <p><b>Edge:</b> the same setting is in <code>edge://settings/system</code>; check <code>edge://gpu</code>.</p>
                    <p><b>Linux Setup:</b> Open <code>chrome://flags</code>, enable <i>Vulkan</i> (<code>#enable-vulkan</code>) and 
                        <i>Force enable WebGPU interop</i> (<code>#force-enable-webgpu-interop</code>), then relaunch.</p>
                    <p><b>Still unavailable?</b> Update your graphics driver. On laptops with two GPUs, Windows Settings, System, 
                        Display, Graphics, then set the browser to High performance.</p>
                    <p>Then reload this page and tick the box. The GPU model is a bigger one-time download (about 330 MB). If GPU 
                        start-up fails, reload the page before trying the CPU again.</p>
                </details>

                <div className="status-box">
                    {statusMsg}
                    {downloadUrl && (
                        <>
                            {' '}
                            <a id="dl" href={downloadUrl} download={`${script.id}-short.mp4`}>
                                Download MP4
                            </a>
                        </>
                    )}
                </div>

                <select 
                    aria-label="Export voice"
                    value={exportVoice}
                    onChange={e => setExportVoice(e.target.value)}
                    disabled={isExporting}
                >
                    <option value="af_heart">Export voice: Heart (female)</option>
                    <option value="af_bella">Export voice: Bella (female)</option>
                    <option value="am_michael">Export voice: Michael (male)</option>
                    <option value="bm_george">Export voice: George (British male)</option>
                </select>

                <p>
                    Export makes a normal MP4 with the voice baked in, so it plays in any player and uploads to YouTube. 
                    First run downloads a ~90 MB voice model (cached after that), then renders the video in about 1 to 3 minutes. 
                    Keep this tab open. Needs desktop Chrome or Edge. The voice dropdown above is only for the live preview.
                </p>
            </div>
        </>
    );
}