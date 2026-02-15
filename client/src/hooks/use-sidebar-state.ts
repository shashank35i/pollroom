import { useState, useEffect } from "react";

export function useSidebarState() {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    const saved = localStorage.getItem("ui.sidebarCollapsed");
    // Default to true for that ChatGPT collapsed feel if not set, or just use saved
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem("ui.sidebarCollapsed", JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  const toggleSidebar = () => setIsCollapsed((prev: boolean) => !prev);

  return { isCollapsed, toggleSidebar };
}
