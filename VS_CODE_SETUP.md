# VS Code Setup Guide - Camera Video Buffering System

## 📋 Prerequisites

1. **Install Required Software**
```bash


# FFmpeg (Required for video processing)
# Windows: Download from https://ffmpeg.org/download.html


# Git
# Download from: https://git-scm.com/
```

2. **Install VS Code Extensions (Recommended)**
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- TypeScript Importer
- Thunder Client (for API testing)

## 🚀 Project Setup

### Step 1: Create Project Directory
```bash
# Create main project folder
mkdir camera-video-system
cd camera-video-system
```

### Step 2: Setup Frontend
```bash
# Clone or download frontend code
mkdir frontend
cd frontend

# Initialize React project with Vite
npm create vite@latest . -- --template react-ts
npm install

# Install required dependencies
npm install @radix-ui/react-slot @radix-ui/react-toast @radix-ui/react-dialog @radix-ui/react-avatar
npm install class-variance-authority clsx tailwind-merge tailwindcss-animate
npm install lucide-react sonner
npm install @tanstack/react-query
npm install react-router-dom

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Step 3: Setup Backend
```bash
# Go back to main directory
cd ..

# Create backend directory
mkdir backend
cd backend

# Copy package.json content (from backend-package.json)
# Create package.json with this content:
```

```json
{
  "name": "camera-buffer-backend",
  "version": "1.0.0",
  "description": "Camera video buffering and clipping system backend",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": ["camera", "video", "buffer", "streaming", "ffmpeg"],
  "author": "",
  "license": "MIT",
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "multer": "^1.4.5-lts.1",
    "sqlite3": "^5.1.6",
    "node-ffmpeg": "^0.6.13",
    "ws": "^8.14.2",
    "uuid": "^9.0.1",
    "dotenv": "^16.3.1",
    "helmet": "^7.1.0",
    "morgan": "^1.10.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
```

```bash
# Install backend dependencies
npm install

# Create services directory
mkdir -p src/services

# Create storage directories
mkdir -p storage/videos storage/buffer storage/temp
```


## 🔧 VS Code Configuration

### Step 5: Open in VS Code
```bash
# Open the main project folder in VS Code
code camera-video-system
```

### Step 6: VS Code Workspace Settings
Create `.vscode/settings.json`:
```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "tailwindCSS.includeLanguages": {
    "typescript": "typescript",
    "typescriptreact": "typescriptreact"
  },
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
```

### Step 7: VS Code Tasks (Optional)
Create `.vscode/tasks.json`:
```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Start Frontend",
      "type": "shell",
      "command": "npm run dev",
      "group": "build",
      "options": {
        "cwd": "${workspaceFolder}/frontend"
      },
      "presentation": {
        "echo": true,
        "reveal": "always",
        "panel": "new"
      }
    },
    {
      "label": "Start Backend",
      "type": "shell",
      "command": "npm run dev",
      "group": "build",
      "options": {
        "cwd": "${workspaceFolder}/backend"
      },
      "presentation": {
        "echo": true,
        "reveal": "always",
        "panel": "new"
      }
    }
  ]
}
```

## 🏃 Running the Project

### Method 1: Using VS Code Terminal
```bash
# Terminal 1 - Start Backend
cd backend
npm run dev

# Terminal 2 - Start Frontend  
cd frontend
npm run dev
```

### Method 2: Using VS Code Tasks
1. Press `Ctrl+Shift+P` (Windows) or `Cmd+Shift+P` (Mac)
2. Type "Tasks: Run Task"
3. Select "Start Backend" or "Start Frontend"

## 📁 Final Folder Structure
```
camera-video-system/
├── frontend/                    # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── VideoManager.tsx
│   │   │   ├── VideoList.tsx
│   │   │   ├── VideoCard.tsx
│   │   │   ├── VideoPlayer.tsx
│   │   │   └── ui/             # shadcn components
│   │   ├── pages/
│   │   │   └── Index.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.ts
├── backend/                     # Node.js Backend
│   ├── src/
│   │   └── services/
│   │       ├── CameraBuffer.js
│   │       ├── VideoClipper.js
│   │       └── DatabaseService.js
│   ├── storage/
│   │   ├── videos/
│   │   ├── buffer/
│   │   └── temp/
│   ├── server.js
│   ├── package.json
│   └── .env
└── .vscode/
    ├── settings.json
    └── tasks.json
```

## 🧪 Testing the Setup

1. **Test Backend:**
   - Open `http://localhost:3001/api/health`
   - Should return system status

2. **Test Frontend:**
   - Open `http://localhost:8080`
   - Should show video management interface

3. **Test API:**
   - Click "Store Clip" button
   - Check if clip appears in video list



