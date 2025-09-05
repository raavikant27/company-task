const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class VideoClipper {
  constructor() {
    this.outputDir = path.join(__dirname, '../../storage/videos');
    
    // Ensure output directory exists
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Create a video clip from buffer segments and additional recording
   * @param {Object} options - Clip creation options
   * @param {string} options.id - Unique clip ID
   * @param {Array} options.preBuffer - Array of buffer segments (30s before)
   * @param {number} options.postDurationSeconds - Duration to record after trigger (30s)
   * @param {string} options.filename - Output filename
   * @param {string} options.timestamp - Timestamp when clip was triggered
   */
  async createClip(options) {
    const { id, preBuffer, postDurationSeconds, filename, timestamp } = options;
    
    try {
      console.log(`🎬 Creating clip ${id}...`);
      
      // Step 1: Record the "after" portion (30 seconds)
      const postBufferPath = await this.recordPostBuffer(id, postDurationSeconds);
      
      // Step 2: Merge pre-buffer segments with post-buffer
      const outputPath = path.join(this.outputDir, filename);
      await this.mergeSegments(preBuffer, postBufferPath, outputPath);
      
      // Step 3: Get file stats
      const stats = fs.statSync(outputPath);
      
      // Step 4: Cleanup temporary files
      this.cleanupTempFiles(postBufferPath);
      
      console.log(`✅ Clip created: ${filename} (${stats.size} bytes)`);
      
      return {
        filePath: outputPath,
        fileSize: stats.size,
        duration: 60 // 30s before + 30s after
      };
      
    } catch (error) {
      console.error(`❌ Failed to create clip ${id}:`, error);
      throw error;
    }
  }

  /**
   * Record the post-trigger portion (30 seconds after trigger)
   */
  async recordPostBuffer(clipId, duration) {
    return new Promise((resolve, reject) => {
      const tempPath = path.join(__dirname, '../../storage/temp', `post_${clipId}.mp4`);
      
      // Ensure temp directory exists
      const tempDir = path.dirname(tempPath);
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      // FFmpeg command to record from camera for specified duration
      const ffmpegArgs = [
        '-f', 'v4l2',
        '-i', '/dev/video0',  // Adjust based on your camera setup
        '-t', duration.toString(),
        '-c:v', 'libx264',
        '-preset', 'fast',
        '-c:a', 'aac',
        '-y', // Overwrite output file
        tempPath
      ];

      console.log(`📹 Recording post-buffer for ${duration}s...`);

      const ffmpegProcess = spawn('ffmpeg', ffmpegArgs);

      ffmpegProcess.on('close', (code) => {
        if (code === 0) {
          resolve(tempPath);
        } else {
          reject(new Error(`FFmpeg exited with code ${code}`));
        }
      });

      ffmpegProcess.on('error', (error) => {
        reject(error);
      });

      // Set timeout as safety measure
      setTimeout(() => {
        ffmpegProcess.kill('SIGTERM');
        reject(new Error('Recording timeout'));
      }, (duration + 10) * 1000);
    });
  }

  /**
   * Merge pre-buffer segments with post-buffer into final clip
   */
  async mergeSegments(preBufferSegments, postBufferPath, outputPath) {
    return new Promise((resolve, reject) => {
      // Create a temporary file list for FFmpeg concat
      const fileListPath = path.join(__dirname, '../../storage/temp', 'filelist.txt');
      const fileListContent = [
        // Pre-buffer segments
        ...preBufferSegments.map(segment => `file '${segment.path}'`),
        // Post-buffer
        `file '${postBufferPath}'`
      ].join('\n');

      fs.writeFileSync(fileListPath, fileListContent);

      // FFmpeg concat command
      const ffmpegArgs = [
        '-f', 'concat',
        '-safe', '0',
        '-i', fileListPath,
        '-c', 'copy',
        '-y',
        outputPath
      ];

      console.log('🔄 Merging video segments...');

      const ffmpegProcess = spawn('ffmpeg', ffmpegArgs);

      ffmpegProcess.on('close', (code) => {
        // Cleanup temp file list
        if (fs.existsSync(fileListPath)) {
          fs.unlinkSync(fileListPath);
        }

        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`FFmpeg merge failed with code ${code}`));
        }
      });

      ffmpegProcess.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Create thumbnail for video clip
   */
  async createThumbnail(videoPath, thumbnailPath) {
    return new Promise((resolve, reject) => {
      const ffmpegArgs = [
        '-i', videoPath,
        '-ss', '30', // Take screenshot at 30 seconds
        '-vframes', '1',
        '-vf', 'scale=320:240',
        '-y',
        thumbnailPath
      ];

      const ffmpegProcess = spawn('ffmpeg', ffmpegArgs);

      ffmpegProcess.on('close', (code) => {
        if (code === 0) {
          resolve(thumbnailPath);
        } else {
          reject(new Error(`Thumbnail creation failed with code ${code}`));
        }
      });

      ffmpegProcess.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Cleanup temporary files
   */
  cleanupTempFiles(...paths) {
    paths.forEach(filePath => {
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (error) {
        console.error(`Failed to cleanup temp file ${filePath}:`, error);
      }
    });
  }
}

module.exports = VideoClipper;