import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Check, Camera, AlertTriangle } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { insertBookSchema, type InsertBook } from "@shared/schema";
import { booksApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface AddBookProps {
  initialData?: {
    title?: string;
    author?: string;
  };
}

export default function AddBook({ initialData }: AddBookProps) {
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [duplicateCheck, setDuplicateCheck] = useState<{ isDuplicate: boolean; matches: any[] } | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertBook>({
    resolver: zodResolver(insertBookSchema),
    defaultValues: {
      title: initialData?.title || "",
      author: initialData?.author || "",
      isRead: false,
    },
  });

  const createBookMutation = useMutation({
    mutationFn: booksApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      toast({
        title: "Success",
        description: "Book added to your library!",
      });
      setLocation("/");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add book. Please try again.",
        variant: "destructive",
      });
    },
  });

  const checkDuplicateMutation = useMutation({
    mutationFn: ({ title, author }: { title: string; author?: string }) =>
      booksApi.checkDuplicate(title, author),
    onSuccess: (result) => {
      setDuplicateCheck(result);
    },
  });

  const onSubmit = async (data: InsertBook) => {
    setIsProcessing(true);
    
    try {
      // Check for duplicates first
      const duplicateResult = await booksApi.checkDuplicate(data.title, data.author || undefined);
      
      if (duplicateResult.isDuplicate) {
        setDuplicateCheck(duplicateResult);
        setIsProcessing(false);
        return;
      }
      
      createBookMutation.mutate(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to check for duplicates. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveAnyway = () => {
    const data = form.getValues();
    createBookMutation.mutate(data);
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      <div className="h-full flex flex-col">
        {/* Form Header */}
        <header className="bg-primary text-primary-foreground p-4 shadow-md">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/")}
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              <ArrowLeft size={18} />
            </Button>
            <h1 className="text-lg font-medium">Add New Book</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={form.handleSubmit(onSubmit)}
              disabled={isProcessing || createBookMutation.isPending}
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              <Check size={18} />
            </Button>
          </div>
        </header>

        {/* Form Content */}
        <div className="flex-1 p-4 space-y-6">
          {/* AI Processing Indicator */}
          {isProcessing && (
            <Alert>
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></div>
                <div>
                  <div className="text-sm font-medium">Processing...</div>
                  <div className="text-xs opacity-80">Checking for duplicates</div>
                </div>
              </div>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Title Field */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Book Title <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter book title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Author Field */}
              <FormField
                control={form.control}
                name="author"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Author</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter author name" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Reading Status */}
              <FormField
                control={form.control}
                name="isRead"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reading Status</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(value) => field.onChange(value === "true")}
                        value={field.value ? "true" : "false"}
                        className="space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="false" id="unread" />
                          <Label htmlFor="unread">Unread</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="true" id="read" />
                          <Label htmlFor="read">Read</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Duplicate Check Results */}
              {duplicateCheck?.isDuplicate && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-medium">Potential Duplicate Found</div>
                    <div className="text-sm mt-1">
                      You may already own "{duplicateCheck.matches[0]?.title}"
                      {duplicateCheck.matches[0]?.author && ` by ${duplicateCheck.matches[0].author}`}
                    </div>
                    <div className="mt-3 space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDuplicateCheck(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSaveAnyway}
                        disabled={createBookMutation.isPending}
                      >
                        Add Anyway
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Action Buttons */}
              <div className="space-y-3 pt-4">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isProcessing || createBookMutation.isPending}
                >
                  {createBookMutation.isPending ? "Adding..." : "Add Book to Library"}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setLocation("/camera")}
                >
                  <Camera className="mr-2" size={16} />
                  Scan Another Book
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
