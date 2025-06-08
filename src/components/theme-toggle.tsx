"use client";

import { cn } from "@/lib/utils";
import { Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect } from "react";
import { useState } from "react";
import { Button } from "./ui/button";

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
    <div className={cn("group flex pt-1 pr-1", className)}>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Toggle theme"
        className={cn(
          "rounded-full size-8 transition-all duration-300",
          "group-hover:opacity-0 group-hover:translate-x-[100%]"
        )}
      >
        {theme === "light" && <Sun className="size-5" />}
        {theme === "dark" && <Moon className="size-5" />}
        {theme === "system" && <Laptop className="size-5" />}
      </Button>
      <div
        className={cn(
          "absolute top-0 right-0 flex items-center gap-1 bg-accent/50 rounded-full p-1 transition-all duration-300",
          "opacity-0 translate-x-[100%]",
          "group-hover:opacity-100 group-hover:translate-x-0"
        )}
      >
        {themes.map((t) => (
          <Button
            key={t.id}
            variant="ghost"
            size="icon"
            aria-label={t.name}
            className={cn(
              "rounded-full size-8",
              t.id === theme && "bg-accent text-accent-foreground"
            )}
            onClick={() => setTheme(t.id)}
          >
            <t.icon className="size-5" />
          </Button>
        ))}
      </div>
    </div>
  );
}
