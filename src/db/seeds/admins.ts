import { db } from '@/db';
import { admins } from '@/db/schema';
import bcrypt from 'bcryptjs';

async function main() {
    const sampleAdmins = [
        {
            username: 'admin',
            password: await bcrypt.hash('reenime_dark_2025', 10),
            role: 'admin',
            email: 'admin@reenime.com',
            isActive: true,
            createdAt: new Date().toISOString(),
            lastLogin: null,
        },
        {
            username: 'moderator',
            password: await bcrypt.hash('mod123', 10),
            role: 'moderator',
            email: 'mod@reenime.com',
            isActive: true,
            createdAt: new Date().toISOString(),
            lastLogin: null,
        },
        {
            username: 'uploader',
            password: await bcrypt.hash('upload123', 10),
            role: 'uploader',
            email: 'uploader@reenime.com',
            isActive: true,
            createdAt: new Date().toISOString(),
            lastLogin: null,
        },
    ];

    await db.insert(admins).values(sampleAdmins);
    
    console.log('✅ Admins seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});