import { prisma } from "@/lib/config/database";

export async function getUserSettings(userId: string) {
  return await prisma.userSettings.findUnique({
    where: { userId },
    include: {
      currency: true,
      timezone: true,
    },
  });
}

export async function createUserSettings(data: {
  userId: string;
  currencyId: string;
  timezoneId: string;
}) {
  return await prisma.userSettings.create({
    data,
    include: {
      currency: true,
      timezone: true,
    },
  });
}

export async function updateUserSettings(
  userId: string,
  data: {
    currencyId?: string;
    timezoneId?: string;
  }
) {
  return await prisma.userSettings.update({
    where: { userId },
    data,
    include: {
      currency: true,
      timezone: true,
    },
  });
}

export async function upsertUserSettings(data: {
  userId: string;
  currencyId: string;
  timezoneId: string;
}) {
  return await prisma.userSettings.upsert({
    where: { userId: data.userId },
    update: {
      currencyId: data.currencyId,
      timezoneId: data.timezoneId,
    },
    create: data,
    include: {
      currency: true,
      timezone: true,
    },
  });
}

export async function deleteUserSettings(userId: string) {
  return await prisma.userSettings.delete({
    where: { userId },
  });
}