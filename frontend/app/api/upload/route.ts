import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const IMAGE_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { message: "Please choose a delivery image." },
        { status: 400 },
      );
    }

    const extension = IMAGE_EXTENSIONS[file.type];
    if (!extension) {
      return NextResponse.json(
        { message: "Only JPG, PNG and WebP images are supported." },
        { status: 415 },
      );
    }

    if (file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { message: "Image must be 5 MB or smaller." },
        { status: 413 },
      );
    }

    const category =
      formData.get("category") === "pod" ? "pod" : "attachments";
    const fileName = `${randomUUID()}.${extension}`;
    const uploadDirectory = path.join(
      process.cwd(),
      "public",
      "uploads",
      category,
    );

    await mkdir(uploadDirectory, { recursive: true });
    await writeFile(
      path.join(uploadDirectory, fileName),
      Buffer.from(await file.arrayBuffer()),
    );

    return NextResponse.json({
      file_id: fileName,
      url: `/uploads/${category}/${fileName}`,
      mime: file.type,
      size: file.size,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { message: "The image could not be uploaded." },
      { status: 500 },
    );
  }
}
