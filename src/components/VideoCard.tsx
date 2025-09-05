import { VideoClip } from "./VideoManager";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Clock, HardDrive, Calendar } from "lucide-react";

interface VideoCardProps {
  clip: VideoClip;
  onClick: () => void;
}

export const VideoCard = ({ clip, onClick }: VideoCardProps) => {
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

  return (
    <Card className="group cursor-pointer transition-all duration-300 hover:shadow-[var(--shadow-video)] hover:-translate-y-1">
      <div className="relative">
        {/* Video Thumbnail Placeholder */}
        <div className="aspect-video bg-gradient-to-br from-video-player to-video-controls rounded-t-lg flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
          <Play className="w-12 h-12 text-white/80 group-hover:scale-110 transition-transform duration-300" />
          
          {/* Duration Badge */}
          <div className="absolute top-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDuration(clip.duration)}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <div className="space-y-1">
            <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
              {clip.filename}
            </h3>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span>{date}</span>
              <span>•</span>
              <span>{time}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <HardDrive className="w-3 h-3" />
              <span>{formatFileSize(clip.size)}</span>
            </div>
          </div>

          <Button 
            onClick={onClick}
            className="w-full bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-opacity"
            size="sm"
          >
            <Play className="w-4 h-4 mr-2" />
            Play Video
          </Button>
        </div>
      </div>
    </Card>
  );
};