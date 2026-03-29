import { redirect } from "next/navigation";
import operatorAuthUi from "@/lib/operator-auth-ui.cjs";

const { getOperatorRedirectTarget } = operatorAuthUi;

export default async function Page({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const redirectTarget = getOperatorRedirectTarget(resolvedSearchParams?.redirect_url);

  redirect(`/sign-in?redirect_url=${encodeURIComponent(redirectTarget)}`);
}
