import { db } from '@/db';
import { episodes } from '@/db/schema';

async function main() {
    const sampleEpisodes = [
        {
            animeId: 1,
            episodeNumber: 1,
            title: 'Cruelty',
            embedSources: [
                { name: 'Streamtape', url: 'https://streamtape.com/e/demon-slayer-ep1-streamtape' },
                { name: 'Vidcloud', url: 'https://vidcloud.com/e/demon-slayer-ep1-vidcloud' }
            ],
            thumbnail: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800',
            createdAt: new Date('2024-01-15').toISOString(),
        },
        {
            animeId: 1,
            episodeNumber: 2,
            title: 'Trainer Sakonji Urokodaki',
            embedSources: [
                { name: 'Streamtape', url: 'https://streamtape.com/e/demon-slayer-ep2-streamtape' }
            ],
            thumbnail: 'https://images.unsplash.com/photo-1578632292335-df3abbb0d586?w=800',
            createdAt: new Date('2024-01-16').toISOString(),
        },
        {
            animeId: 1,
            episodeNumber: 3,
            title: 'Sabito and Makomo',
            embedSources: [
                { name: 'Streamtape', url: 'https://streamtape.com/e/demon-slayer-ep3-streamtape' },
                { name: 'Vidcloud', url: 'https://vidcloud.com/e/demon-slayer-ep3-vidcloud' }
            ],
            thumbnail: 'https://images.unsplash.com/photo-1578632749026-0b2f6c2e6a9c?w=800',
            createdAt: new Date('2024-01-17').toISOString(),
        },
        {
            animeId: 2,
            episodeNumber: 1,
            title: 'To You, in 2000 Years: The Fall of Shiganshina, Part 1',
            embedSources: [
                { name: 'Streamtape', url: 'https://streamtape.com/e/attack-on-titan-ep1-streamtape' }
            ],
            thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800',
            createdAt: new Date('2024-01-18').toISOString(),
        },
        {
            animeId: 2,
            episodeNumber: 2,
            title: 'That Day: The Fall of Shiganshina, Part 2',
            embedSources: [
                { name: 'Streamtape', url: 'https://streamtape.com/e/attack-on-titan-ep2-streamtape' },
                { name: 'Vidcloud', url: 'https://vidcloud.com/e/attack-on-titan-ep2-vidcloud' }
            ],
            thumbnail: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=800',
            createdAt: new Date('2024-01-19').toISOString(),
        },
        {
            animeId: 3,
            episodeNumber: 1,
            title: 'Izuku Midoriya: Origin',
            embedSources: [
                { name: 'Streamtape', url: 'https://streamtape.com/e/my-hero-academia-ep1-streamtape' }
            ],
            thumbnail: 'https://images.unsplash.com/photo-1601814933824-fd0b574dd592?w=800',
            createdAt: new Date('2024-01-20').toISOString(),
        },
        {
            animeId: 4,
            episodeNumber: 1,
            title: 'Ryomen Sukuna',
            embedSources: [
                { name: 'Streamtape', url: 'https://streamtape.com/e/jujutsu-kaisen-ep1-streamtape' }
            ],
            thumbnail: 'https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=800',
            createdAt: new Date('2024-01-21').toISOString(),
        },
        {
            animeId: 5,
            episodeNumber: 1,
            title: "I'm Luffy! The Man Who's Gonna Be King of the Pirates!",
            embedSources: [
                { name: 'Streamtape', url: 'https://streamtape.com/e/one-piece-ep1-streamtape' },
                { name: 'Vidcloud', url: 'https://vidcloud.com/e/one-piece-ep1-vidcloud' }
            ],
            thumbnail: 'https://images.unsplash.com/photo-1578632292335-df3abbb0d586?w=800',
            createdAt: new Date('2024-01-22').toISOString(),
        },
        {
            animeId: 6,
            episodeNumber: 1,
            title: 'Homecoming',
            embedSources: [
                { name: 'Streamtape', url: 'https://streamtape.com/e/naruto-shippuden-ep1-streamtape' }
            ],
            thumbnail: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800',
            createdAt: new Date('2024-01-23').toISOString(),
        },
        {
            animeId: 7,
            episodeNumber: 1,
            title: 'Dog and Chainsaw',
            embedSources: [
                { name: 'Streamtape', url: 'https://streamtape.com/e/chainsaw-man-ep1-streamtape' }
            ],
            thumbnail: 'https://images.unsplash.com/photo-1618556450991-2f1af64e8191?w=800',
            createdAt: new Date('2024-01-24').toISOString(),
        },
        {
            animeId: 8,
            episodeNumber: 1,
            title: 'Operation Strix',
            embedSources: [
                { name: 'Streamtape', url: 'https://streamtape.com/e/spy-x-family-ep1-streamtape' },
                { name: 'Vidcloud', url: 'https://vidcloud.com/e/spy-x-family-ep1-vidcloud' }
            ],
            thumbnail: 'https://images.unsplash.com/photo-1578632292335-df3abbb0d586?w=800',
            createdAt: new Date('2024-01-25').toISOString(),
        }
    ];

    await db.insert(episodes).values(sampleEpisodes);
    
    console.log('✅ Episodes seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});