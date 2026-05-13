import { STORES } from '../db';

const API_BASE = '/api';

export class BaseRepository {
    constructor(storeName) {
        this.storeName = storeName;
        this.endpoint = `${API_BASE}/${storeName}`;
    }

    async getAll(userId = null, extraParams = {}) {
        let url = new URL(this.endpoint, window.location.origin);
        if (userId) url.searchParams.append('userId', userId);
        Object.entries(extraParams).forEach(([key, val]) => {
            if (val !== undefined && val !== null) url.searchParams.append(key, val);
        });

        try {
            const res = await fetch(url.toString());
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || `Failed to fetch from ${this.endpoint}`);
            }
            return res.json();
        } catch (error) {
            console.error(`Repository getAll error [${this.storeName}]:`, error);
            throw error;
        }
    }

    async getById(id, userId = null) {
        let url = new URL(this.endpoint, window.location.origin);
        url.searchParams.append('id', id);
        if (userId) url.searchParams.append('userId', userId);
        
        try {
            const res = await fetch(url.toString());
            if (!res.ok) return null;
            return res.json();
        } catch (error) {
            console.error(`Repository getById error [${this.storeName}]:`, error);
            return null;
        }
    }

    async add(item) {
        try {
            const res = await fetch(this.endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item)
            });
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || `Failed to add to ${this.endpoint}`);
            }
            return res.json();
        } catch (error) {
            console.error(`Repository add error [${this.storeName}]:`, error);
            throw error;
        }
    }

    async update(id, updates, userId = null) {
        let url = new URL(this.endpoint, window.location.origin);
        url.searchParams.append('id', id);
        if (userId) url.searchParams.append('userId', userId);

        try {
            const res = await fetch(url.toString(), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || `Failed to update ${this.endpoint}`);
            }
            return res.json();
        } catch (error) {
            console.error(`Repository update error [${this.storeName}]:`, error);
            throw error;
        }
    }

    async delete(id, userId = null) {
        let url = new URL(this.endpoint, window.location.origin);
        url.searchParams.append('id', id);
        if (userId) url.searchParams.append('userId', userId);

        try {
            const res = await fetch(url.toString(), {
                method: 'DELETE'
            });
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || `Failed to delete from ${this.endpoint}`);
            }
            return res.json();
        } catch (error) {
            console.error(`Repository delete error [${this.storeName}]:`, error);
            throw error;
        }
    }

    async addAll(items) {
        // Simple sequential addition for seeding/migration
        for (const item of items) {
            await this.add(item);
        }
    }

    async clear() {
        console.warn('Clear operation not supported in cloud repository for security.');
    }
}
