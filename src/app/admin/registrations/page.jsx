import { redirect } from "next/navigation";
import HomeNavbar from "@/components/home/navbar";
import HomeFooter from "@/components/home/footer";
import BrandedPageHero from "@/components/ui/branded-page-hero";
import RegistrationsAdminPanel from "@/components/admin/registrations-admin-panel";
import { getAuthorizedOperator } from "@/lib/registration-auth";
import operatorSession from "@/lib/operator-session.cjs";

const { toOperatorSession, logOperatorEvent } = operatorSession;

export default async function AdminRegistrationsPage() {
  const operator = await getAuthorizedOperator({ route: "admin.registrations.page" });
  logOperatorEvent("admin.registrations.entry", "admin.registrations.page", operator);

  if (!operator.authorized) {
    if (operator.reason === "unauthenticated") {
      redirect("/sign-in?redirect_url=/admin/registrations");
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
            <h1 className="mt-2 text-3xl font-black tracking-tight">Registration dashboard access is temporarily unavailable.</h1>
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
      <main className="bg-[#fbf6ee] pb-16 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <BrandedPageHero className="pt-32 pb-14 md:pt-36 md:pb-20">
          <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center px-6 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-white/75">Admin Console</p>
            <h1 className="max-w-4xl text-4xl font-black tracking-tight text-white md:text-6xl">
              Review registrations.
              <span className="block text-amber-200">Approve access with confidence.</span>
            </h1>
            <p className="mt-5 max-w-3xl text-sm leading-relaxed text-white/80 md:text-base">
              Manage attendee approvals, issue QR passes, and keep the on-site check-in operation aligned from one
              operator dashboard.
            </p>
          </div>
        </BrandedPageHero>
        <div className="mx-auto -mt-12 max-w-7xl px-6 relative z-20">
          {logOperatorEvent("admin.registrations.shell", "admin.registrations.page", operator)}
          <RegistrationsAdminPanel operator={toOperatorSession(operator)} />
        </div>
      </main>
      <HomeFooter />
    </>
  );
}
