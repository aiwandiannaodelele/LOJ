import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const contestId = parseInt(id);
  if (isNaN(contestId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const announcements = await prisma.contestAnnouncement.findMany({
    where: { contestId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ announcements });
}
