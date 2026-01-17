"use client";

import { createContext, useContext } from "react";
import type { InputFormState } from "@/types/input-form";

export const InputFormContext = createContext<InputFormState | null>(null);

export const useInputFormContext = () => {
  const context = useContext(InputFormContext);
  if (!context) {
    throw new Error("useInputFormContext must be used within InputFormProvider");
  }
  return context;
};
