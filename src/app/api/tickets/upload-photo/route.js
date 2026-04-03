import path from "node:path";
import { randomUUID } from "node:crypto";
import { imageSize } from "image-size";
import { protectPublicPostRoute } from "@/lib/api-security";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const TICKET_PHOTO_BUCKET = "festival-ticket-photos";
const ACCEPTED_MIME_TYPES = new Set(["image/jpeg", "image/png"]);
const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB
const MIN_IMAGE_SIZE = 150; // px

function getExtension(file) {
  const ext = path
    .extname(file.name || "")
    .replace(".", "")
    .toLowerCase();
  if (ext === "jpeg") return "jpg";
  return ext || (file.type === "image/png" ? "png" : "jpg");
}

export async function POST(request) {
  const protection = await protectPublicPostRoute(
    request,
    "festival-ticket-upload-photo",
    { windowMs: 15 * 60 * 1000, maxRequests: 10 },
  );

  if (!protection.ok) {
    return protection.response;
  }

  try {
    const formData = await request.formData();
    const photo = formData.get("photo");

    if (!(photo instanceof File) || !photo.size) {
      return Response.json(
        { error: "A photo file is required." },
        { status: 400, headers: protection.headers },
      );
    }

    if (!ACCEPTED_MIME_TYPES.has(photo.type)) {
      return Response.json(
        { error: "Photo must be a JPG or PNG file." },
        { status: 400, headers: protection.headers },
      );
    }

    if (photo.size > MAX_FILE_SIZE_BYTES) {
      return Response.json(
        { error: "Photo must be 2 MB or smaller." },
        { status: 400, headers: protection.headers },
      );
    }

    const arrayBuffer = await photo.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const dimensions = imageSize(buffer);

    if (
      !dimensions.width ||
      !dimensions.height ||
      dimensions.width < MIN_IMAGE_SIZE ||
      dimensions.height < MIN_IMAGE_SIZE
    ) {
      return Response.json(
        { error: `Photo must be at least ${MIN_IMAGE_SIZE}×${MIN_IMAGE_SIZE} pixels.` },
        { status: 400, headers: protection.headers },
      );
    }

    const ext = getExtension(photo);
    const storagePath = `tickets/${randomUUID()}.${ext}`;
    const supabase = getSupabaseAdmin();

    const { error: uploadError } = await supabase.storage
      .from(TICKET_PHOTO_BUCKET)
      .upload(storagePath, buffer, {
        contentType: photo.type,
        upsert: false,
      });

    if (uploadError) {
      return Response.json(
        { error: uploadError.message },
        { status: 500, headers: protection.headers },
      );
    }

    return Response.json(
      {
        path: storagePath,
        width: dimensions.width,
        height: dimensions.height,
        sizeBytes: photo.size,
      },
      { headers: protection.headers },
    );
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to upload photo.",
      },
      { status: 400, headers: protection.headers },
    );
  }
}
