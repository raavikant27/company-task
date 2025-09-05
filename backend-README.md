# Camera Video Buffering & Clipping System - Backend

A Node.js backend service that continuously buffers camera footage and creates 60-second clips (30s before + 30s after) when triggered.



-  **Continuous Camera Buffering**: Maintains a rolling 60-second buffer
- **Smart Clipping**: Creates clips with 30s before and 30s after trigger
-  **Multiple Camera Support**: USB, RTSP, HTTP cameras
-  **SQLite Database**: Stores clip metadata
-  **Video Streaming**: Serves videos with range request support
-  **RESTful API**: Complete CRUD operations for video clips

## Prerequisites

### Required Software
```bash
# FFmpeg (required for video processing)

# Windows:
# Download from https://ffmpeg.org/download.html
```

## Installation

. **Install Dependencies**
```bash
npm install
``

### Camera Setup

**USB Camera (Default)**
```env

CAMERA_SOURCE=0            # Windows (device index)
```

**RTSP Camera**
```env
RTSP_URL=rtsp://username:password@192.168.1.100:554/stream
```

**HTTP Camera**
```env
HTTP_URL=http://192.168.1.100:8080/video
```

### Test Camera Access
```bash
# Test USB camera
ffmpeg -f v4l2 -i /dev/video0 -t 5 -y test.mp4

# Test RTSP camera
ffmpeg -i rtsp://your-camera-url -t 5 -y test.mp4
```

## Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3001`

## API Endpoints

### Health Check
```http
GET /api/health
```

### Get All Video Clips
```http
GET /api/videos
```

### Get Specific Clip
```http
GET /api/videos/:id
```

### Stream Video
```http
GET /api/videos/:id/stream
```

### Trigger Clip Creation
```http
POST /api/store
```

### Delete Clip
```http
DELETE /api/videos/:id
```



## Troubleshooting

### Common Issues

**1. Camera Access Denied**
```bash
# Add user to video group
sudo usermod -a -G video $USER
# Logout and login again
```

**2. FFmpeg Not Found**
```bash
# Verify FFmpeg installation
ffmpeg -version
which ffmpeg
```

**3. Port Already in Use**
```bash
# Find and kill process using port 3001
sudo lsof -ti:3001 | xargs kill -9
```

**4. Permission Issues**
```bash
# Fix storage permissions
chmod -R 755 storage/
```

### Logs and Debugging

```bash
# View logs in development
npm run dev

# Production logs
npm start > logs/app.log 2>&1 &
```

## Performance Optimization

### For High-Resolution Cameras
```env
# Reduce quality for better performance
FFMPEG_PRESET=ultrafast
FFMPEG_CRF=28
```

### For Multiple Cameras
- Run separate instances on different ports
- Use different storage directories
- Implement load balancing

## Security Considerations

1. **API Key Authentication** (recommended for production)
2. **CORS Configuration** - Update allowed origins
3. **Rate Limiting** - Implement request rate limiting
4. **File Size Limits** - Set maximum clip storage
5. **Network Security** - Use HTTPS in production

## Production Deployment

### Using PM2
```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start server.js --name camera-buffer

# Save PM2 configuration
pm2 save
pm2 startup
```
### Testing
```bash
# Test clip creation
curl -X POST http://localhost:3001/api/store

# Test video list
curl http://localhost:3001/api/videos
```


3. Ensure FFmpeg is properly installed
4. Check storage permissions

## License

MIT License - See LICENSE file for details
