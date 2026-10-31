import type { VideoScript } from '../../engine/types';

// Utility functions
const rng = (s: number) => () => (s = (s * 16807) % 2147483647) / 2147483647;
const cl = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const eo = (t: number) => 1 - Math.pow(1 - t, 3);
const rr = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number | number[]) => {
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(x, y, w, h, r);
    } else {
        ctx.rect(x, y, w, h);
    }
};

function glow(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, rgb: string, a = 1) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(${rgb},1)`);
    g.addColorStop(1, `rgba(${rgb},0)`);
    ctx.globalAlpha = a;
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 7);
    ctx.fill();
    ctx.globalAlpha = 1;
}

// Scene Constants
const W = 1080, H = 1920;
const BG = [
    ['#0a1030', '#1b0f3a'], ['#04101f', '#0a2a45'], ['#1a0a12', '#0c0f24'], 
    ['#06182a', '#0a2a3a'], ['#0a1530', '#2a1650'], ['#071a22', '#0b2a33']
];

const P = Array.from({length: 50}, (_, i) => {
    const r = rng(i + 99);
    return { x: r() * W, y: r() * H, r: r() * 3 + 1, v: r() * 20 + 8 };
});

function cracks(cx: number, cy: number, n: number, len: number, seed: number) {
    const r = rng(seed), out = [];
    for (let i = 0; i < n; i++) {
        let a = r() * 6.283, x = cx, y = cy, pts = [[x, y]];
        const L = len * (0.4 + r() * 0.6);
        for (let k = 0; k < 10; k++) {
            a += (r() - 0.5) * 0.8;
            x += Math.cos(a) * L / 10;
            y += Math.sin(a) * L / 10;
            pts.push([x, y]);
        }
        out.push(pts);
        if (r() < 0.6) {
            const m = pts[4];
            let b = a + (r() < 0.5 ? 1 : -1) * 0.9, bx = m[0], by = m[1];
            const bp = [[bx, by]];
            for (let k = 0; k < 5; k++) {
                b += (r() - 0.5) * 0.8;
                bx += Math.cos(b) * L / 12;
                by += Math.sin(b) * L / 12;
                bp.push([bx, by]);
            }
            out.push(bp);
        }
    }
    return out;
}

function partial(ctx: CanvasRenderingContext2D, pts: number[][], f: number) {
    const n = pts.length - 1, ff = cl(f) * n;
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i <= n; i++) {
        if (i <= ff) ctx.lineTo(pts[i][0], pts[i][1]); else {
            const q = ff - (i - 1);
            if (q > 0) ctx.lineTo(pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * q, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * q);
            break;
        }
    }
    ctx.stroke();
}

function drawCracks(ctx: CanvasRenderingContext2D, cr: number[][][], p: number, col: string, w: number) {
    ctx.strokeStyle = col;
    ctx.lineWidth = w;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (const pts of cr) partial(ctx, pts, p * 1.3);
}

// Scene 1 Setup
const CR1 = cracks(0, -100, 14, 520, 7);
function phone(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = '#0d1326';
    ctx.strokeStyle = '#4a5b94';
    ctx.lineWidth = 6;
    rr(ctx, -250, -520, 500, 1040, 76);
    ctx.fill();
    ctx.stroke();
    const g = ctx.createLinearGradient(0, -500, 0, 500);
    g.addColorStop(0, '#2b3cff');
    g.addColorStop(0.5, '#8b2cff');
    g.addColorStop(1, '#ff4fa3');
    ctx.fillStyle = g;
    rr(ctx, -232, -502, 464, 1004, 62);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = '700 120px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('9:41', 0, -300);
    for (let i = 0; i < 8; i++) {
        const x = -150 + (i % 4) * 100, y = -100 + Math.floor(i / 4) * 120;
        ctx.fillStyle = 'rgba(255,255,255,.22)';
        rr(ctx, x - 34, y - 34, 68, 68, 18);
        ctx.fill();
    }
    ctx.fillStyle = '#000';
    rr(ctx, -60, -486, 120, 34, 17);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.07)';
    ctx.beginPath();
    ctx.moveTo(-232, -100);
    ctx.lineTo(232, -440);
    ctx.lineTo(232, -100);
    ctx.fill();
}
function s1(ctx: CanvasRenderingContext2D, p: number, s: number) {
    ctx.save();
    const z = 1.15 - 0.15 * eo(p);
    ctx.translate(540, 760);
    ctx.scale(z, z);
    phone(ctx);
    const lift = eo(cl((p - 0.25) / 0.5)), a = 1 - cl((p - 0.65) / 0.3);
    ctx.save();
    ctx.translate(lift * 140, -lift * 520);
    ctx.rotate(lift * 0.5);
    ctx.globalAlpha = a;
    if (p < 0.25) ctx.translate(Math.sin(s * 40) * 2, 0);
    ctx.fillStyle = 'rgba(180,230,255,.12)';
    ctx.strokeStyle = 'rgba(210,245,255,.85)';
    ctx.lineWidth = 4;
    rr(ctx, -232, -502, 464, 1004, 62);
    ctx.fill();
    ctx.stroke();
    ctx.shadowColor = '#9fe8ff';
    ctx.shadowBlur = 14;
    drawCracks(ctx, CR1, 1, 'rgba(255,255,255,.9)', 3);
    ctx.shadowBlur = 0;
    ctx.restore();
    ctx.restore();
}

// Scene 2 Setup
const CR2 = cracks(540, 760, 16, 520, 3);
function s2(ctx: CanvasRenderingContext2D, p: number, s: number) {
    ctx.save();
    rr(ctx, 50, 230, 980, 1060, 40);
    ctx.clip();
    const g = ctx.createLinearGradient(50, 230, 1030, 1290);
    g.addColorStop(0, '#0e2a4a');
    g.addColorStop(1, '#1d5a8a');
    ctx.fillStyle = g;
    ctx.fillRect(50, 230, 980, 1060);
    const z = 1 + p * 0.5;
    ctx.translate(540, 760);
    ctx.scale(z, z);
    ctx.translate(-540, -760);
    const cp = cl((p - 0.2) / 0.6);
    ctx.fillStyle = 'rgba(160,225,255,.5)';
    for (let gx = 0; gx <= 17; gx++) for (let gy = 0; gy <= 19; gy++) {
        let x = 50 + gx * 57, y = 230 + gy * 56;
        const dx = x - 540, dy = y - 760, d = Math.hypot(dx, dy) || 1, k = cp * 26 * Math.exp(-d / 260);
        x += dx / d * k;
        y += dy / d * k;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 7);
        ctx.fill();
    }
    glow(ctx, 540, 760, 60 + cp * 260, '255,255,255', 0.25 + 0.4 * cp);
    ctx.shadowColor = '#9fe8ff';
    ctx.shadowBlur = 18;
    drawCracks(ctx, CR2, cp, '#fff', 3);
    ctx.shadowBlur = 0;
    ctx.restore();
    ctx.strokeStyle = 'rgba(160,225,255,.6)';
    ctx.lineWidth = 4;
    rr(ctx, 50, 230, 980, 1060, 40);
    ctx.stroke();
    if (p > 0.82) {
        const f = (p - 0.82) / 0.18;
        ctx.fillStyle = `rgba(255,255,255,${0.55 * (1 - f)})`;
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#ff5a5f';
        ctx.font = '900 170px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('CRACK!', 540 + (Math.random() - 0.5) * 14, 780 + (Math.random() - 0.5) * 14);
    }
}

// Scene 3 Setup
const KC = [[480, 1160], [600, 1160], [503, 1000], [577, 1000]].map((q, i) => cracks(q[0], q[1], 3, 120, 40 + i));
function s3(ctx: CanvasRenderingContext2D, p: number, s: number) {
    const pulse = 0.5 + 0.5 * Math.sin(s * 6), on = cl(p * 3);
    ctx.save();
    ctx.translate(540, 520);
    ctx.strokeStyle = '#33405f';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(0, 0, 250, 0, 7);
    ctx.stroke();
    ctx.rotate(s * 1.2);
    for (let i = 0; i < 14; i++) {
        ctx.save();
        ctx.rotate(i * Math.PI * 2 / 14);
        const g = ctx.createLinearGradient(0, 0, 0, -240);
        g.addColorStop(0, '#9aa7c4');
        g.addColorStop(1, '#4a5778');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(-14, -60);
        ctx.quadraticCurveTo(-46, -150, -22, -235);
        ctx.lineTo(14, -235);
        ctx.quadraticCurveTo(10, -150, 14, -60);
        ctx.closePath();
        ctx.fill();
        glow(ctx, 0, -64, 60, '255,60,60', on * (0.35 + 0.45 * pulse));
        ctx.restore();
    }
    ctx.fillStyle = '#1c2542';
    ctx.beginPath();
    ctx.arc(0, 0, 64, 0, 7);
    ctx.fill();
    ctx.strokeStyle = '#6f7fb0';
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.restore();
    ctx.fillStyle = '#1a2138';
    ctx.strokeStyle = '#3b4870';
    ctx.lineWidth = 5;
    rr(ctx, 290, 800, 500, 420, 30);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#0b1020';
    ctx.beginPath();
    ctx.arc(540, 950, 70, 0, 7);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(503, 1000);
    ctx.lineTo(480, 1160);
    ctx.lineTo(600, 1160);
    ctx.lineTo(577, 1000);
    ctx.closePath();
    ctx.fill();
    for (const q of [[480, 1160], [600, 1160], [503, 1000], [577, 1000]]) glow(ctx, q[0], q[1], 95 * (0.7 + 0.3 * pulse), '255,70,50', on * 0.8);
    const cp = cl((p - 0.4) / 0.5);
    ctx.shadowColor = '#ff6a3c';
    ctx.shadowBlur = 14;
    for (const cr of KC) drawCracks(ctx, cr, cp, '#ffb08a', 3);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#a9b6dd';
    ctx.font = '600 38px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Turbine blade roots', 540, 225);
    ctx.fillText('Keyhole cutout', 540, 775);
}

// Scene 4 & 5 Setup
const CAPS = (() => {
    const r = rng(21);
    return Array.from({length: 30}, () => ({x: 130 + r() * 820, y: 450 + r() * 730, r: 20 + r() * 20, ph: r() * 6}));
})();
function matrix(ctx: CanvasRenderingContext2D) {
    const g = ctx.createLinearGradient(0, 300, 0, 1200);
    g.addColorStop(0, '#1a2446');
    g.addColorStop(1, '#0f1730');
    ctx.fillStyle = g;
    ctx.strokeStyle = '#33426e';
    ctx.lineWidth = 5;
    rr(ctx, 80, 300, 920, 900, 40);
    ctx.fill();
    ctx.stroke();
}
function cap(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, rgb = '56,232,255') {
    glow(ctx, x, y, r * 2.3, rgb, 0.3);
    ctx.fillStyle = 'rgba(180,240,255,.16)';
    ctx.strokeStyle = 'rgba(200,245,255,.8)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 7);
    ctx.fill();
    ctx.stroke();
    glow(ctx, x, y, r * 0.8, rgb, 0.85);
    ctx.fillStyle = 'rgba(255,255,255,.75)';
    ctx.beginPath();
    ctx.arc(x - r * 0.35, y - r * 0.35, r * 0.17, 0, 7);
    ctx.fill();
}
function surface(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = '#2f4180';
    rr(ctx, 80, 300, 920, 100, [40, 40, 0, 0]);
    ctx.fill();
    ctx.fillStyle = '#c9d6ff';
    ctx.font = '600 34px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Smooth surface', 540, 362);
}
function s4(ctx: CanvasRenderingContext2D, p: number, s: number) {
    matrix(ctx);
    ctx.save();
    rr(ctx, 80, 300, 920, 900, 40);
    ctx.clip();
    ctx.translate(540, 760);
    ctx.scale(1.2, 1.2);
    ctx.translate(-540 - (p - 0.5) * 220, -760);
    for (const q of CAPS) cap(ctx, q.x, q.y + Math.sin(s * 1.5 + q.ph) * 6, q.r);
    ctx.restore();
    surface(ctx);
    ctx.fillStyle = '#38e8ff';
    ctx.font = '700 44px system-ui';
    ctx.textAlign = 'center';
    ctx.globalAlpha = cl((p - 0.3) / 0.2);
    ctx.fillText('Liquid-filled microcapsules', 540, 1262);
    ctx.globalAlpha = 1;
}

const CRK = [[540, 300], [520, 420], [560, 520], [510, 640], [550, 760], [500, 880], [545, 1000], [515, 1100], [540, 1200]];
const NC = [[525, 430], [578, 560], [515, 700], [565, 820], [500, 960], [555, 1090]];
function s5(ctx: CanvasRenderingContext2D, p: number, s: number) {
    matrix(ctx);
    ctx.save();
    rr(ctx, 80, 300, 920, 900, 40);
    ctx.clip();
    for (const q of CAPS) if (Math.abs(q.x - 540) > 115) cap(ctx, q.x, q.y + Math.sin(s * 1.5 + q.ph) * 6, q.r);
    const cp = cl(p / 0.28), rp = cl((p - 0.3) / 0.45), hp = cl((p - 0.8) / 0.2);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#020410';
    ctx.lineWidth = 12 * (1 - hp);
    if (ctx.lineWidth > 0.3) partial(ctx, CRK, cp);
    NC.forEach((q, i) => {
        const tb = 0.16 + i * 0.04, b = cl((p - tb) / 0.12);
        if (b <= 0) cap(ctx, q[0], q[1], 34);
        else if (b < 1) {
            ctx.strokeStyle = `rgba(255,209,102,${1 - b})`;
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.arc(q[0], q[1], 34 + b * 70, 0, 7);
            ctx.stroke();
            for (let k = 0; k < 8; k++) {
                const a = k * 0.785;
                glow(ctx, q[0] + Math.cos(a) * b * 90, q[1] + Math.sin(a) * b * 90, 14, '255,209,102', 1 - b);
            }
        }
    });
    ctx.shadowColor = '#ffd166';
    ctx.shadowBlur = 22;
    ctx.strokeStyle = `rgba(255,209,102,${1 - hp * 0.5})`;
    ctx.lineWidth = 16 * (1 - hp * 0.6);
    partial(ctx, CRK, rp);
    ctx.shadowBlur = 0;
    if (hp > 0) {
        ctx.shadowColor = '#5dffb0';
        ctx.shadowBlur = 20;
        ctx.strokeStyle = `rgba(93,255,176,${hp * 0.9})`;
        ctx.lineWidth = 4;
        partial(ctx, CRK, 1);
        ctx.shadowBlur = 0;
    }
    if (p > 0.78) {
        const x = 80 + cl((p - 0.78) / 0.22) * 920, g = ctx.createLinearGradient(x - 130, 0, x + 130, 0);
        g.addColorStop(0, 'rgba(170,110,255,0)');
        g.addColorStop(0.5, 'rgba(195,145,255,.6)');
        g.addColorStop(1, 'rgba(170,110,255,0)');
        ctx.fillStyle = g;
        ctx.fillRect(x - 130, 300, 260, 900);
    }
    ctx.restore();
    const L = ['Crack', 'Burst', 'Flow', 'Cure'], T = [0, 0.16, 0.3, 0.8];
    ctx.font = '700 36px system-ui';
    ctx.textAlign = 'center';
    L.forEach((l, i) => {
        const on = p >= T[i], x = 190 + i * 233;
        ctx.fillStyle = on ? '#ffd166' : 'rgba(255,255,255,.12)';
        rr(ctx, x - 95, 1232, 190, 60, 30);
        ctx.fill();
        ctx.fillStyle = on ? '#1a1200' : '#7f8db3';
        ctx.fillText(l, x, 1275);
    });
}

// Scene 6 Setup
const SC = (() => {
    const r = rng(5);
    return Array.from({length: 22}, () => {
        const x = r() * 800 + 140, y = r() * 900 + 300, a = r() * 3.14, l = 60 + r() * 140;
        return [x, y, x + Math.cos(a) * l, y + Math.sin(a) * l];
    });
})();
const PP = new Path2D();
PP.roundRect(160, 290, 760, 480, 36);
const PD = new Path2D();
PD.moveTo(160, 900);
PD.bezierCurveTo(380, 830, 700, 970, 920, 900);
PD.lineTo(920, 1180);
PD.bezierCurveTo(700, 1250, 380, 1110, 160, 1180);
PD.closePath();
function s6(ctx: CanvasRenderingContext2D, p: number, s: number) {
    ctx.save();
    ctx.translate(540, 760);
    ctx.rotate(Math.sin(s * 0.5) * 0.05);
    const k = 1 + Math.sin(s * 0.5) * 0.03;
    ctx.scale(k, k);
    ctx.translate(-540, -760);
    let g = ctx.createLinearGradient(180, 300, 900, 800);
    g.addColorStop(0, '#2a3350');
    g.addColorStop(0.5, '#58668f');
    g.addColorStop(1, '#202845');
    ctx.fillStyle = g;
    ctx.fill(PP);
    ctx.strokeStyle = '#8c9bc8';
    ctx.lineWidth = 4;
    ctx.stroke(PP);
    g = ctx.createLinearGradient(160, 900, 920, 1180);
    g.addColorStop(0, '#1d4ed8');
    g.addColorStop(1, '#38e8ff');
    ctx.fillStyle = g;
    ctx.fill(PD);
    ctx.strokeStyle = '#bfeaff';
    ctx.stroke(PD);
    const f = 1 - eo(cl((p - 0.25) / 0.55)), sx = -300 + cl(p / 0.9) * 1500;
    for (const path of [PP, PD]) {
        ctx.save();
        ctx.clip(path);
        ctx.globalAlpha = f;
        ctx.strokeStyle = 'rgba(255,255,255,.85)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (const l of SC) {
            ctx.moveTo(l[0], l[1]);
            ctx.lineTo(l[2], l[3]);
        }
        ctx.stroke();
        ctx.globalAlpha = 1;
        const lg = ctx.createLinearGradient(sx - 120, 0, sx + 120, 0);
        lg.addColorStop(0, 'rgba(255,255,255,0)');
        lg.addColorStop(0.5, 'rgba(255,255,255,.4)');
        lg.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = lg;
        ctx.fillRect(sx - 120, 250, 240, 1000);
        ctx.restore();
    }
    if (p > 0.6) {
        SC.slice(0, 8).forEach((l, i) => glow(ctx, l[0], l[1], 26 + 10 * Math.sin(s * 4 + i), '160,255,230', 0.55 * cl((p - 0.6) / 0.2) * (0.5 + 0.5 * Math.sin(s * 4 + i))));
    }
    ctx.restore();
}

function bg(ctx: CanvasRenderingContext2D, i: number, s: number) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, BG[i][0]);
    g.addColorStop(1, BG[i][1]);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(120,200,255,.22)';
    for (const q of P) {
        ctx.beginPath();
        ctx.arc(q.x, (q.y - q.v * s * 5 + H * 5) % H, q.r, 0, 7);
        ctx.fill();
    }
}

const selfHealingScript: VideoScript = {
    id: 'self-healing',
    name: 'Self-healing materials: 1080×1920 Short',
    width: W,
    height: H,
    scenes: [
        {
            duration: 8,
            title: 'Why glass cracks',
            text: "You drop your phone, peel off a cracked tempered glass protector, and wonder: why are we still sticking glass on top of glass?",
            render: s1
        },
        {
            duration: 9,
            title: 'Hard means brittle',
            text: "Traditional glass is made super hard to resist scratches, but that extreme hardness makes it brittle—one micro-fracture, and crack!",
            render: s2
        },
        {
            duration: 9,
            title: 'Stress everywhere',
            text: "The same high-stress nightmare happens inside jet engine turbines and structural keyholes, where tiny fatigue cracks threaten entire machines.",
            render: s3
        },
        {
            duration: 9,
            title: 'Capsules inside',
            text: "Instead of fighting damage with pure hardness, engineers are designing self-healing materials embedded with microscopic liquid-filled capsules.",
            render: s4
        },
        {
            duration: 10,
            title: 'The repair',
            text: "When a crack tears through, those capsules burst. Liquid healing agents flow into the gap and bond when exposed to warmth or UV light.",
            render: s5
        },
        {
            duration: 8,
            title: 'Living skin',
            text: "From aerospace coatings to next-gen electronics, we are shifting from materials that merely resist wear to materials that heal like living skin.",
            render: s6
        }
    ],
    renderBackground: bg
};

export default selfHealingScript;