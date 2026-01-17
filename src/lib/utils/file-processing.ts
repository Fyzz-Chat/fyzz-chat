import type { FileUIPart } from "ai";

export const scaleImageToMaxSize = async (
  file: File,
  maxSizeKB = 3000
): Promise<Blob> => {
  const maxSize = maxSizeKB * 1024;
  if (file.size <= maxSize) {
    console.debug("Image fits the size limit");
    return file;
  }

  const img = new Image();
  img.src = URL.createObjectURL(file);
  await new Promise((resolve) => {
    img.onload = resolve;
  });

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");

  const originalExtension = file.name.split(".").pop()?.toLowerCase();
  const mimeType =
    originalExtension === "png"
      ? "image/png"
      : originalExtension === "webp"
        ? "image/webp"
        : "image/jpeg";

  let scale = 0.8;
  while (scale > 0.1) {
    console.debug("Scaling image to", scale.toFixed(2));
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
        },
        mimeType,
        0.8
      );
    });

    if (blob.size <= maxSize) {
      console.debug(`New size is ${(blob.size / 1024).toFixed(2)}KB`);
      return blob;
    }
    scale *= 0.8;
  }
  throw new Error("Unable to reduce image size below 3000KB");
};

export const processFilesWithScaling = async (
  files: FileUIPart[] | FileList | undefined
): Promise<FileList | FileUIPart[] | undefined> => {
  if (!files) return undefined;

  // If it's already FileUIPart[], return as-is
  if (!("length" in files) || !(files instanceof FileList)) {
    return files as FileUIPart[];
  }

  try {
    const processedFiles = new DataTransfer();
    for (const file of Array.from(files)) {
      if (file.type.startsWith("image/")) {
        const scaledBlob = await scaleImageToMaxSize(file);
        const scaledFile = new File([scaledBlob], file.name, { type: file.type });
        processedFiles.items.add(scaledFile);
      } else {
        processedFiles.items.add(file);
      }
    }
    return processedFiles.files;
  } catch (error) {
    console.error("Error processing files:", error);
    return files;
  }
};
