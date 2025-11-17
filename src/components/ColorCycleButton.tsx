import { Palette } from "lucide-react";
import { useTheme, colorThemes } from "~/contexts/ThemeContext";

export function ColorCycleButton() {
  const { currentTheme, cycleTheme } = useTheme();

  return (
    <button
      onClick={cycleTheme}
      className="fixed bottom-4 right-4 z-50 p-2 bg-primary text-primary-foreground border border-foreground shadow-[4px_4px_0px_0px_rgb(0,0,0)] hover:shadow-[0px_0px_0px_0px_rgb(0,0,0)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
      title={`Current: ${colorThemes[currentTheme].name}. Click to change.`}
      aria-label="Cycle color theme"
    >
      <Palette className="h-5 w-5" />
    </button>
  );
}
