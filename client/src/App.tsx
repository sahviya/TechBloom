import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { ThemeProvider } from "@/components/ThemeProvider";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Journal from "@/pages/journal";
import Community from "@/pages/community";
import Genie from "@/pages/genie";
import Profile from "@/pages/profile";
import Media from "@/pages/media";
import Games from "@/pages/games";
import Books from "@/pages/books";
import Shopping from "@/pages/shopping";
import NotFound from "@/pages/not-found";
import Navigation from "@/components/Navigation";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-16 h-16 genie-gradient rounded-full animate-pulse glow-effect flex items-center justify-center">
          <i className="fas fa-magic text-primary-foreground text-xl"></i>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {!isAuthenticated ? (
        <Switch>
          <Route path="/" component={Landing} />
          <Route component={NotFound} />
        </Switch>
      ) : (
        <div className="flex min-h-screen">
          <Navigation />
          <main className="flex-1">
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/journal" component={Journal} />
              <Route path="/community" component={Community} />
              <Route path="/genie" component={Genie} />
              <Route path="/profile" component={Profile} />
              <Route path="/media" component={Media} />
              <Route path="/games" component={Games} />
              <Route path="/books" component={Books} />
              <Route path="/shopping" component={Shopping} />
              <Route component={NotFound} />
            </Switch>
          </main>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
