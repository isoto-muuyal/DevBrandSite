import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export default function ThemeSwitcher() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
      title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
      data-testid="theme-switcher"
    >
      {theme === "light" ? (
        <Moon className="w-5 h-5" data-testid="icon-moon" />
      ) : (
        <Sun className="w-5 h-5" data-testid="icon-sun" />
      )}
    </button>
  );
}
