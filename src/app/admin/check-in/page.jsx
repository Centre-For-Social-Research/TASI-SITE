import { redirect } from "next/navigation";
import HomeNavbar from "@/components/home/navbar";
import HomeFooter from "@/components/home/footer";
import CheckInPanel from "@/components/admin/check-in-panel";
import { getAuthorizedOperator } from "@/lib/registration-auth";
import operatorSession from "@/lib/operator-session.cjs";

const { toOperatorSession, logOperatorEvent } = operatorSession;

export default async function AdminCheckInPage() {
  const operator = await getAuthorizedOperator({ route: "admin.checkin.page" });
  logOperatorEvent("admin.checkin.entry", "admin.checkin.page", operator);

  if (!operator.authorized) {
    if (operator.reason === "unauthenticated") {
      redirect("/sign-in?redirect_url=/admin/check-in");
    }

    if (operator.reason === "unauthorized") {
      redirect("/not-authorized");
    }

    return (
      <>
        <HomeNavbar forceSolid />
        <main className="min-h-[70vh] bg-[#fbf6ee] px-6 py-24 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
          <div className="mx-auto max-w-3xl rounded-[10px] border border-slate-200 bg-white p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-900/60">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-600">Access Required</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight">Check-in access is temporarily unavailable.</h1>
            <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Clerk is not fully configured in this environment yet. Add the required Clerk environment variables and redeploy to enable operator sign-in.
            </p>
          </div>
        </main>
        <HomeFooter />
      </>
    );
  }

  return (
    <>
      <HomeNavbar forceSolid />
      <main className="bg-[#fbf6ee] px-6 py-14 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <div className="mx-auto max-w-7xl">
          {logOperatorEvent("admin.checkin.shell", "admin.checkin.page", operator)}
          <CheckInPanel operator={toOperatorSession(operator)} />
        </div>
      </main>
      <HomeFooter />
    </>
  );
}
