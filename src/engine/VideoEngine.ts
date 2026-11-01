import type { VideoScript } from './types';

interface LayoutWord {
    w: string;
    start: number;
    wd: number;
}

export class VideoEngine {
    private canvas: HTMLCanvasElement;
    public ctx: CanvasRenderingContext2D;
    public script: VideoScript;
    public width: number;
    public height: number;
    public layout: LayoutWord[][][] = [];
    
    // Playback state
    public running = false;
    public sceneIndex = -1;
    public spoken = 0;
    public speechDone = false;
    public bfired = false;
    
    private onDoneCallback: (() => void) | null = null;
    private keepUtterance: SpeechSynthesisUtterance | null = null;
    private t0 = 0;
    private animationFrameId = 0;
    public previewVoice = '';

    constructor(canvas: HTMLCanvasElement, script: VideoScript) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true })!;
        this.script = script;
        this.width = script.width;
        this.height = script.height;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        
        this.calculateLayout();
        this.drawStandby();
    }

    private calculateLayout() {
        this.ctx.font = '800 54px system-ui';
        this.layout = this.script.scenes.map(sc => {
            const words: LayoutWord[] = [];
            let idx = 0;
            for (const w of sc.text.split(' ')) {
                words.push({ w, start: idx, wd: this.ctx.measureText(w).width });
                idx += w.length + 1;
            }
            const lines: LayoutWord[][] = [];
            let cur: LayoutWord[] = [], cw = 0;
            for (const o of words) {
                if (cw + o.wd > 880 && cur.length) {
                    lines.push(cur);
                    cur = [];
                    cw = 0;
                }
                cur.push(o);
                cw += o.wd + 16;
            }
            lines.push(cur);
            return lines;
        });
    }

    private drawStandby() {
        if (this.script.renderThumbnail) {
            this.script.renderThumbnail(this.ctx);
        } else {
            this.ctx.fillStyle = '#000';
            this.ctx.fillRect(0, 0, this.width, this.height);
            this.ctx.fillStyle = 'rgba(0,0,0,.45)';
            this.ctx.fillRect(0, 0, this.width, this.height);
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '800 70px system-ui';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Press Preview or Export', this.width / 2, this.height / 2 + 20);
        }
    }

    private drawHUD(idx: number, el: number, duration: number) {
        const p = Math.max(0, Math.min(1, el / duration));
        for (let j = 0; j < this.script.scenes.length; j++) {
            const x = 40 + j * Math.floor((this.width - 80) / this.script.scenes.length);
            const w = Math.floor((this.width - 80) / this.script.scenes.length) - 16;
            this.ctx.fillStyle = 'rgba(255,255,255,.18)';
            this.roundRect(x, 48, w, 8, 4);
            this.ctx.fill();
            const f = j < idx ? 1 : j === idx ? p : 0;
            this.ctx.fillStyle = '#38e8ff';
            this.roundRect(x, 48, w * f, 8, 4);
            this.ctx.fill();
        }
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '700 46px system-ui';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(this.script.scenes[idx].title, 44, 126);
    }

    private drawCaption(idx: number, pos: number, isPreview: boolean) {
        const L = this.layout[idx];
        const h = L.length * 76 + 40;
        const y0 = this.height - 530;
        this.ctx.fillStyle = 'rgba(4,8,20,.72)';
        this.roundRect(60, y0, this.width - 120, h, 36);
        this.ctx.fill();
        this.ctx.font = '800 54px system-ui';
        this.ctx.textAlign = 'left';
        let curStart = -1;
        for (const l of L) {
            for (const o of l) {
                if (o.start <= pos) curStart = o.start;
            }
        }
        L.forEach((l, li) => {
            const tw = l.reduce((a, o) => a + o.wd + 16, -16);
            let x = this.width / 2 - tw / 2;
            for (const o of l) {
                const isHighlight = isPreview ? (o.start === curStart && this.running) : (o.start <= pos);
                this.ctx.fillStyle = isHighlight ? '#ffe066' : 'rgba(255,255,255,.42)';
                this.ctx.fillText(o.w, x, y0 + 78 + li * 76);
                x += o.wd + 16;
            }
        });
    }

    public renderFrame(idx: number, el: number, duration: number, pos: number, isPreview: boolean) {
        const p = Math.max(0, Math.min(1, el / duration));
        
        if (this.script.renderBackground) {
            this.script.renderBackground(this.ctx, idx, el);
        } else {
            this.ctx.fillStyle = '#000';
            this.ctx.fillRect(0, 0, this.width, this.height);
        }

        this.script.scenes[idx].render(this.ctx, p, el);

        if (isPreview && this.running && el < 0.4) {
            this.ctx.fillStyle = `rgba(0,0,0,${1 - el / 0.4})`;
            this.ctx.fillRect(0, 0, this.width, this.height);
        }

        this.drawHUD(idx, el, duration);
        this.drawCaption(idx, pos, isPreview);
    }

    private startScene(idx: number) {
        this.sceneIndex = idx;
        this.t0 = performance.now();
        this.spoken = 0;
        this.speechDone = false;
        this.bfired = false;
        
        const utterance = new SpeechSynthesisUtterance(this.script.scenes[idx].text);
        const voice = speechSynthesis.getVoices().find(x => x.name === this.previewVoice);
        if (voice) utterance.voice = voice;
        utterance.rate = 1;
        utterance.onboundary = (e) => {
            this.bfired = true;
            this.spoken = e.charIndex;
        };
        utterance.onend = utterance.onerror = () => {
            if (this.sceneIndex === idx) this.speechDone = true;
        };
        this.keepUtterance = utterance;
        speechSynthesis.speak(utterance);
    }

    public playPreview(voiceName: string, onDone?: () => void) {
        speechSynthesis.cancel();
        this.previewVoice = voiceName;
        this.running = true;
        this.onDoneCallback = onDone || null;
        this.startScene(0);
        this.loop();
    }

    public stop() {
        this.running = false;
        this.sceneIndex = -1;
        this.onDoneCallback = null;
        speechSynthesis.cancel();
        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
        this.drawStandby();
    }

    private finish() {
        this.running = false;
        if (this.onDoneCallback) {
            const cb = this.onDoneCallback;
            this.onDoneCallback = null;
            setTimeout(cb, 900);
        }
        this.sceneIndex = -1;
        this.drawStandby();
    }

    private loop = () => {
        if (!this.running) return;
        const d = this.script.scenes[this.sceneIndex].duration;
        const el = (performance.now() - this.t0) / 1000;
        
        if (el >= d && (this.speechDone || el > d + 5)) {
            if (this.sceneIndex < this.script.scenes.length - 1) {
                this.startScene(this.sceneIndex + 1);
            } else {
                this.finish();
                return;
            }
        }
        
        const currentDuration = this.script.scenes[this.sceneIndex].duration;
        const currentElapsed = (performance.now() - this.t0) / 1000;
        const textLen = this.script.scenes[this.sceneIndex].text.length;
        const pos = this.bfired ? this.spoken : Math.min(textLen, Math.floor((currentElapsed / currentDuration) * textLen));
        
        this.renderFrame(this.sceneIndex, currentElapsed, currentDuration, pos, true);
        this.animationFrameId = requestAnimationFrame(this.loop);
    };

    private roundRect(x: number, y: number, w: number, h: number, r: number) {
        this.ctx.beginPath();
        if (typeof this.ctx.roundRect === 'function') {
            this.ctx.roundRect(x, y, w, h, r);
        } else {
            this.ctx.rect(x, y, w, h);
        }
    }
}