import { describe, expect, it } from "bun:test";
import {
  type AttachmentError,
  filterValidFiles,
} from "../src/components/ai-elements/prompt-input";

function file(name: string, type: string, size: number): File {
  return new File([new Uint8Array(size)], name, { type });
}

describe("filterValidFiles — partial-batch feedback", () => {
  it("fires max_file_size with a count yet still stages the valid file", () => {
    const errors: AttachmentError[] = [];
    const result = filterValidFiles(
      [file("ok.png", "image/png", 5), file("huge.png", "image/png", 100)],
      { maxFileSize: 10, currentCount: 0, onError: (e) => errors.push(e) }
    );
    expect(result.map((f) => f.name)).toEqual(["ok.png"]);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatchObject({ code: "max_file_size", count: 1 });
  });

  it("counts every oversized file in the batch", () => {
    const errors: AttachmentError[] = [];
    const result = filterValidFiles(
      [
        file("a.png", "image/png", 100),
        file("b.png", "image/png", 100),
        file("ok.png", "image/png", 1),
      ],
      { maxFileSize: 10, currentCount: 0, onError: (e) => errors.push(e) }
    );
    expect(result.map((f) => f.name)).toEqual(["ok.png"]);
    expect(errors[0]).toMatchObject({ code: "max_file_size", count: 2 });
  });

  it("fires accept with a count yet still stages the matching file", () => {
    const errors: AttachmentError[] = [];
    const result = filterValidFiles(
      [file("a.png", "image/png", 1), file("b.pdf", "application/pdf", 1)],
      { accept: "image/*", currentCount: 0, onError: (e) => errors.push(e) }
    );
    expect(result.map((f) => f.name)).toEqual(["a.png"]);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatchObject({ code: "accept", count: 1 });
  });

  it("stays silent for a fully valid batch", () => {
    const errors: AttachmentError[] = [];
    const result = filterValidFiles(
      [file("a.png", "image/png", 1), file("b.png", "image/png", 2)],
      {
        accept: "image/*",
        maxFileSize: 10,
        currentCount: 0,
        onError: (e) => errors.push(e),
      }
    );
    expect(result).toHaveLength(2);
    expect(errors).toHaveLength(0);
  });

  it("still rejects (with count) when every file is too large", () => {
    const errors: AttachmentError[] = [];
    const result = filterValidFiles(
      [file("a.png", "image/png", 100), file("b.png", "image/png", 100)],
      { maxFileSize: 10, currentCount: 0, onError: (e) => errors.push(e) }
    );
    expect(result).toHaveLength(0);
    expect(errors[0]).toMatchObject({ code: "max_file_size", count: 2 });
  });
});
