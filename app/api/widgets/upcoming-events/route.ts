import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      take: 3,
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      events: events.map((e) => ({
        name: e.name,
        date: e.date,
        location: e.location,
        flag: e.flag,
      })),
    });
  } catch (error) {
    console.error("Error fetching events for widget:", error);
    return NextResponse.json({ events: [] }, { status: 500 });
  }
}
