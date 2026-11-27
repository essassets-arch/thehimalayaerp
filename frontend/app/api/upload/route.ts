import { randomUUID, createHmac } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import { existsSync } from "fs";
import * as path from "path";
import { NextRequest, NextResponse } from "next/server";

const MAX_IMAGE_SIZE = 15 * 1024 * 1024; // 15 MB max
const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.ms-excel": "xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
};

function isValidSession(request: NextRequest): boolean {
  const token =
    request.cookies.get("accessToken")?.value ||
    request.cookies.get("token")?.value ||
    request.cookies.get("himalaya_token")?.value ||
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  if (!token || typeof token !== "string" || token.length < 20) {
    return false;
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    return false;
  }

  // If JWT secret is configured in environment, cryptographically verify signature
  const secret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
  if (secret) {
    try {
      const [hB64, pB64, sig] = parts;
      const expectedSig = createHmac("sha256", secret)
        .update(`${hB64}.${pB64}`)
        .digest("base64url");
      if (expectedSig !== sig) {
        return false;
      }
      const payload = JSON.parse(Buffer.from(pB64, "base64url").toString("utf8"));
      if (payload.exp && Date.now() / 1000 > payload.exp) {
        return false;
      }
    } catch {
      return false;
    }
  }

  return true;
}

export async function POST(request: NextRequest) {
  try {
    // 1. Enforce Authentication
    if (!isValidSession(request)) {
      return NextResponse.json(
        { message: "Authentication required to upload files." },
        { status: 401 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { message: "Please select a file to upload." },
        { status: 400 },
      );
    }

    // 2. Strict MIME Type Whitelist
    const extension = EXTENSIONS[file.type];
    if (!extension) {
      return NextResponse.json(
        { message: "Unsupported file type. Only standard images and documents are permitted." },
        { status: 415 },
      );
    }

    if (file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { message: "File must be 15 MB or smaller." },
        { status: 413 },
      );
    }

    // 3. Strict Category Sanitization (no path traversal)
    const rawCategory = (formData.get("category") as string) || "attachments";
    const category = /^[a-zA-Z0-9_-]{1,32}$/.test(rawCategory) ? rawCategory : "attachments";

    const fileName = `${randomUUID()}.${extension}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    // 4. Write to frontend public/uploads
    const frontendDir = path.join(process.cwd(), "public", "uploads", category);
    await mkdir(frontendDir, { recursive: true });
    await writeFile(path.join(frontendDir, fileName), buffer);

    // 5. Write to backend uploads for backend file serving parity
    try {
      const backendDir = path.join(process.cwd(), "..", "backend", "uploads", category);
      await mkdir(backendDir, { recursive: true });
      await writeFile(path.join(backendDir, fileName), buffer);
    } catch {
      // Non-fatal if backend directory path is different in standalone container
    }

    return NextResponse.json({
      file_id: fileName,
      url: `/uploads/${category}/${fileName}`,
      serveUrl: `/api/backend/files/serve/${category}/${fileName}`,
      mime: file.type,
      size: file.size,
      name: file.name,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { message: "The file could not be uploaded." },
      { status: 500 },
    );
  }
}
