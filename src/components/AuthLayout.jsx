import React from "react";
import { Home } from "lucide-react";

const heroImage =
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1900&q=88";

function Wordmark({ light = false }) {
  return (
    <div className="inline-flex items-center gap-2.5">
      <span className={`flex h-10 w-10 items-center justify-center rounded-[13px] ${light ? "bg-white text-[#783DF0]" : "bg-[#783DF0] text-white"}`}>
        <Home className="h-[19px] w-[19px]" strokeWidth={2.4} />
      </span>
      <span className={`text-[23px] font-extrabold tracking-[-0.075em] ${light ? "text-white" : "text-[#211B35] dark:text-white"}`}>
        HOMORA<span className={light ? "text-[#CDBAFF]" : "text-[#783DF0]"}>.</span>
      </span>
    </div>
  );
}

function LivingPreview() {
  return (
    <aside className="relative hidden min-h-[720px] overflow-hidden rounded-[25px] bg-[#382A47] lg:flex lg:flex-col">
      <img
        src={heroImage}
        alt="Warm, naturally lit contemporary living room"
        className="absolute inset-0 h-full w-full object-cover"
        fetchPriority="high"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/5 to-[#171020]/75" />
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(86,46,143,0.30),transparent_58%)]" />

      <div className="relative z-10 flex flex-1 flex-col justify-between p-9 xl:p-11">
        <Wordmark light />

        <div className="max-w-[470px] pb-3">
          <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/75">
            HOMORA · DISCOVER
          </p>
          <h2 className="text-[45px] font-semibold leading-[1.06] tracking-[-0.06em] text-white xl:text-[54px]">
            A better way
            <br />
            to find <span className="font-serif font-normal italic text-[#D8C9FF]">your place.</span>
          </h2>
          <p className="mt-5 max-w-[350px] text-[14px] leading-7 text-white/80">
            Explore thoughtfully listed homes, understand the real cost, and find a space that fits your everyday.
          </p>
        </div>

        <div className="flex items-center justify-between border-t border-white/25 pt-5 text-[10px] tracking-[0.1em] text-white/70">
          <span>FIND YOUR PLACE. FIND YOUR PEOPLE.</span>
          <span>01 / DISCOVER</span>
        </div>
      </div>
    </aside>
  );
}

export default function AuthLayout({ title, subtitle, footer, children }) {
  return (
    <main className="min-h-screen bg-[#F4F1F7] p-0 dark:bg-[#100D17] lg:p-4 xl:p-5">
      <div className="mx-auto grid min-h-screen max-w-[1460px] gap-0 bg-white dark:bg-[#15111D] lg:min-h-[calc(100vh-32px)] lg:grid-cols-[0.94fr_1.06fr] lg:gap-3 lg:rounded-[30px] lg:bg-transparent lg:p-2 xl:min-h-[calc(100vh-40px)]">
        <LivingPreview />

        <section className="flex min-h-screen items-center justify-center px-6 py-9 dark:bg-[#15111D] sm:px-10 lg:min-h-[720px] lg:rounded-[25px] lg:bg-white lg:px-12 xl:px-16 dark:lg:bg-[#15111D]">
          <div className="w-full max-w-[408px]">
            <div className="mb-10 lg:hidden">
              <Wordmark />
            </div>

            <div className="mb-8">
              <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8D829F] dark:text-[#A99EBB]">
                YOUR HOMORA ACCOUNT
              </p>
              <h1 className="text-[35px] font-semibold leading-[1.1] tracking-[-0.06em] text-[#211B35] dark:text-[#F5F1FA] sm:text-[39px]">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-3 max-w-[370px] text-[14px] leading-6 text-[#777084] dark:text-[#AAA2B8]">
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

            <div className="mt-9 flex items-center justify-center gap-2 text-[10px] font-medium tracking-[0.08em] text-[#AAA4B2] dark:text-[#797187]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00B79F]" />
              SECURE ACCESS · YOUR SPACE, YOUR PACE
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
