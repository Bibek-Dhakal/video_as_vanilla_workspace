# 🎬 Video as Vanilla JS Framework

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19-61dafb.svg?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6.svg?logo=typescript)

**A high-performance, browser-based video generation studio.** Write video scripts in pure TypeScript using HTML5 Canvas, and export them directly to `.mp4` using WebCodecs and local AI Text-to-Speech—all without a backend server!

## ✨ Features

- 🚀 **Zero-Server Rendering**: Everything runs locally in your browser. No cloud rendering fees, no upload limits.
- 🎨 **Vanilla Canvas Power**: Create complex 2D animations, gradients, physics, and particle systems using standard HTML5 Canvas APIs.
- 🗣️ **Built-in AI TTS**: Uses [Kokoro-JS](https://github.com/huggingface/kokoro.js) for high-quality, on-device Text-to-Speech generation (WebGPU accelerated).
- 📦 **WebCodecs MP4 Export**: Multiplexes raw audio and video frames directly into an H.264 MP4 file that works everywhere (YouTube, TikTok, Instagram).
- 🔌 **Auto-Discovering Plugin Architecture**: Just drop a new `.ts` script file into the `content` folder, and the studio automatically detects and lists it. No wiring required.
- 🤖 **AI-Workflow Native**: Comes with built-in prompt templates designed to help LLMs (like ChatGPT or Claude) write flawless video scripts and Canvas code for you.

## 🚀 Quick Start

Ensure you have [Node.js](https://nodejs.org/) installed, then run:

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev
```

Navigate to `http://localhost:5173/` in your browser. (Note: Desktop Chrome or Edge is required for WebCodecs MP4 export support).

## 📚 Documentation

Dive deeper into how to use and extend the framework:

- 📖 [**Usage Guide: How to Make Videos**](./docs/USAGE_GUIDE.md) - Learn the end-to-end workflow of ideation, generating code with AI, and rendering.
- 🏗️ [**Architecture Overview**](./docs/ARCHITECTURE.md) - Understand how the rendering loop, TTS, and WebCodecs interact.

## 🛠️ How it Works (The Plugin System)

Creating a new video is as simple as adding a new file. Our Vite-powered plugin system uses `import.meta.glob` to instantly hot-reload new scripts.

Simply create a file at `src/scripts/content/my-awesome-video.ts` that exports a `VideoScript` object as its default export, and you're done! No need to update any routers or arrays manually.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/your-username/video_as_vanilla_js_workspace/issues).

## 📝 License

This project is [MIT](./LICENSE) licensed. Copyright © 2026 Bibek Dhakal.