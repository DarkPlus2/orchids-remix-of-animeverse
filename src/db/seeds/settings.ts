import { db } from '@/db';
import { settings } from '@/db/schema';

async function main() {
    const sampleSettings = [
        {
            key: 'carousel_banner_url',
            value: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }
    ];

    await db.insert(settings).values(sampleSettings);
    
    console.log('✅ Settings seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});