import { logger } from "@/lib/logger";

export function createReasoningTimer() {
  const durations: { id: string; ms: number }[] = [];
  const activeBlocks = new Map<string, number>(); // id -> startTime

  function startBlock(id: string) {
    if (!activeBlocks.has(id)) {
      activeBlocks.set(id, performance.now());
      logger.debug(`Started reasoning block ${id}`);
    }
  }

  function finishBlock(id: string) {
    const startTime = activeBlocks.get(id);
    if (startTime) {
      const elapsed = Math.round(performance.now() - startTime);
      durations.push({ id, ms: elapsed });
      activeBlocks.delete(id);
      logger.debug(`Finished reasoning block ${id} in ${elapsed}ms`);
      return { id, ms: elapsed };
    }
    return null;
  }

  function finish() {
    // Finish any remaining active blocks
    for (const [id, startTime] of activeBlocks) {
      const elapsed = Math.round(performance.now() - startTime);
      durations.push({ id, ms: elapsed });
      logger.debug(`Auto-finished reasoning block ${id} in ${elapsed}ms`);
    }
    activeBlocks.clear();
    return durations;
  }

  return { startBlock, finishBlock, finish, durations };
}
