"use client";

import type * as React from "react";
import { Input } from "@/components/ui/input";
import { useFileStore } from "@/stores/file-store";
import { useModelStore } from "@/stores/model-store";

function FileUploadInput({ ...props }: React.ComponentProps<typeof Input>) {
  const setFiles = useFileStore((state) => state.setFiles);
  const extensions = useModelStore((state) => state.model?.extensions);

  return (
    <Input
      data-slot="file-upload-input"
      type="file"
      multiple
      onChange={(event) => {
        if (event.target.files) {
          setFiles(event.target.files);
        }
      }}
      accept={extensions?.join(",")}
      className="hidden"
      {...props}
    />
  );
}

export default FileUploadInput;
