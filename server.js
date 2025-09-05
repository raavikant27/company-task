const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const morgan = require('morgan');
const { v4: uuidv4 } = require('uuid');
const CameraBuffer = require('./src/services/CameraBuffer');
const VideoClippper = require('./src/services/VideoClipper');
const DatabaseService = require('./src/services/DatabaseService');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(morgan('combined'));
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static video files
app.use('/videos', express.static(path.join(__dirname, 'storage/videos')));

// Initialize services
const cameraBuffer = new CameraBuffer();
const videoClipper = new VideoClippper();
const db = new DatabaseService();

// Initialize database and start camera buffer
async function initialize() {
  try {
    await db.initialize();
    await cameraBuffer.start();
    console.log('✅ Camera buffer system initialized');
  } catch (error) {
    console.error('❌ Failed to initialize system:', error);
    process.exit(1);
  }
}

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    bufferStatus: cameraBuffer.isActive(),
    bufferDuration: cameraBuffer.getBufferDuration()
  });
});

// Get all video clips
app.get('/api/videos', async (req, res) => {
  try {
    const clips = await db.getAllClips();
    res.json(clips);
  } catch (error) {
    console.error('Error fetching clips:', error);
    res.status(500).json({ error: 'Failed to fetch video clips' });
  }
});

// Get specific video clip metadata
app.get('/api/videos/:id', async (req, res) => {
  try {
    const clip = await db.getClip(req.params.id);
    if (!clip) {
      return res.status(404).json({ error: 'Video clip not found' });
    }
    res.json(clip);
  } catch (error) {
    console.error('Error fetching clip:', error);
    res.status(500).json({ error: 'Failed to fetch video clip' });
  }
});

// Stream video file
app.get('/api/videos/:id/stream', async (req, res) => {
  try {
    const clip = await db.getClip(req.params.id);
    if (!clip) {
      return res.status(404).json({ error: 'Video clip not found' });
    }

    const videoPath = path.join(__dirname, 'storage/videos', clip.filename);
    
    if (!fs.existsSync(videoPath)) {
      return res.status(404).json({ error: 'Video file not found' });
    }

    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(videoPath, { start, end });
      
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      };
      
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      };
      
      res.writeHead(200, head);
      fs.createReadStream(videoPath).pipe(res);
    }
  } catch (error) {
    console.error('Error streaming video:', error);
    res.status(500).json({ error: 'Failed to stream video' });
  }
});

// Trigger video clip storage
app.post('/api/store', async (req, res) => {
  try {
    console.log('📹 Store trigger received');
    
    // Generate unique ID for this clip
    const clipId = uuidv4();
    const timestamp = new Date().toISOString();
    const filename = `clip_${Date.now()}.mp4`;
    
    // Get buffer data (30 seconds before)
    const preBuffer = cameraBuffer.getLastSeconds(30);
    
    // Start the clipping process
    const clipPromise = videoClipper.createClip({
      id: clipId,
      preBuffer,
      postDurationSeconds: 30,
      filename,
      timestamp
    });

    // Respond immediately
    res.json({
      id: clipId,
      status: 'processing',
      message: 'Clip creation started',
      timestamp
    });

    // Handle the clipping process in background
    try {
      const clipResult = await clipPromise;
      
      // Save to database
      await db.saveClip({
        id: clipId,
        timestamp,
        filename,
        duration: 60,
        size: clipResult.fileSize,
        path: clipResult.filePath
      });

      console.log('✅ Clip saved successfully:', filename);
    } catch (clipError) {
      console.error('❌ Failed to create clip:', clipError);
    }

  } catch (error) {
    console.error('Error triggering store:', error);
    res.status(500).json({ error: 'Failed to trigger video storage' });
  }
});

// Delete video clip
app.delete('/api/videos/:id', async (req, res) => {
  try {
    const clip = await db.getClip(req.params.id);
    if (!clip) {
      return res.status(404).json({ error: 'Video clip not found' });
    }

    // Delete file
    const videoPath = path.join(__dirname, 'storage/videos', clip.filename);
    if (fs.existsSync(videoPath)) {
      fs.unlinkSync(videoPath);
    }

    // Delete from database
    await db.deleteClip(req.params.id);
    
    res.json({ message: 'Video clip deleted successfully' });
  } catch (error) {
    console.error('Error deleting clip:', error);
    res.status(500).json({ error: 'Failed to delete video clip' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await cameraBuffer.stop();
  await db.close();
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Camera Buffer Server running on port ${PORT}`);
  initialize();
});

module.exports = app;