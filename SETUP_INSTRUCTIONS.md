# Complete Installation Guide - Camera Video Buffering System

## 🗂️ Folder Structure

```
project-root/
├── frontend/                     # React Frontend (Current Lovable Project)
│   ├── src/
│   │   ├── components/
│   │   │   ├── VideoManager.tsx
│   │   │   ├── VideoList.tsx
│   │   │   ├── VideoCard.tsx
│   │   │   └── VideoPlayer.tsx
│   │   └── pages/
│   │       └── Index.tsx
│   └── package.json
├── backend/                      # Node.js Backend
│   ├── server.js
│   ├── package.json
│   ├── .env
│   ├── src/
│   │   └── services/
│   │       ├── CameraBuffer.js
│   │       ├── VideoClipper.js
│   │       └── DatabaseService.js
│   └── storage/
│       ├── videos/              # Final clips storage
│       ├── buffer/              # Rolling buffer segments
│       ├── temp/                # Temporary files
│       └── database.db          # SQLite database
└── README.md
```

## 🚀 Quick Setup

### Step 1: Setup Backend

1. **Create backend directory**
```bash
mkdir camera-buffer-backend
cd camera-buffer-backend
```

2. **Copy these files from the Lovable project:**
   - Copy `backend-package.json` → rename to `package.json`
   - Copy `backend-server.js` → rename to `server.js`
   - Copy `backend-env-example` → rename to `.env`

3. **Create services directory and copy files:**
```bash
mkdir -p src/services
```
   - Copy `backend-CameraBuffer.js` → `src/services/CameraBuffer.js`
   - Copy `backend-VideoClipper.js` → `src/services/VideoClipper.js`
   - Copy `backend-DatabaseService.js` → `src/services/DatabaseService.js`

4. **Install FFmpeg (Required!)**
```bash
# Ubuntu/Debian:
sudo apt update && sudo apt install ffmpeg

# macOS:
brew install ffmpeg

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

3. **View in Frontend**: Open your Lovable preview and click "Store Clip"

## ⚙️ Configuration

### Camera Setup (.env file)

**USB Camera (Default)**
```env
CAMERA_SOURCE=/dev/video0
```

**IP/RTSP Camera**
```env
RTSP_URL=rtsp://username:password@192.168.1.100:554/stream
```

### Test Your Camera
```bash
# Test USB camera
ffmpeg -f v4l2 -i /dev/video0 -t 5 test.mp4

# List available cameras (Linux)
v4l2-ctl --list-devices
```

## 🔧 Development vs Production

### Development
- Uses mock data in frontend for immediate testing
- Backend runs on localhost:3001
- Frontend runs on localhost:8080

### Production
- Replace mock data with actual API calls
- Use actual camera streams
- Deploy backend to cloud service
- Update CORS settings

## 📝 Key Features Implemented

### Backend
✅ Continuous camera buffering (60-second rolling buffer)  
✅ Smart video clipping (30s before + 30s after trigger)  
✅ RESTful API endpoints  
✅ SQLite database for metadata  
✅ Video streaming with range support  
✅ Multiple camera source support  

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

## 🎯 Next Steps

1. **Test with real camera**: Connect USB camera or configure RTSP
2. **Customize settings**: Adjust buffer duration, clip length
3. **Add features**: Thumbnails, metadata, user authentication
4. **Deploy**: Use PM2, Docker, or cloud services
5. **Monitor**: Add logging, health checks, alerts

## 💡 Tips

- Start with USB camera for easiest setup
- Monitor storage space (clips can be large)
- Use SSD for better video I/O performance
- Consider hardware encoding for high-resolution cameras

The system is ready to use! The frontend shows a beautiful interface with mock data, and the backend will handle actual camera buffering and clipping once you connect a camera.