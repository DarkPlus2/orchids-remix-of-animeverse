import { db } from '@/db';
import { communityPosts } from '@/db/schema';

async function main() {
    const now = new Date();
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    const oneDayHalfAgo = new Date(now.getTime() - 1.5 * 24 * 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
    const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);

    const samplePosts = [
        {
            authorName: 'AniStream Admin',
            authorIsAdmin: true,
            content: '🎉 Welcome to the AniStream Community! We\'re excited to have you here. Share your thoughts, discuss your favorite anime, and connect with fellow anime enthusiasts. Please be respectful and follow our community guidelines. Happy streaming!',
            imageUrl: null,
            likes: 1247,
            comments: 183,
            shares: 94,
            pinned: true,
            category: 'announcement',
            createdAt: twoDaysAgo.toISOString(),
            updatedAt: twoDaysAgo.toISOString(),
        },
        {
            authorName: 'AniStream Admin',
            authorIsAdmin: true,
            content: '📢 New Feature Alert! We\'ve just launched our improved video player with multi-quality support and better buffering. You can now switch between different streaming sources seamlessly. Check it out and let us know what you think!',
            imageUrl: null,
            likes: 892,
            comments: 127,
            shares: 156,
            pinned: false,
            category: 'news',
            createdAt: oneDayHalfAgo.toISOString(),
            updatedAt: oneDayHalfAgo.toISOString(),
        },
        {
            authorName: 'AniStream Admin',
            authorIsAdmin: true,
            content: '🔥 What\'s everyone watching this season? We\'d love to hear your top picks! Our trending section shows Demon Slayer, Attack on Titan, and Jujutsu Kaisen are dominating, but we know there are hidden gems out there. Drop your recommendations below!',
            imageUrl: null,
            likes: 1456,
            comments: 247,
            shares: 82,
            pinned: false,
            category: 'discussion',
            createdAt: oneDayAgo.toISOString(),
            updatedAt: oneDayAgo.toISOString(),
        },
        {
            authorName: 'AniStream Admin',
            authorIsAdmin: true,
            content: '⚠️ Reminder: Please Use Spoiler Tags! When discussing recent episodes or major plot points, please use spoiler warnings to respect fellow community members who haven\'t caught up yet. Let\'s keep AniStream a welcoming space for everyone, regardless of where they are in their anime journey.',
            imageUrl: null,
            likes: 643,
            comments: 54,
            shares: 47,
            pinned: false,
            category: 'announcement',
            createdAt: twelveHoursAgo.toISOString(),
            updatedAt: twelveHoursAgo.toISOString(),
        },
    ];

    await db.insert(communityPosts).values(samplePosts);
    
    console.log('✅ Community posts seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});