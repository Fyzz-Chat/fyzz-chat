import type { ReactNode } from "react";

export default function TextPart({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div
      className="wrap-break-word w-fit whitespace-pre-wrap rounded-lg border bg-card p-4 text-card-foreground"
      data-role="user"
      style={{ wordBreak: "break-word" }}
    >
      <p className="leading-7">{children}</p>
    </div>
  );
}
