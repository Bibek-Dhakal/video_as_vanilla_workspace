import type { VideoScript } from '../engine/types';
import { selfHealingScript } from './selfHealing';

export const dummyScript: VideoScript = {
    id: 'dummy',
    name: 'Dummy Testing Script',
    width: 1080,
    height: 1920,
    scenes: [
        {
            duration: 5,
            title: 'Test Scene 1',
            text: 'This is a mock script to verify the script selection works properly.',
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
                ctx.fillText('Render works seamlessly!', 540, 960 + 50 + yOffset);
            }
        }
    ]
};

export const SCRIPTS: VideoScript[] = [
    selfHealingScript,
    dummyScript
];