const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const MONTHS = {
  "January": 0, "February": 1, "March": 2, "April": 3, "May": 4, "June": 5,
  "July": 6, "August": 7, "September": 8, "October": 9, "November": 10, "December": 11
};

async function main() {
  const events = await prisma.event.findMany({
    where: { startDateTime: null }
  });

  console.log(`Found ${events.length} events to migrate.`);

  for (const event of events) {
    try {
      console.log(`Processing event ${event.name} with time: ${event.time}`);
      // time e.g., "2:30 PM - 6:00 PM", "9:00 AM - 5:00 PM", or "TBD"
      if (!event.time || event.time === "TBD" || !event.time.includes(" ")) {
        console.log(`Skipped event ${event.name}: Invalid time format.`);
        continue;
      }
      
      const timeParts = event.time.split(" - ");
      const startTimeStr = timeParts[0]; // "2:30 PM"
      
      const [time, modifier] = startTimeStr.split(" ");
      if (!time || !modifier) {
        console.log(`Skipped event ${event.name}: Invalid time parts.`);
        continue;
      }
      
      let [hours, minutes] = time.split(":");
      
      let hoursNum = parseInt(hours, 10);
      if (hoursNum === 12) {
        hoursNum = modifier === "PM" ? 12 : 0;
      } else if (modifier === "PM") {
        hoursNum += 12;
      }
      
      const monthIndex = MONTHS[event.month];
      
      if (monthIndex !== undefined && event.startDay) {
        const startDateTime = new Date(Date.UTC(2026, monthIndex, event.startDay, hoursNum, parseInt(minutes || "0", 10), 0));
        
        await prisma.event.update({
          where: { id: event.id },
          data: { startDateTime }
        });
        console.log(`Updated event ${event.name} with startDateTime: ${startDateTime.toISOString()}`);
      } else {
        console.log(`Skipped event ${event.name}: Invalid month or startDay.`);
      }
    } catch (e) {
      console.error(`Error processing event ${event.name}:`, e);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
