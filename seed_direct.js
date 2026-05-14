import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { mockDb } from './src/data/mockDb.js';
import * as Schemas from './api/models/Schemas.js';

// Manual .env parsing
const envPath = path.join(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const mongoUriMatch = envContent.match(/MONGODB_URI=(.*)/);
const MONGODB_URI = mongoUriMatch ? mongoUriMatch[1].trim() : null;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI no encontrada en .env');
    process.exit(1);
}

async function seed() {
    try {
        console.log('⏳ Conectando a MongoDB Atlas...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Conexión establecida.');

        const DEFAULT_HASH = await bcrypt.hash('urueduca', 10);

        const collections = [
            { name: 'User', data: mockDb.users },
            { name: 'Course', data: mockDb.courses },
            { name: 'Student', data: mockDb.students },
            { name: 'CoursePlan', data: mockDb.coursePlans },
            { name: 'Lesson', data: mockDb.lessons },
            { name: 'Evaluation', data: mockDb.evaluations },
            { name: 'CalendarEvent', data: mockDb.manualEvents },
            { name: 'Module', data: mockDb.modules || [] },
            { name: 'Alert', data: mockDb.alerts || [] },
            { name: 'TeachingGroup', data: mockDb.teachingGroups || [] },
            { name: 'MarketplaceItem', data: mockDb.marketplace || [] }
        ];

        for (const { name, data } of collections) {
            const Model = Schemas[name];
            if (Model) {
                console.log(`🧹 Limpiando colección: ${name}...`);
                await Model.deleteMany({});
                
                console.log(`📥 Insertando ${data.length} documentos en ${name}...`);
                const preparedData = data.map(item => ({ 
                    ...item, 
                    userId: item.userId || item.user_id || 'usr-demo-1',
                    passwordHash: name === 'User' ? (item.passwordHash || DEFAULT_HASH) : undefined
                }));
                await Model.insertMany(preparedData);
            }
        }

        console.log('✨ ¡Base de datos inyectada con éxito!');
    } catch (error) {
        console.error('❌ Error durante el seed:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

seed();
