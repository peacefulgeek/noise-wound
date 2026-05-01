import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import About from "./pages/About";
import Recommended from "./pages/Recommended";
import Articles from "./pages/Articles";
import ArticleView from "./pages/ArticleView";
import Author from "./pages/Author";
import Herbs from "./pages/Herbs";
import Assessments from "./pages/Assessments";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Disclaimer from "./pages/Disclaimer";
import SiteShell from "./components/SiteShell";

function Router() {
  return (
    <SiteShell>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/about" component={About} />
        <Route path="/recommended" component={Recommended} />
        <Route path="/articles" component={Articles} />
        <Route path="/articles/:slug" component={ArticleView} />
        <Route path="/author/the-oracle-lover" component={Author} />
        <Route path="/herbs" component={Herbs} />
        <Route path="/apothecary" component={Herbs} />
        <Route path="/assessments" component={Assessments} />
        <Route path="/mirrors" component={Assessments} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/terms" component={Terms} />
        <Route path="/disclaimer" component={Disclaimer} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </SiteShell>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
