import "server-only";
import prisma from "@/lib/prisma/prisma";

async function getSystemSetting(key: string): Promise<string | null> {
  const row = await prisma.systemSetting.findUnique({ where: { key } });
  return row?.value ?? null;
}

async function setSystemSetting(key: string, value: string): Promise<void> {
  await prisma.systemSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

export async function getOrCreateDeploymentId(): Promise<string | null> {
  try {
    const existing = await getSystemSetting("deployment_id");
    if (existing) return existing;

    const id = crypto.randomUUID();
    await setSystemSetting("deployment_id", id);
    return id;
  } catch {
    return null;
  }
}
