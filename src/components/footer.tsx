"use client";

import { usePathname } from "next/navigation";

interface FooterProps {
  siteName: string;
  footerText?: string;
}

export default function Footer({ siteName, footerText }: FooterProps) {
  const pathname = usePathname();

  // 做题页面不显示页脚
  if (pathname.startsWith("/problems/") && pathname.split("/").length >= 3) {
    return null;
  }

  return (
    <footer className="border-t border-border/50 bg-background/80 backdrop-blur-sm shrink-0 py-3">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col items-center justify-center gap-1">
        <span className="text-xs text-muted-foreground/70 tracking-wide">
          Powered by{" "}
          <span className="text-emerald-500/80 font-medium">{siteName}</span>
        </span>
        {footerText && (
          <div
            className="text-[11px] text-muted-foreground/60 text-center"
            dangerouslySetInnerHTML={{ __html: footerText }}
          />
        )}
      </div>
    </footer>
  );
}
