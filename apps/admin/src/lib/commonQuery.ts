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
  try {
    const docRef = db.collection(Collections[collectionName]).doc(docId);
    await docRef.create(data as any);
    return true;
  } catch (err) {
    console.error(err);
    throw err;
  }
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

  try {
    const docRef = db.collection(Collections[collectionName]).doc(docId);
    await docRef.set(dataToPut as any, { merge });
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const readAllDocs = async <T = any>(
  collectionName: string,
): Promise<T[]> => {
  try {
    const docs: T[] = [];
    const querySnapshot = await db
      .collection(collectionName)
      .orderBy("createdAt", "desc")
      .get();

    querySnapshot.forEach((doc) => {
      const data = doc.data() as any;
      docs.push(data);
    });

    return docs;
  } catch (err) {
    console.error(err);
    return [];
  }
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
  try {
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
  } catch (error) {
    console.error(error);
    return [];
  }
};

interface ReadSingleBlogParams<T> {
  docId: string;
  fieldsToRead?: Partial<Record<keyof T, boolean>>;
}

export const readSingleBlog = async <T>({
  docId,
  fieldsToRead,
}: ReadSingleBlogParams<T>): Promise<T | null> => {
  try {
    const docRef = db.collection(Collections.BLOGS).doc(docId);
    const snapshot = await docRef.get();

    if (!snapshot.exists) return null;

    const data = snapshot.data() as Record<string, unknown>;

    if (!fieldsToRead) return data as T;

    const projected: Record<string, unknown> = {};
    for (const [field, include] of Object.entries(fieldsToRead)) {
      if (include) projected[field] = data[field];
    }
    return projected as T;
  } catch (error) {
    console.error(`Error reading blog ${docId}:`, error);
    throw error;
  }
};

export const deleteDoc = async ({
  collectionName,
  docId,
}: {
  collectionName: ValidCollections;
  docId: string;
}) => {
  try {
    const docRef = db.collection(Collections[collectionName]).doc(docId);
    await docRef.delete();
  } catch (err) {
    throw err;
  }
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
  try {
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
  } catch (err) {
    throw err;
  }
};
