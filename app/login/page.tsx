import Link from "next/link";
import { redirect } from "next/navigation";

async function signInAction() {
  "use server";

  redirect("/dashboard");
}

function AppLogo() {
  return (
    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[linear-gradient(135deg,#2f2ee8_0%,#5646ff_100%)] shadow-[0_20px_40px_rgba(72,60,255,0.22)]">
      <svg
        aria-hidden="true"
        className="h-6 w-6 text-white"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 4v4" />
        <path d="M8.5 8.5 12 20l3.5-11.5" />
        <path d="M9.5 12h5" />
      </svg>
    </div>
  );
}

function MailIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5 text-slate-400"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
      <path d="m5.5 8 6.5 5 6.5-5" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5 text-slate-400"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V8a4 4 0 1 1 8 0v2" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m13 5 7 7-7 7" />
    </svg>
  );
}

export default function LoginPage() {
  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#f7f5ff] px-6 py-12 text-slate-900">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,#ffffff_0%,#f7f5ff_38%,#f3f0ff_100%)]" />
      <div className="pointer-events-none absolute left-1/2 top-24 h-72 w-72 -translate-x-[140%] rounded-full bg-[radial-gradient(circle,rgba(86,70,255,0.12)_0%,rgba(86,70,255,0)_72%)] blur-2xl" />
      <div className="pointer-events-none absolute right-[8%] top-1/2 hidden h-[18rem] w-[13rem] -translate-y-1/2 rounded-[2rem] border border-white/40 bg-white/16 shadow-[0_24px_60px_rgba(91,82,167,0.08)] backdrop-blur-sm lg:block" />
      <div className="pointer-events-none absolute right-[4%] top-1/2 hidden h-[14rem] w-[10rem] -translate-y-[38%] rounded-[2rem] border border-white/35 bg-white/10 shadow-[0_24px_60px_rgba(91,82,167,0.06)] backdrop-blur-sm xl:block" />

      <div className="relative mx-auto flex min-h-[calc(100vh-6rem)] max-w-5xl items-center justify-center">
        <div className="w-full max-w-md text-center">
          <div className="mb-6 flex justify-center">
            <AppLogo />
          </div>

          <header className="mb-8 space-y-2">
            <h1 className="text-4xl font-semibold tracking-[-0.04em] text-slate-900">
              A/B Testing Dashboard
            </h1>
            <p className="text-base text-slate-500">
              Track and optimize funnel performance
            </p>
          </header>

          <section className="rounded-[2rem] border border-white/70 bg-white/92 p-8 text-left shadow-[0_28px_80px_rgba(118,97,255,0.12)] backdrop-blur">
            <form action={signInAction} className="space-y-5">
              <div className="space-y-2">
                <label
                  className="block text-sm font-semibold text-slate-700"
                  htmlFor="email"
                >
                  Email Address
                </label>
                <div className="flex h-14 items-center rounded-2xl bg-[#f2f1fe] px-4 ring-1 ring-transparent transition focus-within:ring-[#4d44ff]/30">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@company.com"
                    className="h-full w-full border-0 bg-transparent text-base text-slate-900 outline-none placeholder:text-slate-400"
                    autoComplete="email"
                  />
                  <MailIcon />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <label
                    className="block text-sm font-semibold text-slate-700"
                    htmlFor="password"
                  >
                    Password
                  </label>
                  <Link
                    href="/login"
                    className="text-sm font-semibold text-[#4d44ff] transition hover:text-[#3930f3]"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="flex h-14 items-center rounded-2xl bg-[#f2f1fe] px-4 ring-1 ring-transparent transition focus-within:ring-[#4d44ff]/30">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="........"
                    className="h-full w-full border-0 bg-transparent text-base text-slate-900 outline-none placeholder:text-slate-400"
                    autoComplete="current-password"
                  />
                  <LockIcon />
                </div>
              </div>

              <label className="flex items-center gap-3 pt-1 text-sm text-slate-600">
                <input
                  type="checkbox"
                  name="remember"
                  className="h-4 w-4 rounded-full border-slate-300 bg-[#eef0ff] text-[#4d44ff] focus:ring-[#4d44ff]"
                />
                <span>Remember me on this device</span>
              </label>

              <button
                type="submit"
                className="flex h-14 w-full items-center justify-center gap-3 rounded-full bg-[linear-gradient(135deg,#2f2ee8_0%,#5646ff_100%)] text-lg font-semibold text-white shadow-[0_20px_45px_rgba(78,65,255,0.32)] transition hover:translate-y-[-1px] hover:shadow-[0_24px_50px_rgba(78,65,255,0.35)]"
              >
                <span>Sign In</span>
                <ArrowIcon />
              </button>
            </form>
          </section>

          <div className="mt-7 text-sm text-slate-600">
            <span>Don&apos;t have an account? </span>
            <Link
              href="/login"
              className="font-semibold text-[#4d44ff] transition hover:text-[#3930f3]"
            >
              Create a free workspace
            </Link>
          </div>

          <footer className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] font-medium uppercase tracking-[0.28em] text-slate-400">
            <span>System v4.2.1</span>
            <span>Privacy first</span>
            <span>Encrypted SSL</span>
          </footer>
        </div>
      </div>
    </main>
  );
}
