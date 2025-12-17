import { useChatStore } from "@/stores/chat-store";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

export default function StableIdInitializer() {
  const params = useParams();
  const setStableId = useChatStore((state) => state.setStableId);

  useEffect(() => {
    if (params.id) {
      setStableId(params.id);
    } else {
      setStableId(uuidv4());
    }
  }, [params.id, setStableId]);

  return null;
}
