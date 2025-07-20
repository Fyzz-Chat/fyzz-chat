"use client";

import { Input } from "@/components/ui/input";
import { useFileStore } from "@/stores/file-store";
import { type ChangeEvent, type InputHTMLAttributes, forwardRef } from "react";

const CameraCaptureInput = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>((props, ref) => {
  const setFiles = useFileStore((state) => state.setFiles);

  function handlePhotoCapture(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files && event.target.files.length > 0) {
      try {
        // Ensure we have a valid file
        const file = event.target.files[0];
        if (!file.type.startsWith("image/")) {
          console.error("Invalid file type from camera");
          return;
        }

        // Create a new File object to ensure proper handling
        const processedFile = new File(
          [file],
          `camera-${Date.now()}.${file.type.split("/")[1]}`,
          {
            type: file.type,
          }
        );

        // Create a new FileList with the processed file
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(processedFile);

        setFiles(dataTransfer.files);
      } catch (error) {
        console.error("Error processing camera input:", error);
      }
    }
  }

  return (
    <Input
      ref={ref}
      type="file"
      capture="environment"
      accept="image/*"
      className="hidden"
      onChange={handlePhotoCapture}
      {...props}
    />
  );
});

CameraCaptureInput.displayName = "CameraCaptureInput";

export default CameraCaptureInput;
