import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import CameraCapture from "@/components/camera-capture";
import { booksApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import AddBook from "./add-book";

export default function Camera() {
  const [, setLocation] = useLocation();
  const [capturedData, setCapturedData] = useState<{ title: string; author?: string } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const analyzeMutation = useMutation({
    mutationFn: booksApi.analyzeImage,
    onSuccess: (result) => {
      setIsAnalyzing(false);
      if (result.title && result.confidence > 0.5) {
        setCapturedData({
          title: result.title,
          author: result.author || undefined,
        });
        toast({
          title: "Book detected!",
          description: `Found: ${result.title}${result.author ? ` by ${result.author}` : ""}`,
        });
      } else {
        toast({
          title: "Could not detect book",
          description: "Please try again with better lighting or enter details manually.",
          variant: "destructive",
        });
        setLocation("/add-book");
      }
    },
    onError: () => {
      setIsAnalyzing(false);
      toast({
        title: "Analysis failed",
        description: "Could not analyze the image. Please try again.",
        variant: "destructive",
      });
      setLocation("/add-book");
    },
  });

  const handleCapture = (file: File) => {
    setIsAnalyzing(true);
    analyzeMutation.mutate(file);
  };

  const handleClose = () => {
    setLocation("/");
  };

  if (isAnalyzing) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <h3 className="text-lg font-medium mb-2">Analyzing Image...</h3>
          <p className="text-gray-600">AI is extracting book details</p>
        </div>
      </div>
    );
  }

  if (capturedData) {
    return <AddBook initialData={capturedData} />;
  }

  return <CameraCapture onCapture={handleCapture} onClose={handleClose} />;
}
