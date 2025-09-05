import { useState, useEffect } from "react";
import { VideoList } from "./VideoList";
import { VideoPlayer } from "./VideoPlayer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Video, Circle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface VideoClip {
  id: string;
  timestamp: string;
  filename: string;
  duration: number;
  size: number;
  thumbnail?: string;
}

export const VideoManager = () => {
  const [clips, setClips] = useState<VideoClip[]>([]);
  const [selectedClip, setSelectedClip] = useState<VideoClip | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Mock API endpoints - replace with actual backend URLs
  const API_BASE = "http://localhost:3001/api";

  useEffect(() => {
    fetchClips();
  }, []);

  const fetchClips = async () => {
    setIsLoading(true);
    try {
      // Mock data for development - replace with actual API call
      const mockClips: VideoClip[] = [
        {
          id: "1",
          timestamp: "2024-01-15T10:30:00Z",
          filename: "clip_20240115_103000.mp4",
          duration: 60,
          size: 15728640,
        },
        {
          id: "2", 
          timestamp: "2024-01-15T11:45:00Z",
          filename: "clip_20240115_114500.mp4",
          duration: 60,
          size: 16777216,
        },
        {
          id: "3",
          timestamp: "2024-01-15T14:20:00Z", 
          filename: "clip_20240115_142000.mp4",
          duration: 60,
          size: 14680064,
        }
      ];
      
      setTimeout(() => {
        setClips(mockClips);
        setIsLoading(false);
      }, 1000);
      
      // Actual API call would be:
      // const response = await fetch(`${API_BASE}/videos`);
      // const data = await response.json();
      // setClips(data);
    } catch (error) {
      console.error("Failed to fetch clips:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load video clips",
      });
      setIsLoading(false);
    }
  };

  const triggerStore = async () => {
    setIsRecording(true);
    try {
      toast({
        title: "Recording Triggered",
        description: "Capturing 60-second clip (30s before + 30s after)...",
      });

      // Mock API call - replace with actual backend call
      setTimeout(() => {
        const newClip: VideoClip = {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          filename: `clip_${Date.now()}.mp4`,
          duration: 60,
          size: Math.floor(Math.random() * 5000000) + 10000000,
        };
        
        setClips(prev => [newClip, ...prev]);
        setIsRecording(false);
        
        toast({
          title: "Clip Saved",
          description: "Video clip has been successfully stored",
        });
      }, 3000);

      // Actual API call would be:
      // const response = await fetch(`${API_BASE}/store`, { method: 'POST' });
      // const newClip = await response.json();
      // setClips(prev => [newClip, ...prev]);
    } catch (error) {
      console.error("Failed to trigger store:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to store video clip",
      });
      setIsRecording(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Video className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Camera Buffer System</h1>
                <p className="text-sm text-muted-foreground">
                  Continuous recording with 60-second clip storage
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                <span className="text-muted-foreground">Buffer Active</span>
              </div>
              
              <Button
                onClick={triggerStore}
                disabled={isRecording}
                className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-opacity"
                size="lg"
              >
                <Circle className={`w-4 h-4 mr-2 ${isRecording ? 'animate-pulse text-red-500' : ''}`} />
                {isRecording ? 'Recording...' : 'Store Clip'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {selectedClip ? (
          <VideoPlayer
            clip={selectedClip}
            apiBase={API_BASE}
            onBack={() => setSelectedClip(null)}
          />
        ) : (
          <div className="space-y-6">
            {/* Status Card */}
            <Card className="p-6 bg-gradient-to-br from-card to-muted/20">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">System Status</h3>
                  <p className="text-sm text-muted-foreground">
                    Camera buffer maintaining 60-second rolling window. 
                    Click "Store Clip" to save the current moment with 30s before and 30s after.
                  </p>
                </div>
              </div>
            </Card>

            {/* Video List */}
            <VideoList
              clips={clips}
              isLoading={isLoading}
              onSelectClip={setSelectedClip}
              onRefresh={fetchClips}
            />
          </div>
        )}
      </div>
    </div>
  );
};