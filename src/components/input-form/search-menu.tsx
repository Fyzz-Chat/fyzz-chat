"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useChatStore } from "@/stores/chat-store";
import { useModelStore } from "@/stores/model-store";
import { useEffect, useState } from "react";

export default function SearchMenu() {
  const model = useModelStore((state) => state.model);
  const isSonar = model.id === "sonar" || model.id === "sonar-pro";
  const [search, setSearch] = useState(isSonar ? "web" : "none");
  const { setBrowse } = useChatStore();

  // Update search state when model changes
  useEffect(() => {
    setSearch(isSonar ? "web" : "none");
  }, [isSonar]);

  function handleChange(value: string) {
    setSearch(value);
    setBrowse(value === "web");
  }

  return (
    <Select value={search} onValueChange={handleChange}>
      <SelectTrigger disabled={isSonar}>
        <SelectValue placeholder="Search" />
      </SelectTrigger>
      <SelectContent onCloseAutoFocus={(e) => e.preventDefault()}>
        <SelectGroup>
          <SelectLabel>Search type</SelectLabel>
          <SelectItem value="none">None</SelectItem>
          <SelectItem value="web">Web</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
