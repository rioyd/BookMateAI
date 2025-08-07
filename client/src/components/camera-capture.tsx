import { useState, useRef, useCallback } from "react";
import { X, Camera, RotateCcw, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

export default function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const captureImage = useCallback(() => {
    if (!videoRef.current) return;

    setIsCapturing(true);
    const canvas = document.createElement("canvas");
    const video = videoRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "book-cover.jpg", { type: "image/jpeg" });
          onCapture(file);
          stopCamera();
        }
        setIsCapturing(false);
      }, "image/jpeg", 0.8);
    }
  }, [onCapture, stopCamera]);

  const handleClose = useCallback(() => {
    stopCamera();
    onClose();
  }, [stopCamera, onClose]);

  useState(() => {
    startCamera();
    return stopCamera;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div className="relative h-full flex flex-col max-w-md mx-auto">
        {/* Camera Header */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 text-white bg-gradient-to-b from-black/50 to-transparent">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="text-white hover:bg-white/20"
          >
            <X size={20} />
          </Button>
          <h3 className="font-medium">Scan Book Cover</h3>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
          >
            <HelpCircle size={20} />
          </Button>
        </div>

        {/* Camera Viewfinder */}
        <div className="flex-1 relative bg-gray-900 overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          
          {/* Scanning overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-64 h-80 border-2 border-white/60 rounded-lg relative">
              <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary"></div>
              <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary"></div>
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-primary"></div>
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary"></div>
            </div>
          </div>
        </div>

        {/* Camera Controls */}
        <div className="bg-black/80 p-6">
          <div className="flex items-center justify-center space-x-8">
            <Button variant="ghost" size="icon" className="text-white">
              <RotateCcw size={24} />
            </Button>
            
            <Button
              onClick={captureImage}
              disabled={isCapturing}
              className="w-16 h-16 bg-white rounded-full hover:bg-gray-100 text-gray-900"
              size="icon"
            >
              <Camera size={24} />
            </Button>
            
            <div className="w-10" /> {/* Spacer for balance */}
          </div>
          <p className="text-white text-center text-sm mt-4 opacity-80">
            {isCapturing ? "Processing..." : "Tap to capture book cover"}
          </p>
        </div>
      </div>
    </div>
  );
}
