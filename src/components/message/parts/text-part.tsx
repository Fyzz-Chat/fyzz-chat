import type { ReactNode } from "react";

export default function TextPart({ children }: { children: ReactNode }) {
  return (
    <div
      className="rounded-lg p-4 border whitespace-pre-wrap break-words bg-card text-card-foreground w-fit"
      data-role="user"
      style={{ wordBreak: "break-word" }}
    >
      <p className="leading-7">{children}</p>
    </div>
  );
}
