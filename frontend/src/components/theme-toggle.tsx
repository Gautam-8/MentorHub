import { useTheme } from '@/contexts/theme-context';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      aria-label="Toggle theme"
      onClick={toggleTheme}
      className="w-9 h-9 flex items-center justify-center rounded-full border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-black text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-neutral-300 dark:focus:ring-neutral-700"
    >
      {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
} 