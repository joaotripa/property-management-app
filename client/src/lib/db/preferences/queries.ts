import { prisma } from "@/lib/config/database";

export async function getAllCurrencies() {
  return await prisma.currency.findMany({
    where: { isActive: true },
    orderBy: [
      { code: 'asc' },
    ],
  });
}

export async function getAllTimezones() {
  return await prisma.timezone.findMany({
    where: { isActive: true },
    orderBy: [
      { label: 'asc' },
    ],
  });
}

export async function getCurrencyById(id: string) {
  return await prisma.currency.findUnique({
    where: { id },
  });
}

export async function getTimezoneById(id: string) {
  return await prisma.timezone.findUnique({
    where: { id },
  });
}

export async function getCurrencyByCode(code: string) {
  return await prisma.currency.findUnique({
    where: { code },
  });
}

export async function getTimezoneByIana(iana: string) {
  return await prisma.timezone.findUnique({
    where: { iana },
  });
}

export async function getDefaultCurrency() {
  // Default to EUR as the primary currency
  return await prisma.currency.findUnique({
    where: { code: 'EUR' },
  });
}

export async function getDefaultTimezone() {
  // Default to London timezone
  return await prisma.timezone.findUnique({
    where: { iana: 'Europe/London' },
  });
}