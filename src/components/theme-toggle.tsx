"use client";

import { Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";

const themes = [
  {
    id: "light",
    name: "Light theme",
    icon: Sun,
  },
  {
    id: "dark",
    name: "Dark theme",
    icon: Moon,
  },
  {
    id: "system",
    name: "System theme",
    icon: Laptop,
  },
];

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <ToggleGroup
      type="single"
      value={theme}
      onValueChange={(value) => value && setTheme(value)}
      className={className}
      variant="outline"
    >
      {themes.map((t) => (
        <ToggleGroupItem
          key={t.id}
          value={t.id}
          aria-label={t.name}
          size="sm"
          className="rounded-md"
        >
          <t.icon className="size-4" />
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
