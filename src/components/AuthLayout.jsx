import React from "react";
import { Home } from "lucide-react";

const heroImage =
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1800&q=85";

function Wordmark({ light = false }) {
  return (
    <div className="inline-flex items-center gap-2.5">
      <span className={`flex h-10 w-10 items-center justify-center rounded-[13px] ${light ? "bg-white text-[#783DF0]" : "bg-[#783DF0] text-white"}`}>
        <Home className="h-[19px] w-[19px]" strokeWidth={2.4} />
      </span>
      <span className={`text-[24px] font-extrabold tracking-[-0.075em] ${light ? "text-white" : "text-[#211B35] dark:text-white"}`}>
        HOMORA<span className={light ? "text-[#CDBAFF]" : "text-[#783DF0]"}>.</span>
      </span>
    </div>
  );
}

function EditorialHero() {
  return (
    <aside className="relative hidden min-h-[760px] overflow-hidden bg-[#30243E] lg:block">
      <img
        src={heroImage}
        alt="A bright, thoughtfully designed living space"
        className="absolute inset-0 h-full w-full object-cover"
        fetchPriority="high"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(27,19,39,0.44)_0%,rgba(27,19,39,0.04)_34%,rgba(27,19,39,0.14)_52%,rgba(27,19,39,0.82)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(82,42,145,0.22),transparent_58%)]" />

      <div className="relative z-10 flex h-full min-h-[760px] flex-col justify-between p-10 xl:p-12">
        <Wordmark light />

        <div className="max-w-[500px] pb-3">
          <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/75">
            A new place. A new possibility.
          </p>
          <h2 className="max-w-[480px] text-[48px] font-semibold leading-[1.04] tracking-[-0.06em] text-white xl:text-[58px]">
            Find a place
            <br />
            that feels <span className="font-serif font-normal italic text-[#D2C1FF]">like yours.</span>
          </h2>
          <p className="mt-6 max-w-[370px] text-[14px] leading-7 text-white/78">
            Thoughtful spaces, clearer choices and the people who make a new city feel familiar.
          </p>
          <div className="mt-9 flex items-center gap-3">
            <span className="h-px w-9 bg-[#CDBAFF]" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/75">
              Find your place. Find your people.
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-white/25 pt-5 text-[10px] tracking-[0.08em] text-white/65">
          <span>HOMORA LIVING</span>
          <span>MADE FOR THE WAY YOU LIVE</span>
        </div>
      </div>
    </aside>
  );
}

export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  return (
    <main className="min-h-screen bg-[#F3F0F6] p-0 dark:bg-[#100D17] lg:p-5">
      <div className="mx-auto grid min-h-screen max-w-[1440px] overflow-hidden bg-white shadow-none dark:bg-[#15111D] lg:min-h-[760px] lg:grid-cols-[1fr_1fr] lg:rounded-[28px] lg:shadow-[0_28px_90px_-42px_rgba(42,27,66,0.30)]">
        <EditorialHero />

        <section className="flex min-h-screen items-center justify-center px-6 py-10 dark:bg-[#15111D] sm:px-10 lg:min-h-[760px] lg:px-12 xl:px-16">
          <div className="w-full max-w-[430px]">
            <div className="mb-12 lg:hidden">
              <Wordmark />
            </div>

            <div className="mb-8">
              <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.22em] text-[#8D829F] dark:text-[#A99EBB]">
                HOMORA ACCOUNT
              </p>
              <h1 className="text-[34px] font-semibold leading-[1.12] tracking-[-0.055em] text-[#211B35] dark:text-[#F5F1FA] sm:text-[38px]">
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

            <div className="mt-10 flex items-center justify-center gap-2 text-[10px] font-medium tracking-[0.08em] text-[#AAA4B2] dark:text-[#797187]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00B79F]" />
              YOUR SPACE. YOUR PACE.
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
