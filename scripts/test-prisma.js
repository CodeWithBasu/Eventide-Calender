const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const data = {
      title: "birthday",
      description: "Event description",
      startTime: "",
      endTime: "",
      category: "Meeting",
      color: "Red",
      tags: [],
      month: "August",
      startDay: 27,
      endDay: 27
    };
    
    const event = await prisma.event.create({
      data: {
        name: data.title,
        date: `${data.month} ${data.startDay}${data.endDay && data.endDay !== data.startDay ? ` - ${data.endDay}` : ""}`,
        month: data.month,
        startDay: data.startDay || 1,
        endDay: data.endDay || data.startDay || 1,
        location: "Online",
        flag: "🌍",
        category: data.category,
        color: data.color,
        url: "#",
        time: `${data.startTime} - ${data.endTime}`,
        tags: data.tags?.join(",") || "",
        description: data.description
      }
    });
    console.log("Success:", event);
  } catch (err) {
    console.error("Error:", err);
  }
}

test();
