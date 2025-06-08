"use client";

import { Button } from "@/components/ui/button";
import { useInputStore } from "@/stores/input-store";

export default function ExampleButton({ example }: { example: string }) {
  const { setInput } = useInputStore();

  const handleExampleClick = (example: string) => {
    setInput(example);
    setTimeout(() => {
      const textarea = document.getElementById("message-input") as HTMLTextAreaElement;
      if (textarea) {
        textarea.focus();
        const length = example.length;
        textarea.setSelectionRange(length, length);
      }
    }, 0);
  };

  return (
    <Button
      variant="ghost"
      className="w-full justify-start"
      onClick={() => handleExampleClick(example)}
    >
      {example}
    </Button>
  );
}
