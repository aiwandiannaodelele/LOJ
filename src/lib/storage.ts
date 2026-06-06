/**
 * 存储抽象层
 * 支持三种存储后端：数据库、S3/兼容对象存储、图床
 */

export interface StorageResult {
  url: string;
  key: string;
}

export interface StorageProvider {
  name: string;
  upload(buffer: Buffer, filename: string, mimeType: string): Promise<StorageResult>;
  getUrl(key: string): string;
}

// ===== 数据库存储（Base64 存入 SQLite） =====
class DatabaseStorage implements StorageProvider {
  name = "database";

  async upload(buffer: Buffer, filename: string, mimeType: string): Promise<StorageResult> {
    const base64 = buffer.toString("base64");
    const dataUrl = `data:${mimeType};base64,${base64}`;
    return { url: dataUrl, key: dataUrl };
  }

  getUrl(key: string): string {
    return key;
  }
}

// ===== 图床存储 =====
class ImageHostingStorage implements StorageProvider {
  name = "imagehosting";
  private endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint.replace(/\/$/, "");
  }

  async upload(buffer: Buffer, filename: string, mimeType: string): Promise<StorageResult> {
    const body = new FormData();
    const blob = new Blob([new Uint8Array(buffer)], { type: mimeType });
    body.append("file", blob, filename);

    const res = await fetch(`${this.endpoint}/upload`, {
      method: "POST",
      body,
    });

    const rawText = await res.text();
    if (!res.ok) {
      throw new Error(`图床上传失败: ${res.status}，响应: ${rawText.slice(0, 200)}`);
    }

    // 尝试兼容多种图床返回格式，如果都失败就把原始响应抛给用户
    let parsed: unknown;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      // 不是 JSON，可能是直接返回 URL 字符串
      const url = rawText.trim();
      if (url.startsWith("http")) {
        return { url, key: url };
      }
      throw new Error(`图床返回非 JSON 且不是 URL：${rawText.slice(0, 200)}`);
    }

    // 格式 1: { url: "..." }
    if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed) && "url" in parsed && typeof (parsed as Record<string, unknown>).url === "string") {
      const url = (parsed as Record<string, unknown>).url as string;
      return { url, key: url };
    }

    // 格式 2: [{ src: "..." }] (Telegraph-Image)
    if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === "object" && parsed[0] !== null && "src" in parsed[0] && typeof (parsed[0] as Record<string, unknown>).src === "string") {
      const src = (parsed[0] as Record<string, unknown>).src as string;
      const url = src.startsWith("http") ? src : `${this.endpoint}${src}`;
      return { url, key: url };
    }

    // 格式 3: { data: { url: "..." } }
    if (typeof parsed === "object" && parsed !== null && "data" in parsed && typeof (parsed as Record<string, unknown>).data === "object" && (parsed as Record<string, unknown>).data !== null && "url" in ((parsed as Record<string, unknown>).data as Record<string, unknown>) && typeof (((parsed as Record<string, unknown>).data as Record<string, unknown>).url) === "string") {
      const url = (((parsed as Record<string, unknown>).data as Record<string, unknown>).url) as string;
      return { url, key: url };
    }

    // 格式 4: { data: { src: "..." } }
    if (typeof parsed === "object" && parsed !== null && "data" in parsed && typeof (parsed as Record<string, unknown>).data === "object" && (parsed as Record<string, unknown>).data !== null && "src" in ((parsed as Record<string, unknown>).data as Record<string, unknown>) && typeof (((parsed as Record<string, unknown>).data as Record<string, unknown>).src) === "string") {
      const src = (((parsed as Record<string, unknown>).data as Record<string, unknown>).src) as string;
      const url = src.startsWith("http") ? src : `${this.endpoint}${src}`;
      return { url, key: url };
    }

    // 格式 5: { result: "..." }
    if (typeof parsed === "object" && parsed !== null && "result" in parsed && typeof (parsed as Record<string, unknown>).result === "string" && ((parsed as Record<string, unknown>).result as string).startsWith("http")) {
      const url = (parsed as Record<string, unknown>).result as string;
      return { url, key: url };
    }

    // 都不匹配，把原始响应抛出来
    throw new Error(`图床返回格式无法解析。原始响应: ${rawText.slice(0, 500)}`);
  }

  getUrl(key: string): string {
    return key;
  }
}

// ===== S3/兼容对象存储（简单版：通过后端 API 路由签名） =====
class S3Storage implements StorageProvider {
  name = "s3";
  private endpoint: string;
  private bucket: string;
  private accessKey: string;
  private secretKey: string;
  private region: string;

