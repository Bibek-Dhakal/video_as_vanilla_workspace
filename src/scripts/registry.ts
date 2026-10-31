import type { VideoScript } from '../engine/types';

// Vite specific: import all TypeScript files from the content directory
const modules = import.meta.glob('./content/*.ts', { eager: true });

export const SCRIPTS: VideoScript[] = Object.values(modules)
    .map((mod: any) => mod.default as VideoScript)
    .filter((script) => script && script.id && script.scenes);