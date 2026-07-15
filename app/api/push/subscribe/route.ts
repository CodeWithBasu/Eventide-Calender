import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const subscription = await req.json();

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json({ error: "Invalid subscription data" }, { status: 400 });
    }

    // Save or update subscription
    // Check if endpoint already exists to avoid duplicates
    const existing = await prisma.pushSubscription.findFirst({
      where: { endpoint: subscription.endpoint, userId },
    });

    if (!existing) {
      await prisma.pushSubscription.create({
        data: {
          userId,
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Subscription error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const { searchParams } = new URL(req.url);
    const endpoint = searchParams.get("endpoint");

    if (!endpoint) {
      return NextResponse.json({ error: "Missing endpoint" }, { status: 400 });
    }

    await prisma.pushSubscription.deleteMany({
      where: { endpoint, userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unsubscription error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
