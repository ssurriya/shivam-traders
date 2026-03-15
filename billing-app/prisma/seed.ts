// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  await prisma.product.createMany({
    data: [
      { name: "Premium Basmati Rice", hsnCode: "1006", unit: "Kg", price: 85, gstRate: 5, description: "Long grain aromatic basmati rice" },
      { name: "Refined Sunflower Oil", hsnCode: "1512", unit: "Ltr", price: 130, gstRate: 5, description: "Cold pressed sunflower oil" },
      { name: "Toor Dal", hsnCode: "0713", unit: "Kg", price: 110, gstRate: 5 },
      { name: "Wheat Flour (Atta)", hsnCode: "1101", unit: "Kg", price: 45, gstRate: 5 },
      { name: "Sugar (Fine)", hsnCode: "1701", unit: "Kg", price: 42, gstRate: 5 },
      { name: "Packaged Biscuits", hsnCode: "1905", unit: "Box", price: 25, gstRate: 12 },
      { name: "Mineral Water Bottle", hsnCode: "2201", unit: "Pcs", price: 20, gstRate: 18 },
      { name: "Detergent Powder", hsnCode: "3402", unit: "Kg", price: 85, gstRate: 18, description: "Heavy duty detergent" },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Products seeded");
  console.log("🎉 Done!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
