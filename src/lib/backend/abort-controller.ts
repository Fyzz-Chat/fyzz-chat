export class CompositeAbortController {
  private controller: AbortController;
  public readonly signal: AbortSignal;
  private timeoutId: NodeJS.Timeout | null = null;

  constructor(reqSignal?: AbortSignal) {
    this.controller = new AbortController();
    this.signal = this.controller.signal;

    // Forward abort from request signal
    if (reqSignal && !reqSignal.aborted) {
      reqSignal.addEventListener(
        "abort",
        () => {
          this.cancelAbort();
          this.controller.abort(normalizeAbortReason(reqSignal.reason));
        },
        { once: true }
      );
    }

    // If request signal is already aborted, abort immediately
    if (reqSignal?.aborted) {
      this.controller.abort(normalizeAbortReason(reqSignal.reason));
    }
  }

  // Auto-abort after specified seconds
  abortIn(seconds: number, reason?: any): void {
    if (this.aborted) return; // Don't set timeout if already aborted

    this.cancelAbort(); // Cancel any existing timeout

    this.timeoutId = setTimeout(() => {
      const msg = reason || `Timeout after ${seconds} seconds`;
      this.controller.abort(normalizeAbortReason(msg));
      this.timeoutId = null;
    }, seconds * 1000);
  }

  // Cancel any pending auto-abort
  cancelAbort(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  // Check if aborted
  get aborted(): boolean {
    return this.signal.aborted;
  }
}

function normalizeAbortReason(reason?: any): any {
  return new Error(reason || "Aborted");

  // If already an AbortError/DOMException, keep it
  // if (reason instanceof Error && reason.name === "AbortError") return reason;
  // // Prefer DOMException when available for web compatibility
  // const message = typeof reason === "string" ? reason : "Aborted";
  // try {
  //   // DOMException may not exist in some Node runtimes
  //   // eslint-disable-next-line no-new
  //   const domEx = new (globalThis as any).DOMException(message, "AbortError");
  //   return domEx;
  // } catch {
  //   const err = new Error(message);
  //   (err as any).name = "AbortError";
  //   return err;
  // }
}
