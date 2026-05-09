import { firestore } from "firebase-admin";
import { db, Collections, ValidCollections } from "../config/firebaseAdmin";

interface CreateDataParams<T> {
  collectionName: ValidCollections;
  docId: string;
  data: T;
}

export const createData = async <T>({
  collectionName,
  docId,
  data,
}: CreateDataParams<T>) => {
  const docRef = db.collection(Collections[collectionName]).doc(docId);
  await docRef.create(data as any);
  return true;
};

interface UpdateDataParams<T> {
  collectionName: ValidCollections;
  docId: string;
  updatedData: Partial<T>;
  merge?: boolean;
}

export const updateData = async <T>({
  collectionName,
  docId,
  updatedData,
  merge = true,
}: UpdateDataParams<T>) => {
  const dataToPut: Record<string, unknown> = { ...updatedData };
  // arrayUnion is only valid with merge:true.
  if (merge) {
    for (const [key, value] of Object.entries(dataToPut)) {
      if (Array.isArray(value) && value.length > 0) {
        dataToPut[key] = firestore.FieldValue.arrayUnion(...value);
      }
    }
  }

  const docRef = db.collection(Collections[collectionName]).doc(docId);
  await docRef.set(dataToPut as any, { merge });
};

export const readAllDocs = async <T = any>(
  collectionName: string,
): Promise<T[]> => {
  const docs: T[] = [];
  const querySnapshot = await db
    .collection(collectionName)
    .orderBy("createdAt", "desc")
    .get();

  querySnapshot.forEach((doc) => {
    docs.push(doc.data() as T);
  });

  return docs;
};

type ArrayContains<T> = {
  [K in keyof T]?: T[K] extends Array<infer U> ? U : never;
};

interface ReadNDocsParams<T> {
  collectionName: ValidCollections;
  limit?: number;
  filters?: Partial<{ [K in keyof T]: T[K] }>;
  arrayContainsFilters?: ArrayContains<T>;
  cursorValue: string | null;
  fieldsToRead?: Partial<Record<keyof T, boolean>>;
  orderBy?: {
    field: keyof T;
    order: firestore.OrderByDirection;
  };
}

export const readNDocs = async <T>({
  collectionName,
  limit = 30,
  filters = {},
  arrayContainsFilters,
  cursorValue,
  fieldsToRead,
  orderBy,
}: ReadNDocsParams<T>): Promise<T[]> => {
  let query = db.collection(Collections[collectionName]).limit(limit);

  Object.entries(filters).forEach(([field, value]) => {
    query = query.where(field, "==", value);
  });

  if (arrayContainsFilters) {
    Object.entries(arrayContainsFilters).forEach(([field, value]) => {
      if (value !== undefined) {
        query = query.where(field, "array-contains", value);
      }
    });
  }

  if (fieldsToRead) {
    query = query.select(
      ...Object.keys(fieldsToRead).filter((key) => fieldsToRead[key]),
    );
  }

  if (orderBy) {
    query = query.orderBy(orderBy.field as string, orderBy.order);
  }

  if (cursorValue) {
    query = query.startAfter(cursorValue);
  }
  const querySnapshot = await query.get();

  return querySnapshot.docs.map((d) => d.data()) as T[];
};

export const deleteDoc = async ({
  collectionName,
  docId,
}: {
  collectionName: ValidCollections;
  docId: string;
}) => {
  const docRef = db.collection(Collections[collectionName]).doc(docId);
  await docRef.delete();
};

export const moveDocument = async ({
  sourceCollection,
  sourceDocId,
  targetCollection,
  targetDocId,
}: {
  sourceCollection: string;
  sourceDocId: string;
  targetCollection: string;
  targetDocId: string;
}) => {
  const sourceDoc = await db
    .collection(sourceCollection)
    .doc(sourceDocId)
    .get();

  if (!sourceDoc.exists) {
    throw new Error("Source document does not exist");
  }

  const data = sourceDoc.data();
  await db.collection(targetCollection).doc(targetDocId).set(data!);
  await db.collection(sourceCollection).doc(sourceDocId).delete();
};
