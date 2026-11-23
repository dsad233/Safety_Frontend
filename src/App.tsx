import { useEffect, useState } from "react";
import HomePage from "./pages/HomePage";
import StoragePage from "./pages/StoragePage";

function App() {
  const [pathname, setPathname] = useState(() => window.location.pathname);

  useEffect(() => {
    const syncPathname = () => setPathname(window.location.pathname);
    window.addEventListener("popstate", syncPathname);
    return () => window.removeEventListener("popstate", syncPathname);
  }, []);

  return pathname === "/" ? <HomePage /> : <StoragePage />;
}

export default App;
