import { getFirebaseHealth, getFirestore } from "./firebaseAdmin";
import { EventFilters, EventRecord } from "../types/arduino";

const COLLECTION = "events";

export class EventRepository {
  async create(event: EventRecord): Promise<EventRecord> {
    const db = getFirestore();
    if (!db) return event;

    const docRef = event.id
      ? db.collection(COLLECTION).doc(event.id)
      : db.collection(COLLECTION).doc();
    const record = { ...event, id: docRef.id };
    await docRef.set(record);
    return record;
  }

  async update(id: string, updates: Partial<EventRecord>): Promise<void> {
    const db = getFirestore();
    if (!db) return;

    await db.collection(COLLECTION).doc(id).set(updates, { merge: true });
  }

  async findById(id: string): Promise<EventRecord | null> {
    const db = getFirestore();
    if (!db) return null;

    const snapshot = await db.collection(COLLECTION).doc(id).get();
    if (!snapshot.exists) return null;

    return snapshot.data() as EventRecord;
  }

  async findMany(filters: EventFilters): Promise<EventRecord[]> {
    const db = getFirestore();
    if (!db) return [];

    let query: FirebaseFirestore.Query = db.collection(COLLECTION);

    if (filters.type) query = query.where("type", "==", filters.type);
    if (filters.status) query = query.where("status", "==", filters.status);
    if (filters.from) query = query.where("startedAt", ">=", filters.from);
    if (filters.to) query = query.where("startedAt", "<=", filters.to);

    query = query.orderBy("startedAt", "desc").limit(filters.limit || 50);

    const snapshot = await query.get();
    return snapshot.docs.map((doc) => doc.data() as EventRecord);
  }

  isReady(): boolean {
    return getFirebaseHealth().connected;
  }
}
