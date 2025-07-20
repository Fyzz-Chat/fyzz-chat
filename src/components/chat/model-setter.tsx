"use client";

import { useModelStore } from "@/stores/model-store";
import { useEffect } from "react";

export default function ModelSetter() {
  const setModel = useModelStore((state) => state.setModel);
  const availableModels = useModelStore((state) => state.availableModels);

  useEffect(() => {
    setModel(availableModels?.[0]?.id ?? "");
  }, []);

  return null;
}