  constructor(config: {
    endpoint: string;
    bucket: string;
    accessKey: string;
    secretKey: string;
    region: string;
  }) {
    this.endpoint = config.endpoint.replace(/\/$/, "");
    this.bucket = config.bucket;
    this.accessKey = config.accessKey;
    this.secretKey = config.secretKey;
    this.region = config.region || "auto";
  }

  private async sha256(data: ArrayBuffer | string): Promise<string> {
    const msgBuffer = typeof data === "string" ? new TextEncoder().encode(data) : data;
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  private async hmac(key: string | ArrayBuffer, message: string): Promise<ArrayBuffer> {
    const keyBuffer = typeof key === "string" ? new TextEncoder().encode(key) : key;
    const cryptoKey = await crypto.subtle.importKey("raw", keyBuffer, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    return crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(message));
  }

  private async getSignatureKey(secretKey: string, dateStamp: string): Promise<ArrayBuffer> {
    const kDate = await this.hmac("AWS4" + secretKey, dateStamp);
    const kRegion = await this.hmac(kDate, this.region);
    const kService = await this.hmac(kRegion, "s3");
    const kSigning = await this.hmac(kService, "aws4_request");
    return kSigning;
  }

  private bufToHex(buf: ArrayBuffer): string {
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  async upload(buffer: Buffer, filename: string, mimeType: string): Promise<StorageResult> {
    const key = `avatars/${Date.now()}-${filename}`;
    const now = new Date();
    const dateStamp = now.toISOString().slice(0, 10).replace(/-/g, "");
    const timeStamp = now.toISOString().replace(/[-:]\.\d{3}Z$/, "Z").replace(/[-:]/g, "");

    const bytes = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    const payloadHash = await this.sha256(bytes.buffer as ArrayBuffer);
    const credential = `${this.accessKey}/${dateStamp}/${this.region}/s3/aws4_request`;

    const headers: Record<string, string> = {
      "Host": new URL(this.endpoint).hostname,
      "Content-Type": mimeType,
      "X-Amz-Date": timeStamp,
      "X-Amz-Content-Sha256": payloadHash,
    };

    const signedHeaders = Object.keys(headers).sort().join(";");
    const canonicalHeaders = Object.entries(headers).map(([k, v]) => `${k.toLowerCase()}:${v.trim()}`).join("\n") + "\n";

    const canonicalRequest = [
      "PUT",
      `/${this.bucket}/${key}`,
      "",
      canonicalHeaders,
      signedHeaders,
      payloadHash,
    ].join("\n");

    const stringToSign = [
      "AWS4-HMAC-SHA256",
      timeStamp,
      `${dateStamp}/${this.region}/s3/aws4_request`,
      await this.sha256(canonicalRequest),
    ].join("\n");

    const signingKey = await this.getSignatureKey(this.secretKey, dateStamp);
    const signature = this.bufToHex(await this.hmac(signingKey, stringToSign));

    const authHeader = `AWS4-HMAC-SHA256 Credential=${credential}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    const res = await fetch(`${this.endpoint}/${this.bucket}/${key}`, {
      method: "PUT",
      headers: { ...headers, Authorization: authHeader },
      body: new Uint8Array(buffer),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`S3 上传失败: ${res.status} ${err}`);
    }

    return {
      url: `${this.endpoint}/${this.bucket}/${key}`,
      key,
    };
  }

  getUrl(key: string): string {
    return `${this.endpoint}/${this.bucket}/${key}`;
  }
}

// ===== Factory =====
import prisma from "./prisma";

export async function getStorageProvider(): Promise<StorageProvider> {
  const settings = await prisma.settings.findFirst();
  const provider = settings?.storageProvider || "imagehosting";

  switch (provider) {
    case "imagehosting": {
      const url = settings?.storageImageHostingUrl || "https://loj-img.pages.dev";
      if (!url) return new DatabaseStorage();
      return new ImageHostingStorage(url);
    }
    case "s3": {
      if (!settings?.storageS3Endpoint || !settings?.storageS3Bucket) {
        return new DatabaseStorage();
      }
      return new S3Storage({
        endpoint: settings.storageS3Endpoint,
        bucket: settings.storageS3Bucket,
        accessKey: settings.storageS3AccessKey,
        secretKey: settings.storageS3SecretKey,
        region: settings.storageS3Region,
      });
    }
    default:
      return new DatabaseStorage();
  }
}

export { DatabaseStorage, ImageHostingStorage, S3Storage };
