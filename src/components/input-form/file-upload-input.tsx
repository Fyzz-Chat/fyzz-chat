"use client";

import { Input } from "@/components/ui/input";
import { useFileStore } from "@/stores/file-store";
import { type InputHTMLAttributes, forwardRef } from "react";

interface FileUploadInputProps extends InputHTMLAttributes<HTMLInputElement> {
  imageSupport?: boolean;
  pdfSupport?: boolean;
}

const FileUploadInput = forwardRef<HTMLInputElement, FileUploadInputProps>(
  ({ imageSupport, pdfSupport, ...props }, ref) => {
    const { setFiles } = useFileStore();

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
