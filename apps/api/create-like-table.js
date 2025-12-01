const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('Creating Like table...');

    try {
        await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Like" (
          "userId" TEXT NOT NULL,
          "postId" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "Like_pkey" PRIMARY KEY ("userId","postId")
      )
    `);
        console.log('✅ Table created');
    } catch (e) {
        console.log('Table might already exist:', e.message);
    }

    try {
        await prisma.$executeRawUnsafe(`
      ALTER TABLE "Like" ADD CONSTRAINT "Like_userId_fkey" 
          FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
    `);
        console.log('✅ userId foreign key added');
    } catch (e) {
        console.log('userId FK might already exist:', e.message);
    }

    try {
        await prisma.$executeRawUnsafe(`
      ALTER TABLE "Like" ADD CONSTRAINT "Like_postId_fkey" 
          FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE
    `);
        console.log('✅ postId foreign key added');
    } catch (e) {
        console.log('postId FK might already exist:', e.message);
    }

    console.log('\n✅ Like table migration completed successfully!');
}

main()
    .catch((e) => {
        console.error('Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
