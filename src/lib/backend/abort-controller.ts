export class CompositeAbortController {
  private controller: AbortController;
  public readonly signal: AbortSignal;
  private timeoutId: NodeJS.Timeout | null = null;

  constructor(reqSignal?: AbortSignal) {
    this.controller = new AbortController();
    this.signal = this.controller.signal;

    // Forward abort from request signal
    if (reqSignal && !reqSignal.aborted) {
      reqSignal.addEventListener("abort", () => {
        this.cancelAbort();
        this.controller.abort(reqSignal.reason);
      });
    }

    // If request signal is already aborted, abort immediately
    if (reqSignal?.aborted) {
      this.controller.abort(reqSignal.reason);
    }
  }

  // Programmatic abort method
  abort(reason?: any): void {
    this.cancelAbort();
    this.controller.abort({ message: reason || "Aborted" });
  }

  // Auto-abort after specified seconds
  abortIn(seconds: number, reason?: any): void {
    if (this.aborted) return; // Don't set timeout if already aborted

    this.cancelAbort(); // Cancel any existing timeout

    this.timeoutId = setTimeout(() => {
      this.controller.abort({ message: reason || `Timeout after ${seconds} seconds` });
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
