"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  HardDrive,
  Loader2,
  Save,
  ArrowLeft,
  Globe,
  Upload,
  CheckCircle,
  AlertCircle,
  Database,
  Cloud,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StorageSettings {
  storageProvider: string;
  storageS3Endpoint: string;
  storageS3Bucket: string;
  storageS3AccessKey: string;
  storageS3SecretKey: string;
  storageS3Region: string;
  storageImageHostingUrl: string;
  maxFileSize: number;
}

const PROVIDERS = [
  { id: "database", label: "数据库", desc: "直接存入 SQLite（Base64）", icon: Database },
  { id: "s3", label: "对象存储", desc: "S3 / MinIO / R2 兼容", icon: Cloud },
  { id: "imagehosting", label: "图床", desc: "Telegraph-Image 等", icon: ImageIcon },
];

export default function AdminStoragePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [settings, setSettings] = useState<StorageSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Upload test
  const [testFile, setTestFile] = useState<File | null>(null);
  const [testUploading, setTestUploading] = useState(false);
  const [testResult, setTestResult] = useState<{ url: string; provider: string } | null>(null);
  const [testError, setTestError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && !session.user.isAdmin) {
      router.push("/");
    }
  }, [status, session, router]);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        setSettings({
          storageProvider: data.storageProvider || "imagehosting",
          storageS3Endpoint: data.storageS3Endpoint || "",
          storageS3Bucket: data.storageS3Bucket || "",
          storageS3AccessKey: data.storageS3AccessKey || "",
          storageS3SecretKey: data.storageS3SecretKey || "",
          storageS3Region: data.storageS3Region || "",
          storageImageHostingUrl: data.storageImageHostingUrl || "",
          maxFileSize: data.maxFileSize || 20971520,
        });
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storageProvider: settings.storageProvider,
          storageS3Endpoint: settings.storageS3Endpoint,
          storageS3Bucket: settings.storageS3Bucket,
          storageS3AccessKey: settings.storageS3AccessKey,
          storageS3SecretKey: settings.storageS3SecretKey,
          storageS3Region: settings.storageS3Region,
          storageImageHostingUrl: settings.storageImageHostingUrl,
          maxFileSize: settings.maxFileSize,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "保存失败");
      } else {
        setSettings({
          storageProvider: data.storageProvider || "imagehosting",
          storageS3Endpoint: data.storageS3Endpoint || "",
          storageS3Bucket: data.storageS3Bucket || "",
          storageS3AccessKey: data.storageS3AccessKey || "",
          storageS3SecretKey: data.storageS3SecretKey || "",
          storageS3Region: data.storageS3Region || "",
          storageImageHostingUrl: data.storageImageHostingUrl || "",
          maxFileSize: data.maxFileSize || 20971520,
        });
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2000);
      }
    } catch {
      setError("网络错误");
    } finally {
      setSaving(false);
    }
  };

  const handleTestUpload = async () => {
    if (!testFile) {
      setTestError("请先选择文件");
      return;
    }
    setTestUploading(true);
    setTestError("");
    setTestResult(null);

    try {
      const formData = new FormData();
      formData.append("file", testFile);
      const res = await fetch("/api/admin/storage-test", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setTestError(data.error || "上传失败");
      } else {
        setTestResult({ url: data.url, provider: data.provider });
      }
    } catch {
      setTestError("网络错误");
    } finally {
      setTestUploading(false);
    }
  };

  const handleTestFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setTestFile(file);
    setTestError("");
    setTestResult(null);
  };

  if (status === "loading" || status !== "authenticated") {
    return (
      <div className="flex items-center justify-center h-[calc(100dvh-3.5rem)]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <HardDrive className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">存储管理</h1>
            <p className="text-muted-foreground text-sm">配置文件存储后端与测试</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => router.push("/admin")} className="gap-1.5">
          <ArrowLeft className="h-4 w-4" />
          返回管理主页
        </Button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400">
          保存成功
        </div>
      )}

      {loading || !settings ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Card className="border-border/50 p-6 space-y-6">
          {/* Provider selection */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <Label className="font-medium">存储后端</Label>
              <span className="text-xs text-muted-foreground">头像、文件等存储位置</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {PROVIDERS.map((p) => {
                const Icon = p.icon;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSettings({ ...settings, storageProvider: p.id })}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border text-left transition-colors",
                      settings.storageProvider === p.id
                        ? "border-primary bg-primary/5"
                        : "border-border/60 hover:bg-accent/50"
                    )}
                  >
                    <div className={cn("shrink-0 h-3 w-3 rounded-full border", settings.storageProvider === p.id ? "bg-primary border-primary" : "border-muted-foreground")} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium flex items-center gap-1.5">
                        <Icon className="h-3.5 w-3.5" />
                        {p.label}
                      </div>
                      <div className="text-xs text-muted-foreground">{p.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* S3 Config */}
          {settings.storageProvider === "s3" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-lg border p-4">
              <div className="space-y-2">
                <Label className="text-xs">Endpoint</Label>
                <Input value={settings.storageS3Endpoint || ""} onChange={(e) => setSettings({ ...settings, storageS3Endpoint: e.target.value })} placeholder="https://s3.amazonaws.com" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Bucket</Label>
                <Input value={settings.storageS3Bucket || ""} onChange={(e) => setSettings({ ...settings, storageS3Bucket: e.target.value })} placeholder="my-bucket" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Access Key</Label>
                <Input value={settings.storageS3AccessKey || ""} onChange={(e) => setSettings({ ...settings, storageS3AccessKey: e.target.value })} placeholder="AKIA..." />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Secret Key</Label>
                <Input type="password" value={settings.storageS3SecretKey || ""} onChange={(e) => setSettings({ ...settings, storageS3SecretKey: e.target.value })} placeholder="******" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Region</Label>
                <Input value={settings.storageS3Region || ""} onChange={(e) => setSettings({ ...settings, storageS3Region: e.target.value })} placeholder="us-east-1" />
              </div>
            </div>
          )}

          {/* Image Hosting Config */}
          {settings.storageProvider === "imagehosting" && (
            <div className="space-y-2 rounded-lg border p-4">
              <Label className="text-xs">图床地址</Label>
              <Input value={settings.storageImageHostingUrl || ""} onChange={(e) => setSettings({ ...settings, storageImageHostingUrl: e.target.value })} placeholder="https://your-telegraph-image.pages.dev" />
              <p className="text-xs text-muted-foreground">如 Telegraph-Image 地址，需支持 /upload 接口。留空使用默认图床 https://loj-img.pages.dev</p>
            </div>
          )}

          {/* Global file size limit */}
          <div className="space-y-2 rounded-lg border p-4">
            <Label className="text-xs">单文件大小限制（字节）</Label>
            <Input
              type="number"
              value={settings.maxFileSize}
              onChange={(e) => setSettings({ ...settings, maxFileSize: parseInt(e.target.value) || 20971520 })}
              placeholder="20971520"
            />
            <p className="text-xs text-muted-foreground">当前：{(settings.maxFileSize / 1024 / 1024).toFixed(0)}MB。此限制全局生效，不可按用户自定义。</p>
          </div>

          {/* Upload Test */}
          <div className="space-y-3 rounded-lg border p-4 bg-muted/30">
            <div className="flex items-center gap-2">
              <Upload className="h-4 w-4 text-muted-foreground" />
              <Label className="font-medium">上传测试</Label>
              <span className="text-xs text-muted-foreground">直接测试当前存储配置</span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm hover:bg-accent transition-colors">
                <input type="file" className="hidden" onChange={handleTestFileChange} />
                <span>{testFile ? testFile.name : "选择文件"}</span>
              </label>
              <Button
                size="sm"
                onClick={handleTestUpload}
                disabled={testUploading || !testFile}
                className="gap-1.5"
              >
                {testUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                {testUploading ? "上传中..." : "测试上传"}
              </Button>
            </div>
            {testError && (
              <div className="flex items-center gap-1.5 text-sm text-red-600 dark:text-red-400">
                <AlertCircle className="h-4 w-4" />
                {testError}
              </div>
            )}
            {testResult && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="h-4 w-4" />
                  上传成功（{testResult.provider}）
                </div>
                <div className="rounded-md border bg-background p-2">
                  <p className="text-xs text-muted-foreground mb-1">返回的链接：</p>
                  <a href={testResult.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary break-all hover:underline">
                    {testResult.url}
                  </a>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  保存中
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  保存设置
                </>
              )}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
