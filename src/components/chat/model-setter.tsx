"use client";

import { useModelStore } from "@/stores/model-store";
import { useEffect } from "react";

export default function ModelSetter() {
  const { setModel, availableModels } = useModelStore();

  useEffect(() => {
    setModel(availableModels?.[0]?.id ?? "");
  }, []);

  return null;
}
