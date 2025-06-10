import { useModelStore } from "@/stores/model-store";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function useTempChat() {
  const { setTemporaryChat } = useModelStore();
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname.includes("/temp")) {
      setTemporaryChat(false);
    }
  }, [pathname, setTemporaryChat]);
}
