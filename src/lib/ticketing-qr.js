import QRCode from "qrcode";
import { buildTicketQrPayload } from "@/lib/ticketing-utils";

export async function buildTicketQrDataUrl(ticket) {
  return QRCode.toDataURL(buildTicketQrPayload(ticket), {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 320,
    color: {
      dark: "#140f26",
      light: "#FFFFFF",
    },
  });
}
