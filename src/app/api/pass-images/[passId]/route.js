import { buildQrPngBuffer } from "@/lib/registration-pass";
import { getEntryPassById } from "@/lib/registration-db";

export async function GET(_request, context) {
  try {
    const { passId } = await context.params;
    const result = await getEntryPassById(String(passId || "").trim());

    if (!result.pass || result.pass.status !== "issued" || !result.pass.token) {
      return new Response("Not found.", { status: 404 });
    }

    const png = await buildQrPngBuffer(result.pass.token);

    return new Response(png, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Unable to generate QR image.", { status: 500 });
  }
}
