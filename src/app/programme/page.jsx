import HomeFooter from "@/components/home/footer";
import HomeNavbar from "@/components/home/navbar";

export default function ProgrammePage() {
  return (
    <>
      <HomeNavbar />
      <main className="bg-white">
        <section className="mx-auto w-full max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">Programme</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
            The detailed agenda is currently unavailable on this page. Please check back for
            programme updates.
          </p>
        </section>
      </main>
      <HomeFooter />
    </>
  );
}
