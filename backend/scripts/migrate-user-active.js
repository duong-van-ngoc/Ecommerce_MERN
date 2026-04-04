/**
 * Migration Script: Set isActive=true for all existing users
 * 
 * PURPOSE:
 * When adding the Soft Delete feature, existing users in MongoDB
 * won't have the `isActive` field. This script ensures all existing
 * users are explicitly marked as active.
 * 
 * USAGE:
 * Run from project root: node backend/scripts/migrate-user-active.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', 'config', '.env') });

const DB_URI = process.env.DB_URI;

if (!DB_URI) {
    console.error('❌ DB_URI not found in environment variables');
    process.exit(1);
}

async function migrate() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(DB_URI);
        console.log('✅ Connected to MongoDB');

        const usersCollection = mongoose.connection.collection('users');

        // Count users without isActive field
        const countBefore = await usersCollection.countDocuments({
            isActive: { $exists: false }
        });

        console.log(`📊 Found ${countBefore} users without isActive field`);

        if (countBefore === 0) {
            console.log('✨ All users already have isActive field. No migration needed.');
            process.exit(0);
        }

        // Set isActive=true for all users that don't have the field
        const result = await usersCollection.updateMany(
            { isActive: { $exists: false } },
            {
                $set: {
                    isActive: true,
                    blockedAt: null,
                    lockReason: null
                }
            }
        );

        console.log(`✅ Migration complete! Updated ${result.modifiedCount} users.`);
        console.log('   - isActive: true');
        console.log('   - deletedAt: null');
        console.log('   - lockReason: null');

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
        process.exit(0);
    }
}

migrate();
