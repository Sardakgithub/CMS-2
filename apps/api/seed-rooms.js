const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedRooms() {
    const rooms = [
        { name: 'Cozy Lo-Fi', type: 'lo-fi' },
        { name: 'Deep Focus', type: 'focus' },
        { name: 'Slow Quiet Room', type: 'quiet' },
        { name: 'Creative Doodle Zone', type: 'creative' },
        { name: 'Night Chill', type: 'night' },
        { name: 'Soft Social Room', type: 'social' },
    ];

    for (const room of rooms) {
        const existing = await prisma.room.findFirst({
            where: { name: room.name },
        });

        if (!existing) {
            await prisma.room.create({
                data: room,
            });
            console.log(`✓ Created room: ${room.name}`);
        } else {
            console.log(`- Room already exists: ${room.name}`);
        }
    }

    console.log('✓ Room seeding complete!');
}

seedRooms()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
