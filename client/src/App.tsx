import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";

// Pages
import Home from "./pages/Home";
import Projects from "./pages/Projects";
import Team from "./pages/Team";
import News from "./pages/News";
import Forum from "./pages/Forum";
import Apply from "./pages/Apply";
import Admin from "./pages/Admin";
import YouTube from "./pages/YouTube";

function Router() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100 selection:bg-orange-500 selection:text-zinc-950">
      <Navbar />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/projects" component={Projects} />
          <Route path="/team" component={Team} />
          <Route path="/news" component={News} />
          <Route path="/forum" component={Forum} />
          <Route path="/apply" component={Apply} />
          <Route path="/youtube" component={YouTube} />
          <Route path="/admin" component={Admin} />
          <Route path="/404" component={NotFound} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
