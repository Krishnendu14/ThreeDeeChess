import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RotationProvider, useRotation } from "@/contexts/RotationContext";
import NotFound from "@/pages/not-found";
import Game from "@/pages/Game";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Game} />
      <Route component={NotFound} />
    </Switch>
  );
}

function RotatingContent() {
  const { rotationKey } = useRotation();
  
  return (
    <div 
      key={rotationKey}
      className="rotate-container"
      style={{
        animation: rotationKey > 0 ? 'spin-180 0.6s ease-in-out forwards' : 'none'
      }}
    >
      <Router />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RotationProvider>
        <TooltipProvider>
          <Toaster />
          <RotatingContent />
        </TooltipProvider>
      </RotationProvider>
    </QueryClientProvider>
  );
}

export default App;
