import { PrismaClient } from "@prisma/client";
import { eventsData } from "../lib/events-data";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database with events...");
  for (const event of eventsData) {
    await prisma.event.create({
      data: {
        name: event.name,
        date: event.date,
        startDay: event.startDay,
        endDay: event.endDay,
        location: event.location,
        flag: event.flag,
        category: event.category,
        color: event.color,
        url: event.url,
        time: event.time,
        edition: event.edition,
        tags: event.tags?.join(",") || ""
      }
    });
  }
  console.log("Done seeding!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
