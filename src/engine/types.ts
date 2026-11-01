export interface Scene {
    duration: number;
    title: string;
    text: string;
    render: (ctx: CanvasRenderingContext2D, progress: number, timeElapsed: number) => void;
}

export interface VideoScript {
    id: string;
    name: string;
    width: number;
    height: number;
    scenes: Scene[];
    renderBackground?: (ctx: CanvasRenderingContext2D, sceneIndex: number, timeElapsed: number) => void;
    renderThumbnail?: (ctx: CanvasRenderingContext2D) => void;
}