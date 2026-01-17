"use client";

import type { FileUIPart } from "ai";
import { useCallback, useEffect, useRef, useState } from "react";
import { debounce } from "@/lib/utils";
import { processFilesWithScaling } from "@/lib/utils/file-processing";
import type { InputFormState } from "@/types/input-form";

export const useInputForm = (): InputFormState => {
  const [input, setInputValue] = useState("");
  const [files, setFilesValue] = useState<FileUIPart[] | FileList | undefined>(undefined);

  // Debounced localStorage persistence for input
  const persistInput = useRef(
    debounce((value: string) => {
      if (value) {
        localStorage.setItem("fyzz-input-content", value);
      } else {
        localStorage.removeItem("fyzz-input-content");
      }
    }, 1000)
  ).current;

  // Load input from localStorage on mount
  useEffect(() => {
    const storedInput = localStorage.getItem("fyzz-input-content");
    if (storedInput) {
      setInputValue(storedInput);
    }
  }, []);

  // Stable setInput with persistence
  const setInput = useCallback(
    (value: string) => {
      setInputValue(value);
      persistInput(value);
    },
    [persistInput]
  );

  // Stable setFiles with image scaling
  const setFiles = useCallback(async (newFiles: FileUIPart[] | FileList | undefined) => {
    const processed = await processFilesWithScaling(newFiles);
    setFilesValue(processed);
  }, []);

  return {
    input,
    setInput,
    files,
    setFiles,
  };
};
