import { VideoClip } from "./VideoManager";
import { VideoCard } from "./VideoCard";
import { Button } from "@/components/ui/button";
import { RefreshCw, Video, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";

interface VideoListProps {
  clips: VideoClip[];
  isLoading: boolean;
  onSelectClip: (clip: VideoClip) => void;
  onRefresh: () => void;
}

export const VideoList = ({ clips, isLoading, onSelectClip, onRefresh }: VideoListProps) => {
  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString());
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getTotalStorage = () => {
    const total = clips.reduce((sum, clip) => sum + clip.size, 0);
    return formatFileSize(total);
  };

  const getTotalDuration = () => {
    const total = clips.reduce((sum, clip) => sum + clip.duration, 0);
    const minutes = Math.floor(total / 60);
    const seconds = total % 60;
    return `${minutes}m ${seconds}s`;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Stored Video Clips</h2>
          <Button variant="outline" disabled>
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            Loading...
          </Button>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-4">
              <div className="animate-pulse space-y-3">
                <div className="h-32 bg-muted rounded-lg" />
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Stored Video Clips</h2>
          <p className="text-muted-foreground">
            {clips.length} clips stored
          </p>
        </div>
        <Button onClick={onRefresh} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Statistics */}
      {clips.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Video className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Clips</p>
                <p className="text-2xl font-bold">{clips.length}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Duration</p>
                <p className="text-2xl font-bold">{getTotalDuration()}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-primary-foreground rounded-full" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Storage Used</p>
                <p className="text-2xl font-bold">{getTotalStorage()}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Video Grid */}
      {clips.length === 0 ? (
        <Card className="p-12 text-center">
          <Video className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No clips stored yet</h3>
          <p className="text-muted-foreground mb-4">
            Click the "Store Clip" button to save your first video clip
          </p>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {clips.map((clip) => (
            <VideoCard
              key={clip.id}
              clip={clip}
              onClick={() => onSelectClip(clip)}
            />
          ))}
        </div>
      )}
    </div>
  );
};