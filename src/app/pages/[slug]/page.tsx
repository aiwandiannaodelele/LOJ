import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";

export default async function CustomPageView({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await prisma.customPage.findUnique({ where: { slug } });

  if (!page || !page.isPublic) notFound();

  if (page.pageType === "url") {
    return (
      <div className="h-[calc(100vh-4rem)]">
        <iframe src={page.content} className="w-full h-full border-0" title={page.title} sandbox="allow-scripts allow-same-origin allow-forms allow-popups" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6">
      <div dangerouslySetInnerHTML={{ __html: page.content }} />
    </div>
  );
}
