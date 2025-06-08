"use server";

import "server-only";

import { getUserIdFromSession } from "@/lib/dao/users";
import prisma from "@/lib/prisma/prisma";

export async function readNotification(notificationId: number): Promise<void> {
  const userId = await getUserIdFromSession();

  await prisma.notification.update({
    where: {
      id: notificationId,
      userId,
    },
    data: {
      read: true,
    },
  });
}

export async function readNotifications(notificationIds: number[]): Promise<void> {
  const userId = await getUserIdFromSession();

  await prisma.notification.updateMany({
    where: {
      id: {
        in: notificationIds,
      },
      userId,
    },
    data: {
      read: true,
    },
  });
}
