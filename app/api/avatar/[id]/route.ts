import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await prisma.user.findUnique({ where: { id } });
    
    if (!user || !user.image) {
      return new NextResponse(null, { status: 404 });
    }
    
    // Check if it's already a base64 string 
    if (user.image.startsWith("data:image/jpeg;base64,")) {
      const base64Data = user.image.split(",")[1];
      const buffer = Buffer.from(base64Data, "base64");
      
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "image/jpeg",
          "Cache-Control": "public, max-age=31536000",
        },
      });
    }

    // fallback if it was saved differently
    return NextResponse.redirect(user.image);
  } catch (error) {
    console.error("Failed to fetch avatar:", error);
    return new NextResponse(null, { status: 500 });
  }
}
