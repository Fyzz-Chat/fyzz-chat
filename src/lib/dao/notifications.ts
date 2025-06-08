import "server-only";

import { getUserIdFromSession } from "@/lib/dao/users";
import prisma from "@/lib/prisma/prisma";

export async function getNotifications() {
  const userId = await getUserIdFromSession();

  return prisma.notification.findMany({
    where: {
      userId,
    },
  });
}
