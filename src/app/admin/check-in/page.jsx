import { redirect } from "next/navigation";
import HomeNavbar from "@/components/home/navbar";
import HomeFooter from "@/components/home/footer";
import CheckInPanel from "@/components/admin/check-in-panel";
import { getAuthorizedOperator } from "@/lib/registration-auth";

export default async function AdminCheckInPage() {
  const operator = await getAuthorizedOperator();

  if (!operator.authorized) {
    if (operator.reason === "unauthenticated") {
      redirect("/sign-in?redirect_url=/admin/check-in");
    }

    return (
      <>
        <HomeNavbar />
        <main className="min-h-[70vh] bg-[#fbf6ee] px-6 py-24 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
          <div className="mx-auto max-w-3xl rounded-[30px] border border-slate-200 bg-white p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-900/60">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-600">Access Required</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight">You do not have access to the check-in console.</h1>
          </div>
        </main>
        <HomeFooter />
      </>
    );
  }

  return (
    <>
      <HomeNavbar />
      <main className="bg-[#fbf6ee] px-6 py-14 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <div className="mx-auto max-w-7xl">
          <CheckInPanel operator={operator} />
        </div>
      </main>
      <HomeFooter />
    </>
  );
}
