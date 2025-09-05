# Complete Installation Guide - Camera Video Buffering System


└── README.md
```

## 🚀 Quick Setup

### Step 1: Setup Backend

1. **Create backend directory**
```bash
mkdir camera-buffer-backend
cd camera-buffer-backend
```

2. ** these fill project:**
   - Copy `backend-package.json` → rename to `package.json`
   - Copy `backend-server.js` → rename to `server.js`
   - Copy `backend-env-example` → rename to `.env`

3. **Create services directory and copy files:**
```bash
mkdir -p src/services
```
   -  `backend-CameraBuffer.js` 
   -  `backend-VideoClipper.js` 
   -  `backend-DatabaseService.js`

4. **Install FFmpeg (Required!)**
```bash

# Windows: Download from https://ffmpeg.org
```

5. **Install dependencies and start**
```bash
npm install
npm run dev
```

### Step 2: Setup Frontend (Already Done!)
The frontend is already running in your current Lovable project! Just make sure the backend URL in `VideoManager.tsx` matches your backend (default: `http://localhost:3001/api`).

### Step 3: Test the System

1. **Backend Health Check**
```bash
curl http://localhost:3001/api/health
```

2. **Trigger a Clip**
```bash
curl -X POST http://localhost:3001/api/store
```

3. **View in Frontend**: click "Store Clip"

## ⚙️ Configuration

### Camera Setup (.env file)

**USB Camera (Default)**
```env
CAMERA_SOURCE=/dev/video0
```
## 🔧 Development vs Production

### Development
- Uses mock data in frontend for immediate testing
- Backend runs on localhost:3001
- Frontend runs on localhost:8080

## 📝 Key Features Implemented

### Backend
✅ Continuous camera buffering (60-second rolling buffer)  
✅ Smart video clipping (30s before + 30s after trigger)  
✅ RESTful API endpoints  
✅ SQLite database   
✅ Video streaming with range support  
 

### Frontend
✅ Beautiful video management interface  
✅ Real-time clip listing  
✅ Video player with controls  
✅ Store clip trigger button  
✅ Responsive design  
✅ Loading states and error handling  

## 🚨 Common Issues & Solutions

**1. "Camera not found"**
- Check camera permissions: `sudo usermod -a -G video $USER`
- Verify camera path: `ls /dev/video*`

**2. "FFmpeg not found"**
- Install FFmpeg: `sudo apt install ffmpeg`
- Verify: `ffmpeg -version`

**3. "Port 3001 already in use"**
- Kill process: `sudo lsof -ti:3001 | xargs kill -9`
- Or change port in `.env`

**4. "CORS errors"**
- Update CORS origins in `server.js`
- Check frontend API base URL

## 📋 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | System status |
| GET | `/api/videos` | List all clips |
| GET | `/api/videos/:id` | Get clip details |
| GET | `/api/videos/:id/stream` | Stream video |
| POST | `/api/store` | Trigger clip creation |
| DELETE | `/api/videos/:id` | Delete clip |

