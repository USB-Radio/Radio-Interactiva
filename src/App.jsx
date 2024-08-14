import { Navbar } from "./components/Navbar";
import { NetworksList } from "./components/NetworksList";
import { LayoutContent } from "./components/LayoutContent";
export function App() {
  return (
    <div>
      <Navbar />
      <NetworksList />
      <LayoutContent />
    </div>
  );
}
