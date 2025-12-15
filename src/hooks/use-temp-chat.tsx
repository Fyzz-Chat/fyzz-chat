import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useModelStore } from "@/stores/model-store";

export default function useTempChat() {
  const setTemporaryChat = useModelStore((state) => state.setTemporaryChat);
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname.includes("/temp")) {
      setTemporaryChat(false);
    }
  }, [pathname, setTemporaryChat]);
}
