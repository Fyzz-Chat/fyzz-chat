"use client";

import { useQuery } from "@tanstack/react-query";
import { SparklesIcon } from "lucide-react";
import { useParams, usePathname } from "next/navigation";
import { type KeyboardEvent, type ReactNode, useEffect, useMemo, useState } from "react";
import { usePromptInputController } from "@/components/ai-elements/prompt-input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import { useTRPC } from "@/lib/trpc/client";

const SLASH_RE = /(?:^|\s)\/([a-z0-9-]*)$/;

interface SkillSlashMenuProps {
  children: ReactNode;
  skillsEnabled: boolean;
  supportsTools: boolean;
}

export function SkillSlashMenu({
  children,
  skillsEnabled,
  supportsTools,
}: SkillSlashMenuProps) {
  const { textInput } = usePromptInputController();

  const trpc = useTRPC();
  const pathname = usePathname();
  const params = useParams();
  const pathId = typeof params.id === "string" ? params.id : undefined;
  const projectIdFromPath = pathname.startsWith("/projects/") ? pathId : undefined;
  const conversationIdFromPath = pathname.startsWith("/chat/") ? pathId : undefined;

  const { data: skills = [] } = useQuery({
    ...trpc.skillsInScope.queryOptions({
      conversationId: conversationIdFromPath,
      projectId: projectIdFromPath,
    }),
    enabled: skillsEnabled && supportsTools,
  });

  const slug = useMemo(() => {
    if (!skillsEnabled || !supportsTools) return null;
    const match = textInput.value.match(SLASH_RE);
    return match ? match[1] : null;
  }, [textInput.value, skillsEnabled, supportsTools]);

  const matches = useMemo(() => {
    if (slug === null) return [];
    if (slug === "") return skills;
    return skills.filter((s) => s.name.includes(slug));
  }, [skills, slug]);

  const open = slug !== null && matches.length > 0;
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  useEffect(() => {
    setHighlightedIndex(0);
  }, []);

  useEffect(() => {
    if (highlightedIndex >= matches.length) {
      setHighlightedIndex(0);
    }
  }, [matches.length, highlightedIndex]);

  function applySelection(skillName: string) {
    const next = textInput.value.replace(SLASH_RE, (match) => {
      const leading = match.startsWith("/") ? "" : match[0];
      return `${leading}/${skillName} `;
    });
    textInput.setInput(next);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!open) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      event.stopPropagation();
      setHighlightedIndex((i) => (i + 1) % matches.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      event.stopPropagation();
      setHighlightedIndex((i) => (i - 1 + matches.length) % matches.length);
    } else if (event.key === "Enter") {
      const selected = matches[highlightedIndex];
      if (selected) {
        event.preventDefault();
        event.stopPropagation();
        applySelection(selected.name);
      }
    } else if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      textInput.setInput(textInput.value.replace(SLASH_RE, (match) => match[0] ?? ""));
    }
  }

  return (
    <div onKeyDownCapture={handleKeyDown}>
      <Popover open={open}>
        <PopoverAnchor asChild>{children}</PopoverAnchor>
        <PopoverContent
          align="start"
          side="top"
          sideOffset={8}
          className="w-[min(28rem,var(--radix-popover-trigger-width))] p-0"
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <Command shouldFilter={false} value={matches[highlightedIndex]?.name ?? ""}>
            <CommandList>
              <CommandEmpty>No skills found.</CommandEmpty>
              <CommandGroup heading="Skills">
                {matches.map((skill) => (
                  <CommandItem
                    key={skill.id}
                    value={skill.name}
                    onSelect={() => applySelection(skill.name)}
                  >
                    <SparklesIcon className="mr-2 size-3.5 shrink-0" />
                    <span className="font-mono">{skill.name}</span>
                    <span className="ml-2 truncate text-muted-foreground text-xs">
                      {skill.description}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
