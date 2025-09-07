import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

const filters = [
  { id: "none", name: "Original", style: "" },
  { id: "grayscale", name: "B&W", style: "filter: grayscale(100%)" },
  { id: "sepia", name: "Vintage", style: "filter: sepia(100%)" },
  { id: "warm", name: "Warm", style: "filter: saturate(1.2) hue-rotate(15deg)" },
  { id: "cool", name: "Cool", style: "filter: saturate(1.1) hue-rotate(-15deg)" },
  { id: "bright", name: "Bright", style: "filter: brightness(1.3) contrast(1.1)" },
  { id: "magical", name: "Magical", style: "filter: saturate(1.4) hue-rotate(30deg) brightness(1.1)" },
];

export default function Snap() {
  const [isCamera, setIsCamera] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("none");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const shareToCommunityMutation = useMutation({
    mutationFn: async (data: { content: string; imageBase64: string }) => {
      const response = await fetch("/api/community/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to share post');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
      toast({
        title: "Success!",
        description: "Your snap has been shared with the community! ✨",
      });
      setCapturedImage(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to share your snap. Please try again.",
        variant: "destructive",
      });
    },
  });

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          setCameraReady(true);
        };
      }
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setCameraReady(false);
    }
  }, [stream]);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext("2d");
      
      if (context && video.videoWidth > 0 && video.videoHeight > 0) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        
        const imageData = canvas.toDataURL("image/jpeg", 0.6);
        console.log("Captured image data length:", imageData.length);
        setCapturedImage(imageData);
        stopCamera();
      } else {
        toast({
          title: "Camera Error",
          description: "Unable to capture photo. Please ensure camera is ready.",
          variant: "destructive",
        });
      }
    }
  }, [stopCamera, toast]);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Resize image if too large
          const maxWidth = 800;
          const maxHeight = 600;
          let { width, height } = img;
          
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width *= ratio;
            height *= ratio;
          }
          
          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);
          
          const compressedImage = canvas.toDataURL('image/jpeg', 0.6);
          setCapturedImage(compressedImage);
          setIsCamera(false);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const shareToCommunity = useCallback(() => {
    if (capturedImage) {
      const content = "Check out my snap! ✨📸";
      shareToCommunityMutation.mutate({
        content,
        imageBase64: capturedImage,
      });
    }
  }, [capturedImage, shareToCommunityMutation]);

  useEffect(() => {
    if (isCamera) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isCamera, startCamera, stopCamera]);

  const currentFilter = filters.find(f => f.id === selectedFilter);

  return (
    <div className="container mx-auto px-4 py-8 pb-20 md:pb-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-serif font-bold mb-4 genie-gradient bg-clip-text text-transparent">
          Snap ✨📸
        </h1>
        <p className="text-muted-foreground text-lg">
          Capture magical moments and share them with your wellness community
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Mode Selection */}
        <div className="flex justify-center gap-4">
          <Button
            variant={isCamera ? "default" : "outline"}
            onClick={() => setIsCamera(true)}
            className={isCamera ? "genie-gradient" : ""}
            data-testid="camera-mode"
          >
            <i className="fas fa-camera mr-2"></i>
            Camera
          </Button>
          <Button
            variant={!isCamera ? "default" : "outline"}
            onClick={() => {
              setIsCamera(false);
              fileInputRef.current?.click();
            }}
            className={!isCamera ? "genie-gradient" : ""}
            data-testid="gallery-mode"
          >
            <i className="fas fa-images mr-2"></i>
            Gallery
          </Button>
        </div>

        {/* Camera/Image Display */}
        <Card className="magical-border">
          <CardContent className="p-6">
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              {isCamera && !capturedImage && (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  style={{ ...(currentFilter && currentFilter.style ? { filter: currentFilter.style.split(': ')[1] } : {}) }}
                />
              )}
              
              {capturedImage && (
                <img
                  src={capturedImage}
                  alt="Captured"
                  className="w-full h-full object-cover"
                  style={{ 
                    filter: currentFilter && currentFilter.style && currentFilter.id !== 'none' 
                      ? currentFilter.style.split(': ')[1] 
                      : 'none' 
                  }}
                />
              )}

              {!isCamera && !capturedImage && (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <i className="fas fa-image text-4xl mb-4"></i>
                    <p>Select an image from your gallery</p>
                  </div>
                </div>
              )}
            </div>

            {/* Camera Controls */}
            {isCamera && !capturedImage && (
              <div className="flex justify-center mt-4">
                <Button
                  size="lg"
                  onClick={capturePhoto}
                  disabled={!cameraReady}
                  className={`w-16 h-16 rounded-full ${cameraReady ? "genie-gradient" : "bg-muted"}`}
                  data-testid="capture-photo"
                >
                  {cameraReady ? (
                    <i className="fas fa-camera text-xl"></i>
                  ) : (
                    <i className="fas fa-spinner fa-spin text-xl"></i>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <i className="fas fa-magic mr-2"></i>
              Magical Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
              {filters.map((filter) => (
                <Button
                  key={filter.id}
                  variant={selectedFilter === filter.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedFilter(filter.id)}
                  className={`${
                    selectedFilter === filter.id ? "genie-gradient" : ""
                  } text-xs`}
                  data-testid={`filter-${filter.id}`}
                >
                  {filter.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        {capturedImage && (
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCapturedImage(null);
                    if (isCamera) {
                      startCamera();
                    }
                  }}
                  data-testid="retake-photo"
                >
                  <i className="fas fa-redo mr-2"></i>
                  Retake
                </Button>
                
                <Button
                  onClick={shareToCommunity}
                  disabled={shareToCommunityMutation.isPending}
                  className="genie-gradient"
                  data-testid="share-to-community"
                >
                  {shareToCommunityMutation.isPending ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Sharing...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-share mr-2"></i>
                      Share to Community
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tips */}
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <i className="fas fa-lightbulb text-yellow-500 mt-1"></i>
              <div>
                <h4 className="font-medium mb-2">✨ Snap Tips</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Try different filters to enhance your wellness moments</li>
                  <li>• Share positive vibes and supportive content with the community</li>
                  <li>• Capture your progress, achievements, or inspiring quotes</li>
                  <li>• Use natural lighting for the best photo quality</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}