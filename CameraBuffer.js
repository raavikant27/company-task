const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class CameraBuffer {
  constructor(options = {}) {
    this.bufferDuration = options.bufferDuration || 60; // seconds
    this.segmentDuration = options.segmentDuration || 2; // seconds per segment
    this.maxSegments = Math.ceil(this.bufferDuration / this.segmentDuration);
    
    // Camera configuration
    this.cameraSource = options.cameraSource || '/dev/video0'; // USB camera
    this.rtspUrl = options.rtspUrl || null; // RTSP stream URL
    this.httpUrl = options.httpUrl || null; // HTTP stream URL
    
    // Storage
    this.bufferDir = path.join(__dirname, '../../storage/buffer');
    this.segments = [];
    this.isRunning = false;
    this.ffmpegProcess = null;
    
    // Ensure buffer directory exists
    if (!fs.existsSync(this.bufferDir)) {
      fs.mkdirSync(this.bufferDir, { recursive: true });
    }
  }

  /**
   * Start the camera buffer system
   */
  async start() {
    if (this.isRunning) {
      console.log('⚠️  Camera buffer already running');
      return;
    }

    try {
      await this.startFFmpegCapture();
      this.isRunning = true;
      console.log('✅ Camera buffer started');
    } catch (error) {
      console.error('❌ Failed to start camera buffer:', error);
      throw error;
    }
  }

  /**
   * Stop the camera buffer system
   */
  async stop() {
    if (!this.isRunning) return;

    this.isRunning = false;
    
    if (this.ffmpegProcess) {
      this.ffmpegProcess.kill('SIGTERM');
      this.ffmpegProcess = null;
    }

    // Cleanup buffer files
    this.cleanupBufferFiles();
    console.log('🛑 Camera buffer stopped');
  }

  /**
   * Start FFmpeg process to capture and segment video
   */
  async startFFmpegCapture() {
    return new Promise((resolve, reject) => {
      // Determine input source
      let inputArgs = [];
      if (this.rtspUrl) {
        inputArgs = ['-i', this.rtspUrl];
      } else if (this.httpUrl) {
        inputArgs = ['-i', this.httpUrl];
      } else {
        // USB Camera (default)
        inputArgs = [
          '-f', 'v4l2',
          '-i', this.cameraSource
        ];
      }

      const ffmpegArgs = [
        ...inputArgs,
        '-c:v', 'libx264',           // Video codec
        '-preset', 'ultrafast',      // Fast encoding
        '-tune', 'zerolatency',      // Low latency
        '-c:a', 'aac',               // Audio codec (if available)
        '-f', 'segment',             // Output format
        '-segment_time', this.segmentDuration.toString(),
        '-segment_format', 'mp4',
        '-segment_list', path.join(this.bufferDir, 'playlist.m3u8'),
        '-segment_list_flags', '+live',
        '-segment_wrap', this.maxSegments.toString(),
        '-reset_timestamps', '1',
        '-strftime', '1',
        path.join(this.bufferDir, 'segment_%Y%m%d_%H%M%S.mp4')
      ];

      console.log('🎥 Starting FFmpeg with args:', ffmpegArgs.join(' '));

      this.ffmpegProcess = spawn('ffmpeg', ffmpegArgs);

      this.ffmpegProcess.stdout.on('data', (data) => {
        // console.log(`FFmpeg stdout: ${data}`);
      });

      this.ffmpegProcess.stderr.on('data', (data) => {
        const output = data.toString();
        if (output.includes('segment')) {
          this.updateSegmentList();
        }
        // Only log errors, not info
        if (output.includes('error') || output.includes('Error')) {
          console.error(`FFmpeg stderr: ${output}`);
        }
      });

      this.ffmpegProcess.on('close', (code) => {
        console.log(`FFmpeg process exited with code ${code}`);
        if (this.isRunning) {
          // Restart if it was supposed to be running
          setTimeout(() => this.startFFmpegCapture(), 5000);
        }
      });

      this.ffmpegProcess.on('error', (error) => {
        console.error('FFmpeg process error:', error);
        reject(error);
      });

      // Give FFmpeg a moment to start
      setTimeout(() => {
        if (this.ffmpegProcess && !this.ffmpegProcess.killed) {
          resolve();
        } else {
          reject(new Error('FFmpeg failed to start'));
        }
      }, 2000);
    });
  }

  /**
   * Update the list of available segments
   */
  updateSegmentList() {
    try {
      const files = fs.readdirSync(this.bufferDir)
        .filter(file => file.startsWith('segment_') && file.endsWith('.mp4'))
        .map(file => ({
          filename: file,
          path: path.join(this.bufferDir, file),
          timestamp: fs.statSync(path.join(this.bufferDir, file)).mtime
        }))
        .sort((a, b) => b.timestamp - a.timestamp);

      this.segments = files.slice(0, this.maxSegments);
    } catch (error) {
      console.error('Error updating segment list:', error);
    }
  }

  /**
   * Get the last N seconds of buffered video
   */
  getLastSeconds(seconds) {
    const segmentsNeeded = Math.ceil(seconds / this.segmentDuration);
    return this.segments.slice(0, segmentsNeeded).reverse();
  }

  /**
   * Get current buffer status
   */
  getBufferStatus() {
    return {
      isActive: this.isRunning,
      segmentCount: this.segments.length,
      bufferDuration: this.segments.length * this.segmentDuration,
      maxBufferDuration: this.bufferDuration
    };
  }

  /**
   * Check if buffer is active
   */
  isActive() {
    return this.isRunning;
  }

  /**
   * Get current buffer duration
   */
  getBufferDuration() {
    return this.segments.length * this.segmentDuration;
  }

  /**
   * Cleanup old buffer files
   */
  cleanupBufferFiles() {
    try {
      const files = fs.readdirSync(this.bufferDir);
      files.forEach(file => {
        if (file.startsWith('segment_')) {
          fs.unlinkSync(path.join(this.bufferDir, file));
        }
      });
    } catch (error) {
      console.error('Error cleaning up buffer files:', error);
    }
  }
}

module.exports = CameraBuffer;