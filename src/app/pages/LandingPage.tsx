import { Link } from "react-router";
import { Button } from "../components/ui/button";
import logoImage from "../../../Logo/Logo.png";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f8faf8] text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-[#38bdf8]/10">
                <img src={logoImage} alt="Levista logo" className="h-7 w-7 object-contain" />
              </div>
              <div>
                <p className="text-lg font-semibold tracking-tight text-slate-950">
                  Levista SmartDesk
                </p>
                <p className="text-xs text-slate-500">Internal support portal</p>
              </div>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.16),_transparent_55%)]" />
          <div className="mx-auto flex max-w-7xl flex-col items-center px-6 pb-20 pt-20 text-center lg:px-8 lg:pb-24 lg:pt-28">
            <h1 className="max-w-4xl text-5xl font-semibold tracking-[-0.04em] text-slate-950 md:text-7xl">
              One desk for staff,
              <span className="block text-[#38bdf8]">admin, and HR support</span>
            </h1>

            <p className="mt-8 max-w-3xl text-lg leading-8 text-slate-600 md:text-xl">
              Levista SmartDesk keeps your existing workflow intact while giving your company a
              clean internal portal for employee requests, admin follow-up, HR coordination, and
              fast status tracking.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link to="/login?role=levista&redirect=%2Fraise-ticket">
                <Button
                  size="lg"
                  className="h-12 rounded-lg bg-[#38bdf8] px-7 text-slate-950 hover:bg-[#0ea5e9]"
                >
                  Raise ticket
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 rounded-lg border-slate-300 bg-white px-7 text-slate-900 hover:bg-slate-50"
                >
                  Admin / HR login
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-sm text-slate-500">
              Levista employees will be asked to log in before they can raise a ticket or check
              ticket status.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
