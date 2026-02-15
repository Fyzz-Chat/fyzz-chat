import type { FileUIPart } from "ai";

export type InputFormState = {
  input: string;
  setInput: (value: string) => void;
  files: FileUIPart[] | FileList | undefined;
  setFiles: (files: FileUIPart[] | FileList | undefined) => void | Promise<void>;
};
