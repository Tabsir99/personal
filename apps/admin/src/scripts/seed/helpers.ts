import type { Firestore, DocumentReference } from "firebase-admin/firestore";

export function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function weightedPick<T>(pairs: Array<readonly [T, number]>): T {
  const r = Math.random();
  let acc = 0;
  for (const [value, weight] of pairs) {
    acc += weight;
    if (r <= acc) return value;
  }
  return pairs[pairs.length - 1][0];
}

export function isoDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

// Firestore caps batches at 500 writes. Keep a margin.
const BATCH_LIMIT = 450;

export async function batchedWrites(
  db: Firestore,
  items: Iterable<[DocumentReference, unknown]>,
): Promise<number> {
  let batch = db.batch();
  let count = 0;
  let total = 0;
  for (const [ref, data] of items) {
    batch.set(
      ref,
      data as FirebaseFirestore.WithFieldValue<FirebaseFirestore.DocumentData>,
    );
    count += 1;
    total += 1;
    if (count >= BATCH_LIMIT) {
      await batch.commit();
      batch = db.batch();
      count = 0;
    }
  }
  if (count > 0) await batch.commit();
  return total;
}
