import type {VideoScript} from '../../engine/types';

// 1. Scene constants and utility functions
const W = 1080, H = 1920;

// Helper to draw a glowing grid background
function renderGlobalBackground(ctx: CanvasRenderingContext2D, _sceneIndex: number, t: number) {
    ctx.save();
    // Deep cosmic dark blue/black background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, '#030712');
    bgGrad.addColorStop(0.5, '#0b0f19');
    bgGrad.addColorStop(1, '#020408');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Subtle perspective grid lines
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.05)';
    ctx.lineWidth = 2;
    const gridSize = 120;
    const offset = (t * 20) % gridSize;

    ctx.beginPath();
    for (let x = 0; x <= W; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
    }
    for (let y = offset; y <= H; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
    }
    ctx.stroke();
    ctx.restore();
}

// -------------------------------------------------------------------------
// Scene 1: The Simulation's Lazy Shortcut (Hook / Wireframe Pop-in)
// -------------------------------------------------------------------------
function scene1(ctx: CanvasRenderingContext2D, p: number, _t: number) {
    ctx.save();

    // Title / Topic Label
    ctx.fillStyle = 'rgba(0, 240, 255, 0.8)';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('THE SIMULATION LAZY SHORTCUT', W / 2, 200);

    // Camera whip-pan / scaling effect based on progress
    const scale = 0.8 + (p * 0.2);
    ctx.translate(W / 2, H / 2);
    ctx.scale(scale, scale);
    ctx.translate(-W / 2, -H / 2);

    // Centerpiece: 3D Wireframe terrain/mountain transforming into solid objects
    const centerX = W / 2;
    const centerY = H / 2 + 100;
    const wireframeProgress = Math.min(1, p * 1.5);

    // Draw wireframe grid mountain peaks
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 15;

    for (let i = -3; i <= 3; i++) {
        const xOffset = i * 160;
        const heightFactor = Math.abs(i) === 3 ? 150 : Math.abs(i) === 2 ? 280 : 400;

        ctx.beginPath();
        ctx.moveTo(centerX + xOffset - 80, centerY + 200);
        ctx.lineTo(centerX + xOffset, centerY + 200 - heightFactor);
        ctx.lineTo(centerX + xOffset + 80, centerY + 200);
        ctx.closePath();

        if (wireframeProgress > 0.6) {
            // Fill in solid texture as progress completes
            ctx.fillStyle = `rgba(15, 23, 42, ${(wireframeProgress - 0.6) * 2.5})`;
            ctx.fill();
        }
        ctx.stroke();
    }

    // Floating text prompt popup
    if (p > 0.4) {
        const alpha = Math.min(1, (p - 0.4) * 3);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = 'rgba(0, 255, 128, 0.15)';
        ctx.strokeStyle = '#00ff80';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#00ff80';
        ctx.fillRect(W / 2 - 350, H - 450, 700, 100);
        ctx.strokeRect(W / 2 - 350, H - 450, 700, 100);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 32px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('⚡ CHUNK LOADED: [ACTIVE VIEWPORT]', W / 2, H - 390);
        ctx.restore();
    }

    ctx.restore();
}

// -------------------------------------------------------------------------
// Scene 2: Frustum Culling (Split Screen / Invisible Trees)
// -------------------------------------------------------------------------
function scene2(ctx: CanvasRenderingContext2D, p: number, _t: number) {
    ctx.save();

    // Header
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 42px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('FRUSTUM CULLING', W / 2, 220);

    // Split line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(W / 2, 300);
    ctx.lineTo(W / 2, H - 500);
    ctx.stroke();

    // Left Side: Developer Viewport Cone
    ctx.save();
    ctx.fillStyle = 'rgba(0, 240, 255, 0.8)';
    ctx.font = '28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Developer Engine View', W / 4, 300);

    // Draw Camera Cone
    ctx.strokeStyle = '#ff0055';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(W / 4 - 150, H / 2 + 100);
    ctx.lineTo(W / 4 + 150, H / 2 - 100);
    ctx.lineTo(W / 4 + 150, H / 2 + 300);
    ctx.closePath();
    ctx.stroke();
    ctx.fillStyle = 'rgba(255, 0, 85, 0.05)';
    ctx.fill();
    ctx.restore();

    // Right Side: Minimalist Forest (Trees fading when unseen)
    ctx.save();
    ctx.fillStyle = '#00ff80';
    ctx.font = '28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Unobserved Area (Culled)', (W / 4) * 3, 300);

    const treeX = (W / 4) * 3;
    const treeY = H / 2 + 100;
    const alphaTree = p > 0.5 ? Math.max(0, 1 - (p - 0.5) * 4) : 1;

    ctx.globalAlpha = alphaTree;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(treeX - 15, treeY, 30, 100); // Trunk

    ctx.fillStyle = '#00ff80';
    ctx.shadowColor = '#00ff80';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(treeX, treeY - 40, 60, 0, Math.PI * 2);
    ctx.fill();

    if (alphaTree <= 0.1 && p > 0.7) {
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#ff0055';
        ctx.font = 'bold 36px monospace';
        ctx.fillText('0 BYTES RENDERED', treeX, treeY);
    }
    ctx.restore();

    ctx.restore();
}

