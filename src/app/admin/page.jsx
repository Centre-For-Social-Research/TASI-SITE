import { redirect } from "next/navigation";
import { getAuthorizedOperator } from "@/lib/registration-auth";
import operatorSession from "@/lib/operator-session.cjs";

const { logOperatorEvent } = operatorSession;

export default async function AdminIndexPage() {
  const operator = await getAuthorizedOperator({ route: "admin.index" });
  logOperatorEvent("admin.index.entry", "admin.index", operator);

  if (!operator.authorized) {
    if (operator.reason === "unauthenticated") {
      redirect("/sign-in?redirect_url=/admin/registrations");
    }

    if (operator.reason === "unauthorized") {
      redirect("/not-authorized");
    }

    redirect("/admin/registrations");
  }

  redirect("/admin/registrations");
}
