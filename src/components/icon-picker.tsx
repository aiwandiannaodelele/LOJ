"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import * as Icons from "lucide-react";

const COMMON_ICONS = [
  "FileText", "Code2", "BookOpen", "GraduationCap", "Globe",
  "Terminal", "Server", "Database", "Cloud", "Home",
  "User", "Users", "Settings", "Info", "HelpCircle",
  "Star", "Heart", "ThumbsUp", "Zap", "Award",
  "Music", "Video", "Image", "Camera", "Map",
  "Calendar", "Clock", "Bell", "Mail", "Phone",
  "Link", "ExternalLink", "Download", "Upload", "Share2",
  "Layout", "Grid", "List", "Table", "Columns",
  "GitBranch", "Github", "Twitter", "Youtube", "Twitch",
];

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
}

export default function IconPicker({ value, onChange }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const filtered = COMMON_ICONS.filter((name) => name.toLowerCase().includes(search.toLowerCase()));
  const SelectedIcon = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[value];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 h-9 px-3 rounded-lg border border-border text-sm hover:bg-accent transition-colors w-full"
      >
        {SelectedIcon ? <SelectedIcon className="h-4 w-4" /> : <Icons.FileText className="h-4 w-4" />}
        <span className="text-muted-foreground">{value || "选择图标"}</span>
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 w-72 bg-popover border border-border rounded-xl shadow-xl z-50 p-2">
          <div className="relative mb-2">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="搜索图标..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-sm"
            />
          </div>
          <ScrollArea className="h-48">
            <div className="grid grid-cols-6 gap-1">
              {filtered.map((name) => {
                const IconComponent = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[name];
                if (!IconComponent) return null;
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => { onChange(name); setOpen(false); }}
                    className={cn(
                      "flex items-center justify-center h-9 rounded-lg transition-colors",
                      value === name ? "bg-primary text-primary-foreground" : "hover:bg-accent text-muted-foreground hover:text-foreground",
                    )}
                    title={name}
                  >
                    <IconComponent className="h-4 w-4" />
                  </button>
                );
              })}
              {filtered.length === 0 && (
                <div className="col-span-6 py-4 text-center text-xs text-muted-foreground">未找到图标</div>
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
