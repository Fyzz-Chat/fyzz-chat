"use client";

import { Ban, Globe } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useBrowseContext } from "@/lib/contexts/browse-context";
import { cn } from "@/lib/utils";
import { useModelStore } from "@/stores/model-store";

export default function SearchMenu() {
  const model = useModelStore((state) => state.model);
  const searchSupport = model?.features?.some((feature) => feature.name === "Search");
  const isSonar = model?.id === "sonar" || model?.id === "sonar-pro";
  const [search, setSearch] = useState(isSonar ? "web" : "none");
  const { setBrowse } = useBrowseContext();

  // Update search state when model changes
  useEffect(() => {
    setSearch(isSonar ? "web" : "none");
  }, [isSonar]);

  function handleChange(value: string) {
    setSearch(value);
    setBrowse(value === "web");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        asChild
        disabled={isSonar || !searchSupport}
        hidden={!searchSupport}
      >
        <Button variant="ghost" size="icon" className="shrink-0 rounded-full">
          <Globe size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Search type</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleChange("none")}>
          <div
            className={cn("flex items-start gap-2", search === "none" && "text-primary")}
          >
            <div className="flex pt-0.5">
              <Ban size={16} />
            </div>
            <div className="flex flex-col gap-0.5">
              <p>None</p>
              <p className="text-muted-foreground text-xs">Default model behavior</p>
            </div>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleChange("web")}>
          <div
            className={cn("flex items-start gap-2", search === "web" && "text-primary")}
          >
            <div className="flex pt-0.5">
              <Globe size={16} />
            </div>
            <div className="flex flex-col gap-0.5">
              <p>Web</p>
              <p className="text-muted-foreground text-xs">
                Search the web for information
              </p>
            </div>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
