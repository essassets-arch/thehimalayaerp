import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { NextResponse } from "next/server";

const MAX_IMAGE_SIZE = 25 * 1024 * 1024; // 25 MB
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

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { message: "Please select a file to upload." },
        { status: 400 },
      );
    }

    const extension = EXTENSIONS[file.type] || path.extname(file.name).replace('.', '') || "jpg";

    if (file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { message: "File must be 25 MB or smaller." },
        { status: 413 },
      );
    }

    const category = (formData.get("category") as string) || "attachments";
    const fileName = `${randomUUID()}.${extension}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    // 1. Write to frontend public/uploads
    const frontendDir = path.join(process.cwd(), "public", "uploads", category);
    await mkdir(frontendDir, { recursive: true });
    await writeFile(path.join(frontendDir, fileName), buffer);

    // 2. Write to backend uploads for backend file serving parity
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
