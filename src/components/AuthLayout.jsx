import React from "react";
import {
  ArrowUpRight,
  Building2,
  Compass,
  Home,
  MapPin,
  Sparkles,
  Users,
} from "lucide-react";

function Brand({ compact = false }) {
  return (
    <div className="inline-flex items-center gap-3">
      <span className={`flex items-center justify-center rounded-[13px] bg-white text-[#783DF0] shadow-sm ${compact ? "h-9 w-9" : "h-10 w-10"}`}>
        <Home className={compact ? "h-[18px] w-[18px]" : "h-5 w-5"} strokeWidth={2.5} />
      </span>
      <span className={`font-extrabold tracking-[-0.07em] text-white ${compact ? "text-[22px]" : "text-[25px]"}`}>
        HOMORA<span className="text-[#B9A0FF]">.</span>
      </span>
    </div>
  );
}

function AuthStoryPanel() {
  return (
    <aside className="relative hidden min-h-[740px] overflow-hidden bg-[#211632] text-white lg:flex lg:flex-col">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_15%,rgba(120,61,240,0.42),transparent_44%),radial-gradient(ellipse_at_90%_82%,rgba(0,194,168,0.18),transparent_35%)]" />
      <div className="pointer-events-none absolute -right-32 top-24 h-[420px] w-[420px] rounded-full border border-white/[0.08]" />
      <div className="pointer-events-none absolute -right-16 top-40 h-[290px] w-[290px] rounded-full border border-white/[0.08]" />
      <div className="pointer-events-none absolute bottom-[-190px] left-[-100px] h-[420px] w-[420px] rounded-full bg-[#783DF0]/20 blur-3xl" />

      <div className="relative z-10 flex h-full flex-1 flex-col p-10 xl:p-14">
        <div className="flex items-center justify-between">
          <Brand />
          <span className="rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-[10px] font-semibold tracking-[0.18em] text-white/65">
            LIVE A LITTLE CLOSER
          </span>
        </div>

        <div className="mt-auto max-w-[520px] pb-10 pt-24">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-3.5 py-2 text-xs font-medium text-white/80 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-[#B9A0FF]" />
            A more thoughtful way to find a stay
          </div>
          <h2 className="max-w-[520px] text-[48px] font-semibold leading-[1.08] tracking-[-0.055em] text-white xl:text-[60px]">
            Find a space.
            <br />
            Find your <span className="font-serif font-normal italic text-[#C5AEFF]">place.</span>
          </h2>
          <p className="mt-6 max-w-[420px] text-[15px] leading-7 text-white/65">
            Explore places to live, compare what matters, and discover people who make a new place feel familiar.
          </p>

          <div className="mt-11 grid max-w-[470px] grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[#783DF0]">
                <Compass className="h-[18px] w-[18px]" />
              </div>
              <p className="text-sm font-semibold text-white">Explore better</p>
              <p className="mt-1 text-xs leading-5 text-white/50">Spaces that suit your everyday.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[#00A992]">
                <Users className="h-[18px] w-[18px]" />
              </div>
              <p className="text-sm font-semibold text-white">Feel at home</p>
              <p className="mt-1 text-xs leading-5 text-white/50">Discover the people around you.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-white/10 pt-6 text-[11px] text-white/40">
          <span>Find your place. Find your people.</span>
          <span className="inline-flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#00C2A8]" /> HOMORA LIVING</span>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-[172px] right-[-8px] hidden w-[220px] rotate-[7deg] rounded-[22px] border border-white/15 bg-[#302344]/90 p-4 shadow-2xl shadow-black/20 xl:block">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10"><Building2 className="h-4 w-4 text-[#C5AEFF]" /></div>
          <div>
            <p className="text-[10px] font-semibold text-white/90">YOUR NEXT CHAPTER</p>
            <p className="text-[9px] text-white/45">Starts with a place</p>
          </div>
          <ArrowUpRight className="ml-auto h-4 w-4 text-white/50" />
        </div>
        <div className="mt-4 h-1.5 rounded-full bg-white/10"><div className="h-1.5 w-2/3 rounded-full bg-[#00C2A8]" /></div>
        <div className="mt-2 flex items-center justify-between text-[9px] text-white/45"><span>Explore at your pace</span><MapPin className="h-3 w-3" /></div>
      </div>
    </aside>
  );
}

export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  return (
    <main className="min-h-screen bg-[#F5F3F8] p-0 dark:bg-[#100D17] lg:p-4 xl:p-5">
      <div className="mx-auto grid min-h-screen max-w-[1600px] overflow-hidden bg-white shadow-none dark:bg-[#15111D] lg:min-h-[calc(100vh-32px)] lg:grid-cols-[1.04fr_0.96fr] lg:rounded-[30px] lg:shadow-[0_24px_80px_-36px_rgba(37,24,58,0.28)] xl:min-h-[calc(100vh-40px)]">
        <AuthStoryPanel />

        <section className="relative flex min-h-screen items-center justify-center px-5 py-10 dark:bg-[#15111D] sm:px-8 lg:min-h-0 lg:px-12 xl:px-16">
          <div className="w-full max-w-[430px]">
            <div className="mb-10 flex items-center gap-3 lg:hidden">
              <span className="flex h-10 w-10 items-center justify-center rounded-[13px] bg-[#783DF0] text-white">
                <Home className="h-5 w-5" strokeWidth={2.5} />
              </span>
              <span className="text-[23px] font-extrabold tracking-[-0.07em] text-[#211632] dark:text-white">
                HOMORA<span className="text-[#783DF0]">.</span>
              </span>
            </div>

            <div className="mb-8">
              <div className="mb-5 flex items-center gap-2">
                {Icon && (
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F0EAFE] text-[#783DF0] dark:bg-[#302447] dark:text-[#C6AEFF]">
                    <Icon className="h-[17px] w-[17px]" strokeWidth={2} />
                  </span>
                )}
                <span className="text-[10px] font-bold tracking-[0.2em] text-[#8A8198] dark:text-[#A69CB8]">
                  YOUR HOMORA ACCOUNT
                </span>
              </div>
              <h1 className="text-[32px] font-semibold leading-[1.12] tracking-[-0.055em] text-[#211B35] dark:text-[#F5F1FA] sm:text-[36px]">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-3 max-w-[390px] text-[14px] leading-6 text-[#777084] dark:text-[#AAA2B8]">
                  {subtitle}
                </p>
              )}
            </div>

            {children}

            {footer && (
              <div className="mt-7 text-center text-[13px] leading-6 text-[#777084] dark:text-[#AAA2B8]">
                {footer}
              </div>
            )}

            <div className="mt-10 flex items-center justify-center gap-2 text-[10px] font-medium tracking-[0.04em] text-[#AAA4B2] dark:text-[#797187]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00B79F]" />
              SECURE ACCESS · BUILT AROUND YOU
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
