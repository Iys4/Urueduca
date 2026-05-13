import { getDB } from '../db';

export class BaseRepository {
    constructor(storeName) {
        this.storeName = storeName;
    }

    async getAll(userId = null) {
        const db = await getDB();
        if (userId && this.storeName !== STORES.USERS) {
            return db.getAllFromIndex(this.storeName, 'userId', userId);
        }
        return db.getAll(this.storeName);
    }

    async getById(id, userId = null) {
        const db = await getDB();
        const item = await db.get(this.storeName, id);
        if (item && userId && item.userId !== userId && this.storeName !== STORES.USERS) {
            return null; // Enforce data ownership
        }
        return item;
    }

    async add(item) {
        const db = await getDB();
        await db.put(this.storeName, item);
        return item;
    }

    async update(id, updates, userId = null) {
        const db = await getDB();
        const existing = await db.get(this.storeName, id);
        if (!existing) throw new Error(`Item not found in ${this.storeName}`);
        
        if (userId && existing.userId !== userId && this.storeName !== STORES.USERS) {
            throw new Error('Unauthorized update');
        }

        const updated = { ...existing, ...updates };
        await db.put(this.storeName, updated);
        return updated;
    }

    async delete(id, userId = null) {
        const db = await getDB();
        if (userId && this.storeName !== STORES.USERS) {
             const existing = await db.get(this.storeName, id);
             if (existing && existing.userId !== userId) {
                 throw new Error('Unauthorized delete');
             }
        }
        await db.delete(this.storeName, id);
    }

    async addAll(items) {
        const db = await getDB();
        const tx = db.transaction(this.storeName, 'readwrite');
        items.forEach(item => tx.store.put(item));
        await tx.done;
    }

    async clear() {
        const db = await getDB();
        await db.clear(this.storeName);
    }
}
