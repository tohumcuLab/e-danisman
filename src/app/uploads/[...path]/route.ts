import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

// Yüklenen medya türleri için MIME haritası
const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".pdf": "application/pdf",
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;
    if (!pathSegments || pathSegments.length === 0) {
      return new NextResponse("File path required", { status: 400 });
    }

    const baseDir = path.join(process.cwd(), "public", "uploads");
    const safeSubPath = path.normalize(pathSegments.join("/")).replace(/^(\.\.[\/\\])+/, "");
    const filePath = path.join(baseDir, safeSubPath);

    // Güvenlik: Dizin dışına çıkma saldırılarını önle
    if (!filePath.startsWith(baseDir)) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      return new NextResponse("File not found", { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Yüklenen dosya sunulurken hata oluştu:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
