import { redirect } from "next/navigation";
import { getAuthorizedOperator } from "@/lib/registration-auth";

export default async function AdminIndexPage() {
  const operator = await getAuthorizedOperator();

  if (!operator.authorized) {
    if (operator.reason === "unauthenticated") {
      redirect("/sign-in?redirect_url=/admin/registrations");
    }

    redirect("/not-authorized");
  }

  redirect("/admin/registrations");
}
