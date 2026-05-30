/**
 * Cost-based model gating — shared by server (enforcement) and client (UI disabling).
 * Pure module: no server-only imports, safe to import from client components.
 *
 * Models carry a relative `cost` (1–6). When gating is enabled, a user's tier caps the
 * max model cost they may use. Disabled by default (see config `modelGatingEnabled`),
 * so OSS / self-host deployments filter nothing.
 */

/**
 * Max model cost allowed per subscription tier.
 * Extension point: add tiers here as the pricing ladder grows, e.g. `pro: 4, team: 6`.
 * A subscription absent from this map is treated as unlimited (no gating).
 */
const TIER_MAX_MODEL_COST: Record<string, number> = {
  free: 2,
};

/**
 * Resolve the max model cost a user may use.
 * Returns `null` when there is no limit (gating disabled, or tier not in the map).
 * `null` is used instead of `Infinity` so the value is JSON-serialisable over tRPC.
 */
export function effectiveMaxModelCost(
  subscription: string,
  gatingEnabled: boolean
): number | null {
  if (!gatingEnabled) return null;
  return TIER_MAX_MODEL_COST[subscription] ?? null;
}

/** Whether a model of the given cost is gated for a user with the given max cost. */
export function isModelGated(cost: number, maxCost: number | null): boolean {
  return maxCost !== null && cost > maxCost;
}
