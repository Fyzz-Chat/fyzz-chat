import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="grid place-items-center h-screen">
      <Loader2 size={40} className="animate-spin text-primary" />
    </div>
  );
}
