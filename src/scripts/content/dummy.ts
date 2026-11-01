import type { VideoScript } from '../../engine/types';

const dummyScript: VideoScript = {
    id: 'dummy',
    name: 'Dummy Testing Script',
    width: 1080,
    height: 1920,
    renderThumbnail: (ctx) => {
        // --- 1. Background ---
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, 1080, 1920);
        
        // --- 2. Visuals ---
        // Striking Glowing Checkmark
        ctx.fillStyle = '#5dffb0';
        ctx.font = '900 450px system-ui';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#5dffb0';
        ctx.shadowBlur = 80;
        ctx.fillText('✓', 540, 1100);
        ctx.shadowBlur = 0;
        
        // --- 3. Text (LAST so it's always on top) ---
        ctx.fillStyle = '#ff0055';
        ctx.font = '900 130px system-ui'; // Safe size
        
        // Add dark shadow behind text so it stands out
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 30;
        
        // Use W - 80 for maxWidth to guarantee no cut-offs
        ctx.fillText('IT WORKS!', 540, 450, 1000);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 130px system-ui';
        ctx.fillText('THUMBNAIL', 540, 620, 1000);
        
        // Add thick stroke to text for extra pop
        ctx.lineWidth = 6;
        ctx.strokeStyle = '#000';
        ctx.strokeText('IT WORKS!', 540, 450, 1000);
        ctx.strokeText('THUMBNAIL', 540, 620, 1000);

        ctx.shadowBlur = 0;
    },
    scenes: [
        {
            duration: 5,
            title: 'Test Scene 1',
            text: 'This is a mock script to verify the plugin architecture works properly.',
            render: (ctx, p, el) => {
                ctx.fillStyle = '#222';
                ctx.fillRect(0, 0, 1080, 1920);
                
                const yOffset = p * 100;
                
                ctx.fillStyle = '#fff';
                ctx.font = '80px system-ui';
                ctx.textAlign = 'center';
                ctx.fillText('Mock Script', 540, 960 - 50 + yOffset);
                
                ctx.fillStyle = '#5dffb0';
                ctx.font = '40px system-ui';
                ctx.fillText('Auto-discovery plugin works!', 540, 960 + 50 + yOffset);
            }
        }
    ]
};

export default dummyScript;