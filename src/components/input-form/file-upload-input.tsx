"use client";

import { Input } from "@/components/ui/input";
import { useFileStore } from "@/stores/file-store";
import { useModelStore } from "@/stores/model-store";
import { type InputHTMLAttributes, forwardRef } from "react";

interface FileUploadInputProps extends InputHTMLAttributes<HTMLInputElement> {}

const FileUploadInput = forwardRef<HTMLInputElement, FileUploadInputProps>(
  ({ ...props }, ref) => {
    const { setFiles } = useFileStore();
    const imageSupport = useModelStore((state) => state.isImageSupportEnabled());
    const pdfSupport = useModelStore((state) => state.isPdfSupportEnabled());

    return (
      <Input
        ref={ref}
        type="file"
        multiple
        onChange={(event) => {
          if (event.target.files) {
            setFiles(event.target.files);
          }
        }}
        accept={`${imageSupport ? "image/png,image/jpeg,image/jpg,image/webp" : ""}${imageSupport && pdfSupport ? "," : ""}${pdfSupport ? "application/pdf" : ""}`}
        className="hidden"
        {...props}
      />
    );
  }
);

FileUploadInput.displayName = "FileUploadInput";

export default FileUploadInput;
