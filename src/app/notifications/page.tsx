"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bell, Loader2, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function NotificationsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [notifs, setNotifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    fetch("/api/notifications").then(r => r.json()).then(d => { setNotifs(d.notifications || []); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { if (status === "unauthenticated") router.push("/login"); else if (status === "authenticated") fetchData(); }, [status]);

  const markAllRead = async () => {
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
    fetchData();
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2"><Bell className="h-5 w-5" /><h1 className="text-xl font-bold">通知</h1></div>
        {notifs.some((n: any) => !n.isRead) && <Button variant="outline" size="sm" onClick={markAllRead}><CheckCheck className="h-4 w-4 mr-1" />全部已读</Button>}
      </div>
      {notifs.length === 0 ? <p className="text-muted-foreground text-center py-12">暂无通知</p> : (
        <div className="space-y-2">
          {notifs.map((n: any) => (
            <Card key={n.id} className={`p-4 ${!n.isRead ? "border-primary/30 bg-primary/5" : ""}`}>
              <Link href={n.link || "#"} className="block">
                <div className="text-sm font-medium">{n.title}</div>
                {n.body && <div className="text-xs text-muted-foreground mt-0.5">{n.body}</div>}
                <div className="text-[10px] text-muted-foreground mt-1">{new Date(n.createdAt).toLocaleString("zh-CN")}</div>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
