import "./App.css";
import { Button } from "@/components/ui/button.tsx";
import { ThemeProvider } from "@/components/theme-provider.tsx";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <main className="container">
        <Button>Click me</Button>
      </main>
    </ThemeProvider>
  );
}

export default App;
