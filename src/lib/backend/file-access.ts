// A user may only access files whose S3 key sits under their own id prefix
// (keys are stored as `${userId}/${conversationId}/${fileId}`). Rejects empty
// keys, empty users, and any path-traversal segments as defense in depth.
export function isOwnedFileKey(key: string, userId: string): boolean {
  if (!key || !userId) {
    return false;
  }
  const segments = key.split("/");
  if (segments.some((segment) => segment === "" || segment === "." || segment === "..")) {
    return false;
  }
  return key.startsWith(`${userId}/`);
}
