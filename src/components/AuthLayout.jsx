import React from "react";
import { Home, MapPin, ShieldCheck, UsersRound, Zap } from "lucide-react";

const heroImage =
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1900&q=88";

function Wordmark({ light = false }) {
  return (
    <div className="inline-flex items-center gap-2.5">
      <span className={"flex h-10 w-10 items-center justify-center rounded-[13px] " + (light ? "bg-white text-[#783DF0]" : "bg-[#783DF0] text-white")}>
        <Home className="h-[19px] w-[19px]" strokeWidth={2.5} />
      </span>
      <span className={"text-[23px] font-extrabold tracking-[-0.075em] " + (light ? "text-white" : "text-[#201A30]")}>
        HOMORA<span className={light ? "text-[#D4C2FF]" : "text-[#783DF0]"}>.</span>
      </span>
    </div>
  );
}

const features = [
  { icon: MapPin, label: "Verified", second: "listings" },
  { icon: ShieldCheck, label: "Safe &", second: "reliable" },
  { icon: UsersRound, label: "Real", second: "rooms" },
  { icon: Zap, label: "Quick", second: "booking" },
];

function DiscoverHero() {
  return (
    <aside className="relative hidden min-h-[760px] overflow-hidden rounded-[26px] bg-[#2B2039] lg:flex lg:flex-col">
      <img
        src={heroImage}
        alt="Warm, thoughtfully designed living space"
        className="absolute inset-0 h-full w-full object-cover"
        fetchPriority="high"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,14,28,0.24)_0%,rgba(20,14,28,0.04)_33%,rgba(20,14,28,0.18)_54%,rgba(20,14,28,0.78)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(64,35,110,0.25),transparent_58%)]" />

      <div className="relative z-10 flex min-h-[760px] flex-1 flex-col p-8 xl:p-10">
        <div className="flex items-center justify-between gap-4">
          <Wordmark light />
          <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[11px] font-medium text-white/90 backdrop-blur-md">
            Discover <span className="mx-1 text-[#C6A9FF]">•</span> Book <span className="mx-1 text-[#C6A9FF]">•</span> Live
          </span>
        </div>

        <div className="mt-auto max-w-[510px] pb-7">
          <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.24em] text-white/85">
            HOMORA DISCOVER
          </p>
          <h2 className="max-w-[490px] text-[46px] font-semibold leading-[1.05] tracking-[-0.065em] text-white xl:text-[58px]">
            Find a space
            <br />
            that feels like <span className="font-serif font-normal italic text-[#D4BDFF]">home.</span>
          </h2>
          <p className="mt-5 max-w-[390px] text-[14px] leading-7 text-white/85">
            Hostels, PGs, flats and roommates — all in one trusted platform.
          </p>

          <div className="mt-8 grid max-w-[440px] grid-cols-4 gap-2.5">
            {features.map(({ icon: Icon, label, second }) => (
              <div key={label} className="flex min-h-[88px] flex-col items-center justify-center rounded-[15px] border border-white/15 bg-white/[0.12] px-2 py-3 text-center shadow-lg shadow-black/10 backdrop-blur-md">
                <Icon className="mb-2 h-[19px] w-[19px] text-[#CDB5FF]" strokeWidth={2.1} />
                <span className="text-[11px] font-semibold leading-4 text-white">{label}</span>
                <span className="text-[11px] leading-4 text-white/85">{second}</span>
              </div>
            ))}
          </div>

          <div className="mt-7 flex items-center gap-2">
            <span className="h-1.5 w-12 rounded-full bg-[#8C55FF]" />
            <span className="h-1.5 w-7 rounded-full bg-white/35" />
            <span className="h-1.5 w-7 rounded-full bg-white/35" />
          </div>
        </div>
      </div>
    </aside>
  );
}

export default function AuthLayout({
  icon: Icon = Home,
  title,
  subtitle,
  footer,
  topAction,
  children,
}) {
  return (
    <main className="min-h-screen bg-[#EEE9FA] p-0 lg:p-5" style={{ colorScheme: "light" }}>
      <div className="mx-auto grid min-h-screen max-w-[1560px] gap-0 bg-white shadow-none lg:min-h-[calc(100vh-40px)] lg:grid-cols-[1.02fr_0.98fr] lg:gap-3 lg:rounded-[30px] lg:bg-transparent lg:p-2 lg:shadow-[0_28px_90px_-45px_rgba(50,30,90,0.28)]">
        <DiscoverHero />

        <section className="relative flex min-h-screen items-center justify-center overflow-y-auto bg-white px-6 py-9 sm:px-10 lg:min-h-[760px] lg:rounded-[26px] lg:px-12 xl:px-16">
          <div className="w-full max-w-[430px]">
            <div className="mb-8 flex items-center justify-between lg:hidden">
              <Wordmark />
              <span className="rounded-full bg-[#F2ECFF] px-3 py-1.5 text-[10px] font-semibold text-[#783DF0]">
                DISCOVER
              </span>
            </div>

            {topAction && <div className="mb-6">{topAction}</div>}

            <div className="mb-7 text-center">
              <div className="mx-auto mb-5 flex h-[68px] w-[68px] items-center justify-center rounded-[22px] bg-[#F0E9FF] text-[#783DF0] shadow-[0_8px_24px_-17px_rgba(120,61,240,0.5)]">
                <Icon className="h-[29px] w-[29px]" strokeWidth={2.1} />
              </div>
              <h1 className="text-[34px] font-semibold leading-[1.08] tracking-[-0.06em] text-[#201A30] sm:text-[38px]">
                {title}
              </h1>
              {subtitle && (
                <p className="mx-auto mt-3 max-w-[390px] text-[14px] leading-6 text-[#69627B]">
                  {subtitle}
                </p>
              )}
            </div>

            {children}

            {footer && (
              <div className="mt-7 text-center text-[13px] leading-6 text-[#69627B]">
                {footer}
              </div>
            )}

            <div className="mt-8 flex items-center justify-center gap-2 text-[10px] font-medium tracking-[0.055em] text-[#80778F]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00B79F]" />
              YOUR SPACE. YOUR PACE. YOUR HOMORA.
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
