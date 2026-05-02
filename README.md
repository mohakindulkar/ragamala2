# 🎨 Ragamala: An Interactive Digital Archive

Ragamala is an experimental interactive archive and pedagogical tool that explores the intersection of traditional Indian miniature paintings, classical music (Ragas), and emerging technologies. 
The project utilizes Svelte 5, D3.js, and Augmented Reality (AR) to visualize the complex family trees (Ancestry) of Ragas and their seasonal/temporal associations.

* **Live Preview:** [voidit.github.io/ragamala/](https://voidit.github.io/ragamala/)
* **Repository:** [github.com/voidit/ragamala](https://github.com/voidit/ragamala)

---

## 🛠 Developer Quickstart

### Prerequisites
- Node.js (Latest LTS version recommended)
- A package manager: `npm` (standard), `pnpm`, or `yarn`

### 1. Fork and Clone
1. Navigate to the [repository](https://github.com/voidit/ragamala).
2. Click the **Fork** button in the top-right corner to create your own copy.
3. Clone your fork locally:
```sh
git clone https://github.com/YOUR_USERNAME/ragamala.git
cd ragamala
```
### 2. Local Installation
Install the necessary dependencies:
```sh
npm install
```

### 3. Development Server
Run the project in development mode. The site will be available at http://localhost:5173.
```sh
npm run dev
```

### 4. Building and Testing
Before submitting changes, ensure the project builds correctly:
```sh
npm run build
npm run preview # Test the production build locally
```
## 🏷️ File Naming Conventions

To maintain a clean and automated archive, all asset filenames must be **lowercase**, use **kebab-case** (hyphens instead of spaces), and match the `id` or `name` used in the JSON data.

| Asset Type | Convention | Example |
| :--- | :--- | :--- |
| **Images** | `[raga-name].jpg` | `todi-ragini.jpg` |
| **Videos** | `[raga-name].mp4` | `todi-ragini.mp4` |
| **Mind Files**| `[raga-name].mind` | `todi-ragini.mind` |

### Rules for Naming:
1. **Lowercase Only:** Never use capital letters (e.g., use `bhairavi.mp4`, NOT `Bhairavi.mp4`).
2. **No Spaces:** Use hyphens `-` to separate words (e.g., `hindol-ragini.mind`).
3. **Consistency:** The filename must be identical across all three formats. If the painting is "Deepak Raga," the files must be `deepak-raga.jpg`, `deepak-raga.mp4`, and `deepak-raga.mind`.
4. **No Special Characters:** Avoid symbols like `&`, `@`, or `.` (except for the file extension).
---

## 📹 Video Optimization Guide

All videos must be optimized for the web to ensure smooth playback and fast loading times across devices.

### Recommended Settings
- **Format:** MP4 (H.264 / AVC)
- **Resolution:** 1080p (1920x1080) maximum; 720p is often sufficient for mobile AR.
- **Frame Rate:** 24fps or 30fps.
- **Bitrate:** 2 Mbps to 5 Mbps (Target a small file size without visible artifacts).
- **Audio:** AAC, 128kbps (or remove audio if the video is silent to save space).

### Step-by-Step Optimization (using Handbrake)
1. Download and open [Handbrake](https://handbrake.fr/).
2. Drag your video file into the window.
3. In the **Summary** tab, ensure the format is set to **MP4** and check the **Web Optimized** box.
4. In the **Video** tab:
    - Set Video Codec to **H.264**.
    - Set Framerate to **Same as source** (or 30).
    - Set Constant Quality to **22-24 RF** (Higher numbers result in lower quality but smaller files).
5. In the **Audio** tab:
    - If the painting doesn't need sound, click "Clear" to remove the audio track.
6. Click **Start Encode**.

### Automated Optimization (FFmpeg Command Line)
If you have `ffmpeg` installed, you can use this command to optimize your video quickly:
```sh
ffmpeg -i input.mp4 -vcodec libx264 -crf 24 -pix_fmt yuv420p -movflags +faststart -an output.mp4
```
### Why these settings matter:
* **Web Optimized / Fast Start:** This moves the "metadata" of the video to the beginning of the file. Without this, a browser might have to download the *entire* 10MB file before it shows the first frame.
* **RF 22-24:** This is the "sweet spot" for H.264. It keeps the intricate details of the miniature paintings (brushstrokes, gold leaf) sharp while significantly reducing the heavy data load of uncompressed video.
* **YUV420P:** This ensures the video is compatible with older mobile browsers and Chrome's rendering engine.
----

## 🖼 How to Add New Paintings & AR Assets
Collaborators adding individual paintings must provide two core assets: a Video File (.mp4) and a MindAR Tracking File (.mind).

### Step 1: Create the .mind Tracking File
We use **MindAR** to anchor digital content to physical or digital images.
1. Go to the [MindAR Image Target Compiler](https://hiukim.github.io/mind-ar-js-doc/tools/compile).
2. Upload the high-resolution static image (`.jpg`).
3. Click **Start** to generate the tracking data.
4. Download the resulting `.mind` file.

### Step 2: Organize Assets
Place your new files into the following public directories:
- **Images:** `/static/images/paintings/todi-ragini.jpg`
- **Videos:** `/static/videos/todi-ragini.mp4`
- **AR Targets:** `/static/targets/todi-ragini.mind`

### Step 3: Update the Data
To link these assets to the interactive tree, find the relevant JSON entry in src/lib/data/ (e.g., deepak.json or your project's equivalent). Update or add the node:
```json
{
  "name": "Todi Ragini",
  "season": "Vasanta",
  "video": "/videos/todi-ragini.mp4",
  "mindTarget": "/targets/todi-ragini.mind",
  "description": "Describe the mood and musicality here..."
}
```

### Why these conventions matter:
* **Case Sensitivity:** Linux-based hosting (like GitHub Pages) treats `Image.jpg` and `image.jpg` as two different files. Using all lowercase removes this common error.
* **URL Safety:** Spaces in filenames result in `%20` in the browser, which can break the D3.js data binding.
* **Scalability:** With these rules, we could eventually write a script that automatically generates the JSON entries just by reading the contents of the `/static` folders.
-----
## 🔄 Contributing (Pull Requests)
1. **Branch:** Create a new branch for your feature: git checkout -b feature/add-todi-painting.
2. **Commit:** Use descriptive commit messages: git commit -m "Add Todi Ragini AR assets and data entry".
3. **Push:** Push the branch to your fork: git push origin feature/add-todi-painting.
4. **PR:** Open a Pull Request on the main Ragamala repository. Provide screenshots or a short description of the painting you added.

----
## 📜 Core Architecture Note
* **Svelte 5 & D3.js:** The project uses Svelte 5's new reactivity system ($state, $derived, $effect) to manage the interactive D3 tree.
* **The "Pizza Hub":** The central circular interface on the homepage uses custom D3 arc math to map seasonal wedges.
* **Universal Translation:** A custom "Harvester" utility scrapes the DOM after Google Translate runs, ensuring the D3 labels update dynamically across all languages.

#### Created by: 
* Irena Romendik
* _add your name here_
