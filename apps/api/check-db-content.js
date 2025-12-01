
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const posts = await prisma.post.findMany({
        take: 5,
        orderBy: {
            createdAt: 'desc',
        },
        include: {
            author: true,
        },
    });

    console.log('Found', posts.length, 'posts');
    posts.forEach(post => {
        console.log('---------------------------------------------------');
        console.log(`Post ID: ${post.id}`);
        console.log(`Author: ${post.author.username}`);
        console.log('ContentJSON:', JSON.stringify(post.contentJson, null, 2));
    });
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
