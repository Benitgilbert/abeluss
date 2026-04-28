
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  console.log("--- Recent Products ---");
  const products = await prisma.product.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, stock: true, createdAt: true }
  });
  console.log(JSON.stringify(products, null, 2));

  console.log("\n--- Recent Orders ---");
  const orders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { items: true }
  });
  console.log(JSON.stringify(orders, null, 2));

  await prisma.$disconnect();
}

check();
