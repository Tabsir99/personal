import { firestore } from "firebase-admin";
import { db } from "../config/firebaseAdmin";
import { Collections, ValidCollections } from "@/lib/constants";

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
    await docRef.set(data as any, { merge: true });
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
  const dataToPut = { ...updatedData };
  Object.entries(dataToPut as any).forEach(([key, value]) => {
    if (Array.isArray(value) && value.length > 0) {
      dataToPut[key] = firestore.FieldValue.arrayUnion(...value);
    }
  });

  try {
    const docRef = db.collection(Collections[collectionName]).doc(docId);
    await docRef.set(updatedData as any, { merge });
  } catch (err) {}
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

interface ReadNDocsParams<T> {
  collectionName: ValidCollections;
  limit?: number;
  filters?: Partial<{ [K in keyof T]: T[K] }>;
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
  cursorValue,
  fieldsToRead,
  orderBy,
}: ReadNDocsParams<T>): Promise<T[]> => {
  try {
    let query = db.collection(Collections[collectionName]).limit(limit);

    Object.entries(filters).forEach(([field, value]) => {
      query = query.where(field, "==", value);
    });

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

interface ReadSingleDocParams<T> {
  collectionName: ValidCollections;
  docId: string;
  fieldsToRead?: Partial<Record<keyof T, boolean>>;
}

export const readSingleDoc = async <T>({
  collectionName,
  docId,
  fieldsToRead,
}: ReadSingleDocParams<T>): Promise<T | null> => {
  try {
    const query = db
      .collection(Collections[collectionName])
      .where("blogId", "==", docId)
      .limit(1);

    const finalQuery = fieldsToRead
      ? query.select(
          ...Object.keys(fieldsToRead).filter((key) => fieldsToRead[key]),
        )
      : query;

    const snapshot = await finalQuery.get();

    if (snapshot.empty) {
      return null;
    }

    return snapshot.docs[0].data() as T;
  } catch (error) {
    console.error(`Error reading document from ${collectionName}:`, error);
    throw error; // Re-throw to allow handling at higher level
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

    console.info("Document moved successfully");
  } catch (err) {
    throw err;
  }
};