// -------------------------------------------------------------------------
// Scene 3: Quantum Physics (Double-Slit Experiment)
// -------------------------------------------------------------------------
function scene3(ctx: CanvasRenderingContext2D, p: number, t: number) {
    ctx.save();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 42px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('THE DOUBLE-SLIT EXPERIMENT', W / 2, 220);

    const centerX = W / 2;
    const centerY = H / 2;

    // Slits barrier
    ctx.fillStyle = '#64748b';
    ctx.fillRect(centerX - 10, centerY - 300, 20, 220);
    ctx.fillRect(centerX - 10, centerY + 80, 20, 220);

    // Particle waves flowing through
    const waveOffset = (t * 300) % W;
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 4;
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 12;

    for (let i = 0; i < 5; i++) {
        const radius = ((waveOffset + i * 100) % 400);
        ctx.beginPath();
        ctx.arc(centerX, centerY - 40, radius, -Math.PI / 3, Math.PI / 3);
        ctx.stroke();
    }

    // Collapse state on right side
    if (p > 0.5) {
        ctx.fillStyle = '#ff0055';
        ctx.shadowColor = '#ff0055';
        ctx.shadowBlur = 20;
        for (let i = -4; i <= 4; i++) {
            ctx.beginPath();
            ctx.arc(centerX + 300, centerY + (i * 50), 10, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    ctx.restore();
}

// -------------------------------------------------------------------------
// Scene 4: Reality Rendering Engine (Wave function collapse)
// -------------------------------------------------------------------------
function scene4(ctx: CanvasRenderingContext2D, _p: number, t: number) {
    ctx.save();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 40px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('REALITY COMPUTATION ENGINE', W / 2, 220);

    const centerX = W / 2;
    const centerY = H / 2;

    // Glowing Cursor / Observer
    const cursorX = centerX + Math.sin(t * 3) * 200;
    const cursorY = centerY + Math.cos(t * 2) * 150;

    // Grid matrix
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.2)';
    ctx.lineWidth = 2;
    for (let x = -3; x <= 3; x++) {
        for (let y = -3; y <= 3; y++) {
            ctx.strokeRect(centerX + x * 90 - 40, centerY + y * 90 - 40, 80, 80);
        }
    }

    // Observer Eye / Cursor Ring
    ctx.strokeStyle = '#00ff80';
    ctx.lineWidth = 4;
    ctx.shadowColor = '#00ff80';
    ctx.shadowBlur = 25;
    ctx.beginPath();
    ctx.arc(cursorX, cursorY, 50 + Math.sin(t * 10) * 5, 0, Math.PI * 2);
    ctx.stroke();

    // Solid object appearing where cursor hits
    ctx.fillStyle = 'rgba(0, 240, 255, 0.3)';
    ctx.fillRect(cursorX - 40, cursorY - 40, 80, 80);

    ctx.restore();
}

// -------------------------------------------------------------------------
// Scene 5: Conclusion (Tree drops out / Takeaway)
// -------------------------------------------------------------------------
function scene5(ctx: CanvasRenderingContext2D, p: number, _t: number) {
    ctx.save();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('NO OBSERVER = NO RENDER', W / 2, 220);

    const centerX = W / 2;
    const centerY = H / 2 + 100;

    // Disintegrating Tree into pixels
    const pixelate = p > 0.4 ? (p - 0.4) * 20 : 0;

    ctx.save();
    ctx.translate(centerX, centerY);

    if (p < 0.7) {
        // Tree trunk
        ctx.fillStyle = '#475569';
        ctx.fillRect(-20, 0, 40, 200);

        // Tree foliage
        ctx.fillStyle = '#059669';
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(0, -60, 100, 0, Math.PI * 2);
        ctx.fill();
    } else {
        // Pixel explosion / code fragments
        ctx.fillStyle = '#00f0ff';
        for (let i = 0; i < 40; i++) {
            const angle = (i / 40) * Math.PI * 2;
            const dist = pixelate * 40 + (i * 5);
            ctx.fillRect(Math.cos(angle) * dist, Math.sin(angle) * dist, 12, 12);
        }
    }

    ctx.restore();

    // Final punchline text overlay
    if (p > 0.6) {
        ctx.fillStyle = '#ff0055';
        ctx.font = 'bold 44px sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#ff0055';
        ctx.shadowBlur = 20;
        ctx.fillText('UNRENDERED UNIVERSE', W / 2, H - 300);
    }

    ctx.restore();
}

function renderThumb(ctx: CanvasRenderingContext2D) {
    // --- 1. Background ---
    renderGlobalBackground(ctx, 0, 0);

    // --- 2. Visuals ---
    const centerX = W / 2;
    const centerY = H / 2 + 150;

    // Giant glowing eye of the observer
    ctx.strokeStyle = '#00ff80';
    ctx.lineWidth = 20;
    ctx.shadowColor = '#00ff80';
    ctx.shadowBlur = 80;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, 350, 180, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#00ff80';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 90, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.shadowBlur = 0;

    // Glitchy Wireframe Overlay
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
    ctx.lineWidth = 8;
    for(let i = 0; i < 15; i++) {
        ctx.strokeRect(Math.random() * W, Math.random() * H, 120 + Math.random() * 100, 120 + Math.random() * 100);
    }

    // --- 3. Text (LAST to sit strictly on top) ---
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 120px sans-serif'; // Reduced font size to be safe
    ctx.textAlign = 'center';
    
    // Add thick black shadow for readability
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 40;
    
    // Pass W - 80 max constraint
    ctx.fillText('THE UNIVERSE', W / 2, 280, W - 80);
    
    ctx.fillStyle = '#ff0055';
    ctx.font = '900 120px sans-serif'; // Must re-apply before measuring/drawing
    ctx.fillText('IS LAZY.', W / 2, 450, W - 80);
    
    // Add thick stroke around text to pop off bright backgrounds
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#000000';
    ctx.strokeText('THE UNIVERSE', W / 2, 280, W - 80);
    ctx.strokeText('IS LAZY.', W / 2, 450, W - 80);

    ctx.shadowBlur = 0;
}

// 3. Script Definition Export
const scriptDefinition: VideoScript = {
    id: "the-simulations-lazy-shortcut",
    name: "The Simulation's Lazy Shortcut",
    width: W,
    height: H,
    renderBackground: renderGlobalBackground,
    renderThumbnail: renderThumb,
    scenes: [
        {
            duration: 7,
            title: "Scene 1: Hook",
            text: "Your computer doesn’t actually render the world until you look at it—and weirdly enough, neither does the universe.",
            render: scene1
        },
        {
            duration: 9,
            title: "Scene 2: Frustum Culling",
            text: "To save processing power, game developers use 'frustum culling'—meaning if a tree falls in a forest and nobody is looking at it, the computer literally stops drawing it.",
            render: scene2
        },
        {
            duration: 8,
            title: "Scene 3: Quantum Physics",
            text: "But here’s where it gets terrifying. In quantum physics, the famous 'double-slit experiment' shows subatomic particles behave like invisible waves of probability until someone actually measures them.",
            render: scene3
        },
        {
            duration: 9,
            title: "Scene 4: Reality Computation",
            text: "Just like a video game rendering engine, reality refuses to spend energy calculating the universe until an observer forces it to load.",
            render: scene4
        },
        {
            duration: 7,
            title: "Scene 5: Takeaway",
            text: "Which means the old philosophical question is wrong. If a tree falls in a forest, it doesn’t make a sound—because the computer hadn't rendered it yet.",
            render: scene5
        }
    ]
};

export default scriptDefinition;