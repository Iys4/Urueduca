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

        const res = await fetch(url.toString());
        if (!res.ok) throw new Error(`Failed to fetch from ${this.endpoint}`);
        return res.json();
    }

    async getById(id, userId = null) {
        let url = new URL(this.endpoint, window.location.origin);
        url.searchParams.append('id', id);
        if (userId) url.searchParams.append('userId', userId);
        
        const res = await fetch(url.toString());
        if (!res.ok) return null;
        return res.json();
    }

    async add(item) {
        const res = await fetch(this.endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item)
        });
        if (!res.ok) throw new Error(`Failed to add to ${this.endpoint}`);
        return res.json();
    }

    async update(id, updates, userId = null) {
        let url = new URL(this.endpoint, window.location.origin);
        url.searchParams.append('id', id);
        if (userId) url.searchParams.append('userId', userId);

        const res = await fetch(url.toString(), {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });
        if (!res.ok) throw new Error(`Failed to update ${this.endpoint}`);
        return res.json();
    }

    async delete(id, userId = null) {
        let url = new URL(this.endpoint, window.location.origin);
        url.searchParams.append('id', id);
        if (userId) url.searchParams.append('userId', userId);

        const res = await fetch(url.toString(), {
            method: 'DELETE'
        });
        if (!res.ok) throw new Error(`Failed to delete from ${this.endpoint}`);
        return res.json();
    }

    async addAll(items) {
        // Simple sequential addition for now, could be optimized with a batch endpoint
        for (const item of items) {
            await this.add(item);
        }
    }

    async clear() {
        // Not implemented for safety in cloud, but could be a DELETE all for a userId
        console.warn('Clear operation not supported in cloud repository for security.');
    }
}
