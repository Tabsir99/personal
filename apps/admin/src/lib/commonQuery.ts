import { firestore } from "firebase-admin";

import { db } from "../config/firebaseAdminBlog";

import { formatResponse } from "@/utils/utils";

export const createData = async ({
  collectionName,
  docId,
  data,
}: {
  collectionName: string;
  docId: string;
  data: any;
}) => {
  try {
    const docRef = db.collection(collectionName).doc(docId);
    await docRef.set(data, { merge: true });
    return formatResponse("success", null, "Blog uploaded succesfully");
  } catch (err) {
    throw err;
  }
};

export const updateData = async (collectionName, docID, updatedData) => {
  const dataToPut = updatedData;
  Object.entries(dataToPut).forEach(([key, value]) => {
    if (Array.isArray(value))
      dataToPut[key] = firestore.FieldValue.arrayUnion(...value);
  });

  try {
    const docRef = db.collection(collectionName).doc(docID);
    await docRef.set(updatedData, { merge: true });
  } catch (err) {}
};

export const readAllDocs = async <T = any>(
  collectionName: string
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

export const readDocsFields = async <T = any>({
  collection,
  feildsToRead,
  feildsToQueryBy = null,
  feildsValues = null,
  limit = 999,
  orderBy = "blogMetadata.updatedAt",
}: {
  collection: string;
  feildsToRead: (keyof T)[];
  feildsToQueryBy: (keyof T)[] | null;
  feildsValues: string[] | null;
  limit?: number;
  orderBy?: string;
}): Promise<T[]> => {
  const collectionRef = db.collection(collection);
  feildsToRead;
  let query = collectionRef
    .select(...(feildsToRead as string[]))
    .limit(limit)
    .orderBy(orderBy, "desc");

  if (
    feildsToQueryBy &&
    feildsValues &&
    feildsToQueryBy.length === feildsValues.length
  ) {
    feildsToQueryBy.forEach((feild, index) => {
      query = query.where(feild as string, "==", feildsValues[index]);
    });
  }

  const querySnapshot = await query.get();

  const docs: any[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();

    docs.push(data);
  });
  return docs;
};

export const readNDocs = async ({
  collectionName,
  limitNumber,
  filter,
  cursorValue,
}: {
  collectionName: string;
  limitNumber: number;
  filter: { filterBy: string[]; filterValues: string[] };
  cursorValue: string | null;
}) => {
  try {
    const docs: any[] = [];
    let query = db
      .collection(collectionName)
      .orderBy("createdAt", "desc")
      .limit(limitNumber);

    filter.filterBy.forEach((feild, index) => {
      query = query.where(feild, "==", filter.filterValues[index]);
    });

    if (cursorValue) {
      query = query.startAfter(cursorValue);
    }
    const querySnapshot = await query.get();

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      docs.push(data);
    });

    return docs;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const readSingleDoc = async <T = any>({
  collectionName,
  docId,
}: {
  collectionName: string;
  docId: string;
}): Promise<T | null> => {
  const docRef = db.collection(collectionName).doc(docId);

  const doc = await docRef.get();

  if (doc.exists) {
    const data = doc.data() as any;

    return data;
  } else {
    return null;
  }
};

export const deleteData = async ({
  collectionName,
  docId,
}: {
  collectionName: string;
  docId: string;
}) => {
  try {
    const docRef = db.collection(collectionName).doc(docId);
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

    console.log("Document moved successfully");
  } catch (err) {
    throw err;
  }
};

