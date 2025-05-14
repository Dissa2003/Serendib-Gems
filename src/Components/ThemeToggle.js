import { useContext } from "react";
import { ThemeContext } from "../ThemeContext";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <div className="flex items-center space-x-4">
      <span className="text-gray-700 dark:text-gray-200">
        {theme === "light" ? "Light Mode" : "Dark Mode"}
      </span>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={theme === "dark"}
          onChange={toggleTheme}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-blue-600 dark:bg-gray-700 dark:peer-checked:bg-gray-500 transition-colors duration-300 relative">
          <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 transform ${theme === "dark" ? "translate-x-5" : ""}`}></div>
        </div>
      </label>
    </div>
  );
};

export default ThemeToggle;
