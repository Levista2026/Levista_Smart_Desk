import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { ArrowRight, ChevronDown, Headphones, Ticket } from "lucide-react";

const navItems = ["Staff Support", "Admin Desk", "HR Desk", "Resources"];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f8faf8] text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <div className="flex items-center gap-12">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#3ecf8e]/15 text-[#22c55e]">
                <Ticket className="h-5 w-5" />
              </div>
              <div>
                <p className="text-lg font-semibold tracking-tight text-slate-950">
                  Levista SmartDesk
                </p>
                <p className="text-xs text-slate-500">Internal support portal</p>
              </div>
            </Link>

            <nav className="hidden items-center gap-7 lg:flex">
              {navItems.map((item) => (
                <button
                  key={item}
                  type="button"
                  className="inline-flex items-center gap-1 text-sm text-slate-600 transition-colors hover:text-slate-950"
                >
                  {item}
                  <ChevronDown className="h-4 w-4" />
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button
                variant="outline"
                className="hidden border-slate-300 bg-white text-slate-900 hover:bg-slate-50 sm:inline-flex"
              >
                Sign in
              </Button>
            </Link>
            <Link to="/raise-ticket">
              <Button className="bg-[#3ecf8e] text-slate-950 shadow-none hover:bg-[#2fbe7d]">
                Raise a ticket
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,_rgba(62,207,142,0.16),_transparent_55%)]" />
          <div className="mx-auto flex max-w-7xl flex-col items-center px-6 pb-24 pt-20 text-center lg:px-8 lg:pb-32 lg:pt-28">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm">
              <Headphones className="h-4 w-4 text-[#22c55e]" />
              <span>Built only for Levista teams</span>
              <ArrowRight className="h-4 w-4" />
            </div>

            <h1 className="max-w-4xl text-5xl font-semibold tracking-[-0.04em] text-slate-950 md:text-7xl">
              One desk for staff,
              <span className="block text-[#3ecf8e]">admin, and HR support</span>
            </h1>

            <p className="mt-8 max-w-3xl text-lg leading-8 text-slate-600 md:text-xl">
              Levista SmartDesk keeps your existing workflow intact while giving your company a
              clean internal portal for employee requests, admin follow-up, HR coordination, and
              fast status tracking.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link to="/raise-ticket">
                <Button
                  size="lg"
                  className="h-12 rounded-lg bg-[#3ecf8e] px-7 text-slate-950 hover:bg-[#2fbe7d]"
                >
                  Start a request
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
          </div>
        </section>
      </main>
    </div>
  );
}
