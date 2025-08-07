import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import BottomNavigation from "@/components/bottom-navigation";
import Library from "@/pages/library";
import AddBook from "@/pages/add-book";
import Camera from "@/pages/camera";
import DuplicateChecker from "@/pages/duplicate-checker";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="relative">
      <Switch>
        <Route path="/" component={Library} />
        <Route path="/add-book">{() => <AddBook />}</Route>
        <Route path="/camera" component={Camera} />
        <Route path="/duplicate-checker" component={DuplicateChecker} />
        <Route component={NotFound} />
      </Switch>
      <BottomNavigation />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
