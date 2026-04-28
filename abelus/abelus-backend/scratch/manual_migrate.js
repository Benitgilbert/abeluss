
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function fix() {
  try {
    console.log("Checking for join tables...");
    
    // Check if _ProductCrossSells exists
    try {
      await prisma.$executeRawUnsafe('SELECT 1 FROM "_ProductCrossSells" LIMIT 1');
      console.log("Table _ProductCrossSells already exists.");
    } catch (e) {
      console.log("Table _ProductCrossSells missing. Creating...");
      await prisma.$executeRawUnsafe(`
        CREATE TABLE "_ProductCrossSells" (
          "A" TEXT NOT NULL,
          "B" TEXT NOT NULL,
          FOREIGN KEY ("A") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE,
          FOREIGN KEY ("B") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE
        )
      `);
      await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX "_ProductCrossSells_AB_unique" ON "_ProductCrossSells"("A", "B")`);
      await prisma.$executeRawUnsafe(`CREATE INDEX "_ProductCrossSells_B_index" ON "_ProductCrossSells"("B")`);
      console.log("Table _ProductCrossSells created.");
    }

    // Check if _ProductUpSells exists
    try {
      await prisma.$executeRawUnsafe('SELECT 1 FROM "_ProductUpSells" LIMIT 1');
      console.log("Table _ProductUpSells already exists.");
    } catch (e) {
      console.log("Table _ProductUpSells missing. Creating...");
      await prisma.$executeRawUnsafe(`
        CREATE TABLE "_ProductUpSells" (
          "A" TEXT NOT NULL,
          "B" TEXT NOT NULL,
          FOREIGN KEY ("A") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE,
          FOREIGN KEY ("B") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE
        )
      `);
      await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX "_ProductUpSells_AB_unique" ON "_ProductUpSells"("A", "B")`);
      await prisma.$executeRawUnsafe(`CREATE INDEX "_ProductUpSells_B_index" ON "_ProductUpSells"("B")`);
      console.log("Table _ProductUpSells created.");
    }

  } catch (err) {
    console.error("Migration Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

fix();
