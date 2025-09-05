import { VideoClip } from "./VideoManager";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Download, Calendar, Clock, HardDrive } from "lucide-react";

interface VideoPlayerProps {
  clip: VideoClip;
  apiBase: string;
  onBack: () => void;
}

export const VideoPlayer = ({ clip, apiBase, onBack }: VideoPlayerProps) => {
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString(),
    };
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString());
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const { date, time } = formatDate(clip.timestamp);
  
  // For demo purposes, using a sample video URL
  // In production, this would be: `${apiBase}/videos/${clip.id}`
  const videoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

  const handleDownload = () => {
    // In production, this would download the actual file
    window.open(`${apiBase}/videos/${clip.id}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button onClick={onBack} variant="outline" className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Clips
      </Button>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Video Player */}
        <div className="lg:col-span-2">
          <Card className="p-1 bg-gradient-to-br from-card to-muted/20">
            <div className="relative rounded-lg overflow-hidden bg-video-player">
              <video
                className="w-full aspect-video"
                controls
                preload="metadata"
                style={{ backgroundColor: 'var(--video-player)' }}
              >
                <source src={videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </Card>
        </div>

        {/* Video Details */}
        <div className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Video Details</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-1">
                  Filename
                </h3>
                <p className="font-mono text-sm bg-muted/50 p-2 rounded">
                  {clip.filename}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">
                    Date & Time
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span>{date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-primary" />
                      <span>{time}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">
                    File Info
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-primary" />
                      <span>{formatDuration(clip.duration)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <HardDrive className="w-4 h-4 text-primary" />
                      <span>{formatFileSize(clip.size)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button 
                  onClick={handleDownload}
                  className="w-full bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-opacity"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Video
                </Button>
              </div>
            </div>
          </Card>

          {/* Recording Info */}
          <Card className="p-6 bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
            <h3 className="font-semibold mb-3 text-primary">Recording Details</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• 30 seconds before trigger</p>
              <p>• 30 seconds after trigger</p>
              <p>• Total duration: 60 seconds</p>
              <p>• Continuous buffer system</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};