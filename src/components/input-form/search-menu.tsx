"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useChatStore } from "@/stores/chat-store";
import { useModelStore } from "@/stores/model-store";
import { Globe } from "lucide-react";
import { useEffect, useState } from "react";

export default function SearchMenu() {
  const model = useModelStore((state) => state.model);
  const searchSupport = model.features?.some((feature) => feature.name === "Search");
  const isSonar = model.id === "sonar" || model.id === "sonar-pro";
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
        <DropdownMenuRadioGroup value={search} onValueChange={handleChange}>
          <DropdownMenuRadioItem value="none">None</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="web">Web</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
