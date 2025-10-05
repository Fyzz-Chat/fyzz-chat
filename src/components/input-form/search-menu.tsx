"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/stores/chat-store";
import { useModelStore } from "@/stores/model-store";
import { Ban, Globe } from "lucide-react";
import { useEffect, useState } from "react";

export default function SearchMenu() {
  const model = useModelStore((state) => state.model);
  const searchSupport = model?.features?.some((feature) => feature.name === "Search");
  const isSonar = model?.id === "sonar" || model?.id === "sonar-pro";
  const [search, setSearch] = useState(isSonar ? "web" : "none");
  const { setBrowse } = useChatStore();

  // Update search state when model changes
  useEffect(() => {
    setSearch(isSonar ? "web" : "none");
  }, [isSonar, searchSupport]);

  function handleChange(value: string) {
    setSearch(value);
    setBrowse(value === "web");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={isSonar || !searchSupport}>
        <Button variant="outline" size="icon" className="shrink-0">
          <Globe size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Search type</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleChange("none")}>
          <div
            className={cn("flex gap-2 items-start", search === "none" && "text-primary")}
          >
            <div className="flex pt-0.5">
              <Ban size={16} />
            </div>
            <div className="flex flex-col gap-0.5">
              <p>None</p>
              <p className="text-xs text-muted-foreground">Default model behavior</p>
            </div>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleChange("web")}>
          <div
            className={cn("flex gap-2 items-start", search === "web" && "text-primary")}
          >
            <div className="flex pt-0.5">
              <Globe size={16} />
            </div>
            <div className="flex flex-col gap-0.5">
              <p>Web</p>
              <p className="text-xs text-muted-foreground">
                Search the web for information
              </p>
            </div>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
