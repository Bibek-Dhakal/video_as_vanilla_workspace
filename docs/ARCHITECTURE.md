# 🏗️ Architecture Overview

This project is entirely client-side, pushing the boundaries of modern browser APIs to generate fully encoded MP4 files with studio-quality audio, entirely offline after the initial load.

## Core Technologies

- **React Router & Vite**: UI layout, hot-module replacement (HMR), and dynamic file globbing (`import.meta.glob`).
- **HTML5 Canvas (2D Context)**: High-performance, imperative drawing API for all visual generation.
- **WebCodecs (`VideoEncoder`, `AudioEncoder`)**: Native browser APIs for encoding raw frames and PCM audio into compressed streams (H.264 & AAC).
- **Kokoro-JS (ONNX)**: In-browser inference of a state-of-the-art TTS model.
- **MP4-Muxer**: A lightweight WebAssembly/JS library that multiplexes encoded video and audio chunks into a valid MP4 container.

## How the Engine Works

### 1. The Plugin System
Scripts are placed in `src/scripts/content/*.ts`. `registry.ts` uses Vite's glob import to bundle them. The UI parses this array and renders a grid. Because of this, adding/removing files never causes "Module Not Found" crashes.

### 2. Live Preview Mode (`VideoEngine.ts`)
When the user clicks "Preview with voice":
1. The engine instantiates `SpeechSynthesisUtterance` for the current scene's text.
2. It hooks into the `onboundary` event to accurately highlight subtitles as words are spoken.
3. A `requestAnimationFrame` loop drives the Canvas rendering, passing in the normalized `progress` (`0.0` to `1.0`) based on the scene's estimated duration.

### 3. MP4 Export Workflow (`VideoExporter.ts`)
This is where the magic happens. The export process detaches from real-time constraints:

1. **Audio Generation**: 
   - Downloads/loads the Kokoro TTS ONNX model.
   - Iterates over every scene and generates raw floating-point audio data (PCM).
   - Resamples audio using an `OfflineAudioContext` to standard `48000Hz`.

2. **Encoder Setup**:
   - Initializes an `mp4-muxer` target in memory (`ArrayBufferTarget`).
   - Probes `VideoEncoder` for `H.264` support, configuring for 1080x1920 at 30 FPS.
   - Probes `AudioEncoder` for `AAC` (or fallback `Opus`).

3. **Rendering the Video**:
   - The engine iterates frame by frame (at 30 frames per second).
   - For frame `N`, it calculates exact timestamps, determines the active scene, and runs the Canvas `render()` function.
   - Grabs the canvas pixels using `new VideoFrame(canvas)`.
   - Sends the frame to the `VideoEncoder`.
   - A queue-management loop ensures the encoder doesn't choke on backpressure.

4. **Finalization**:
   - Flushes both encoders.
   - Muxer finalizes the MP4 atom structure.
   - Triggers a Blob download of the final video file.