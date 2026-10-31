# 📖 Usage Guide: Making Videos

Welcome to the **Video as Vanilla JS Framework**! This guide will walk you through the process of creating a brand new video from scratch, utilizing our AI-first workflow.

## 🛠️ The 3-Step Workflow

Creating a video is broken down into three main phases:
1. **Brainstorming the Script** (Story & Concept)
2. **Generating the Code** (Canvas & TypeScript)
3. **Rendering & Exporting** (Browser Studio)

---

### Step 1: Brainstorming the Script

We have built a highly specific prompt designed to turn Large Language Models (like ChatGPT, Claude, or Gemini) into your personal video producer.

1. Open the web application (`npm run dev` -> `http://localhost:5173/`).
2. On the home page, click the **"Copy Script Prompt"** button.
3. Paste this prompt into your favorite AI tool.
4. Tell the AI what you want a video about. (e.g., *"Let's make a video about how black holes evaporate via Hawking Radiation."*)
5. Work with the AI iteratively until you get a final JSON structure containing your scenes, durations, and spoken text.

### Step 2: Generating the Code

Once you have your JSON script, it's time to turn it into Canvas animation code.

1. Go back to the web application's home page and click **"Copy Code Prompt"**.
2. Paste this into your AI, and then provide the JSON script you generated in Step 1.
3. The AI will output a fully functional, self-contained TypeScript file.

### Step 3: Dropping in the Plugin

This framework uses an **Auto-Discovering Plugin Architecture**. You do not need to wire up routers or manually import anything.

1. Open your code editor.
2. Navigate to `src/scripts/content/`.
3. Create a new file, for example: `hawking-radiation.ts`.
4. Paste the TypeScript code the AI generated.
5. Save the file.

The Vite dev server will instantly hot-reload, and your new script will magically appear in the web app's script list!

---

## 🎨 Writing Custom Scripts Manually

If you prefer to write the Canvas code yourself, here is the standard template you must follow:

```typescript
import type { VideoScript } from '../../engine/types';

// 1. Define global constants
const W = 1080, H = 1920;

// 2. Define scene renderers
// progress (p) goes from 0.0 to 1.0. Time (t) is raw seconds.
function scene1(ctx: CanvasRenderingContext2D, p: number, t: number) {
    ctx.save();
    
    // Clear background
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, W, H);
    
    // Animate a circle moving across the screen
    const x = p * W; 
    
    ctx.fillStyle = '#38e8ff';
    ctx.beginPath();
    ctx.arc(x, H / 2, 100, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
}

// 3. Export the VideoScript definition
const myScript: VideoScript = {
    id: 'my-first-video',
    name: 'My First Video Short',
    width: W,
    height: H,
    scenes: [
        {
            duration: 5, // Estimated seconds
            title: 'Intro Scene',
            text: 'This is what the AI voice will actually say out loud.',
            render: scene1
        }
    ]
};

// MUST BE DEFAULT EXPORT
export default myScript;
```

## 🎥 Previewing and Exporting

1. Click on your newly created script in the UI.
2. Hit **"Preview with voice"**. The browser's native `SpeechSynthesis` API will read the script while the Canvas loop renders your animations in real-time.
3. When you are happy with the visual timing, click **"Export MP4"**.
   - *Note:* The first time you export, the app will download a ~90MB high-quality AI voice model (`Kokoro-82M-v1.0-ONNX`).
   - You can tick "Use GPU" to process the audio up to 10x faster (requires WebGPU enabled in your browser).
4. Keep the tab open while it renders. Once complete, it will automatically download your `.mp4` file, ready to be uploaded to YouTube Shorts, TikTok, or Instagram!