# Medical Aesthetics Social Media Management System

A comprehensive system for managing social media content for medical aesthetics brands (P-Plasma, AestheFill, Hera). This project integrates Google Workspace automation, local Node.js scripts, and a web-based visual dashboard to streamline content creation, planning, and tracking.

> **🆕 Latest Updates (2025-12)**
> - ✅ Integrated with **AI Pro (Gemini 3 Pro, Veo 3.1, Nano Banana)**
> - ✅ Express 5 compatibility
> - ✅ Unified utils.js logger module
> - ✅ Jules AI code quality refactoring

## 🚀 Features

*   **Visual Board**: A web-based dashboard to monitor monthly goals, visual identity, and content progress.
*   **Automation Scripts**: Node.js scripts to sync local Markdown planning files with Google Sheets and Google Slides.
*   **AI Pro Integration**: Leverages Gemini 3 Pro for copy, Veo 3.1 for video, Nano Banana for images.
*   **Centralized Planning**: A set of Markdown files in the `Planning/` directory that serves as the single source of truth.

## 📂 Repository Structure

```text
.
├── Planning/                   # Documentation, strategies, and AI workflows
│   ├── Master_Command_Center.md          # Central hub for operations & progress tracking
│   ├── AI_Team_Workflow.md               # AI roles, prompts, and workflows
│   ├── Project_Requirements_Strategy.md  # Brand strategy, target audience, and requirements
│   ├── Tone_and_Manner_Visuals.md        # Visual guidelines and mood boards
│   ├── SYSTEM_DOCUMENTATION.md           # Detailed system documentation
│   └── ...
├── Scripts/                    # Node.js automation scripts
│   ├── sync-sheets.js          # Syncs Markdown tables to Google Sheets
│   ├── sync-slides.js          # Syncs content to Google Slides
│   ├── generate-copy.js        # Generates draft copy using AI
│   └── ...
├── visual-board/               # Web-based visual dashboard application
│   ├── server.js               # Express server for the board
│   ├── index.html              # Dashboard frontend
│   └── ...
├── VISUAL_BOARD_CENTER.md      # Quick access guide and "War Room" document
└── package.json                # Project dependencies and scripts
```

## 🛠️ Setup & Installation

1.  **Prerequisites**: Ensure you have Node.js installed.
2.  **Install Dependencies**:
    ```bash
    npm install
    ```
3.  **Google Cloud Setup**:
    *   Ensure you have the necessary Google Cloud credentials configured if you intend to use the synchronization scripts. The scripts typically look for credential files or tokens to authenticate with Google APIs.

## 💻 How to Run

### Visual Board
To start the web-based visual dashboard:
```bash
npm run board
# OR
node visual-board/server.js
```
Then open your browser at the address specified in the console (usually `http://localhost:3000`).

### Automation Scripts
Run scripts directly using Node.js from the root directory:

*   **Sync Sheets**: Updates Google Sheets with data from `Master_Command_Center.md`.
    ```bash
    node Scripts/sync-sheets.js
    ```
*   **Sync Slides**: Updates Google Slides with content.
    ```bash
    node Scripts/sync-slides.js
    ```
*   **Format Sheets**: Beautifies the Google Sheet.
    ```bash
    node Scripts/format-sheets.js
    ```

## 📄 Key Planning Documents

The `Planning/` folder contains the core intelligence of the system:

*   **`Master_Command_Center.md`**: The main operational interface. Contains the content calendar, progress tracker, and links to all other documents. This file is often synced to Google Sheets.
*   **`AI_Team_Workflow.md`**: Defines the roles of the "AI Team" (e.g., Strategy Planner, Content Marketing Chief), their tools, and the specific prompts to use for generating content.
*   **`Project_Requirements_Strategy.md`**: Outlines the high-level strategy, B2B focus, and unique selling points for each brand.
*   **`Tone_and_Manner_Visuals.md`**: Provides visual references, color codes, and keywords for each brand to ensure consistency.
*   **`SYSTEM_DOCUMENTATION.md`**: A detailed technical and operational guide for the entire system (in Traditional Chinese).

## 🔗 Quick Links
*   [Visual Board Center](./VISUAL_BOARD_CENTER.md)
*   [Planning Folder](./Planning/)
*   [Scripts Folder](./Scripts/)
