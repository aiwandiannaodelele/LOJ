/**
 * 图床上传工具 - 支持 Telegraph-Image 等兼容图床
 */

import { isSafeImageUrl } from "@/lib/security";

export interface ImageHostingResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * 上传图片到图床
 * @param file 要上传的文件
 * @param imageHostingUrl 图床地址（默认使用 Telegraph-Image 公共实例）
 */
export async function uploadImage(
  file: File,
  imageHostingUrl: string = "https://loj-img.pages.dev"
): Promise<ImageHostingResult> {
  // CVE-7: SSRF 防护 - 校验图床 URL 安全性
  if (!isSafeImageUrl(imageHostingUrl)) {
    return { success: false, error: "图床地址不合法" };
  }

  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${imageHostingUrl}/upload`, {
      method: "POST",
      body: formData,
    });

    const text = await response.text();
    console.log("[ImageUpload] raw response:", text.slice(0, 500));

    let result: Record<string, unknown> | unknown[] | string;
    try {
      result = JSON.parse(text) as Record<string, unknown> | unknown[];
    } catch {
      result = text;
    }

    if (typeof result === "object" && !Array.isArray(result) && result.error) {
      return { success: false, error: result.error as string };
    }

    // Telegraph-Image 返回格式: [{ src: "/file/xxx.png" }]
    if (Array.isArray(result) && result[0] && typeof result[0] === "object" && (result[0] as Record<string, unknown>).src) {
      return {
        success: true,
        url: `${imageHostingUrl}${(result[0] as Record<string, unknown>).src}`,
      };
    }

    // 兼容直接返回 URL 字符串的图床
    if (typeof result === "string" && result.startsWith("http")) {
      return { success: true, url: result };
    }

    // 兼容返回 { url: "..." } 的图床
    if (typeof result === "object" && !Array.isArray(result) && result.url && typeof result.url === "string") {
      return { success: true, url: result.url };
    }

    // 兼容返回 { data: { url: "..." } } 的图床
    if (typeof result === "object" && !Array.isArray(result) && result.data && typeof result.data === "object" && (result.data as Record<string, unknown>).url && typeof (result.data as Record<string, unknown>).url === "string") {
      return { success: true, url: (result.data as Record<string, unknown>).url as string };
    }

    // 兼容返回 { data: { src: "..." } } 的图床
    if (typeof result === "object" && !Array.isArray(result) && result.data && typeof result.data === "object" && (result.data as Record<string, unknown>).src && typeof (result.data as Record<string, unknown>).src === "string") {
      return { success: true, url: (result.data as Record<string, unknown>).src as string };
    }

    // 调试：返回实际响应内容以便排查
    return { success: false, error: `未知响应格式: ${JSON.stringify(result).slice(0, 200)}` };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "上传失败",
    };
  }
}

/**
 * 从设置中获取图床 URL
 */
export async function getImageHostingUrl(): Promise<string> {
  try {
    const res = await fetch("/api/admin/settings");
    const data = await res.json();
    const url = data.imageHostingUrl || "https://loj-img.pages.dev";
    // CVE-7: 客户端也做 URL 安全检查
    if (!isSafeImageUrl(url)) {
      return "https://loj-img.pages.dev";
    }
    return url;
  } catch {
    return "https://loj-img.pages.dev";
  }
}
