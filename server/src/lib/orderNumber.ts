import { PrismaClient } from '@prisma/client';

/**
 * Generates a unique, sequential, date-based order number.
 * Format: AVO + YY + MM + DD + 3-digit zero-padded sequence
 * Example: AVO260717001
 *
 * Uses a DailyOrderCounter table with an atomic upsert+increment
 * to guarantee uniqueness under concurrent order creation.
 *
 * @param prisma - Prisma client instance
 * @param date   - Optional date to use (defaults to now). Useful for backfilling historical orders.
 */
export async function generateOrderNumber(
  prisma: PrismaClient,
  date: Date = new Date(),
): Promise<string> {
  const yy = String(date.getUTCFullYear()).slice(-2);          // e.g. "26"
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0'); // e.g. "07"
  const dd = String(date.getUTCDate()).padStart(2, '0');       // e.g. "17"
  const dateKey = `${yy}${mm}${dd}`;                          // e.g. "260717"

  // Atomically increment the counter for this day
  const counter = await (prisma as any).$transaction(async (tx: any) => {
    // Upsert: if the row for today doesn't exist, create it with count=0 first
    await tx.dailyOrderCounter.upsert({
      where:  { date: dateKey },
      create: { date: dateKey, count: 0 },
      update: {},
    });

    // Increment and return the new value
    return tx.dailyOrderCounter.update({
      where: { date: dateKey },
      data:  { count: { increment: 1 } },
    });
  });

  const seq = String(counter.count).padStart(3, '0'); // e.g. "001"
  return `AVO${dateKey}${seq}`;                        // e.g. "AVO260717001"
}
