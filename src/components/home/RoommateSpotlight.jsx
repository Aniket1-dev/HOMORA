import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, SlidersHorizontal, ShieldCheck, Users } from "lucide-react";

const steps = [
  { title: "Set your non-negotiables", body: "Budget, move-in date, preferred area and room type." },
  { title: "Share your living preferences", body: "Daily routine, cleanliness, guests, food and pets." },
  { title: "Review matches with context", body: "Compare the preferences that matter before starting a conversation." },
];

export default function RoommateSpotlight() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="hm-roommate-panel">
        <div className="relative z-10 max-w-xl">
          <span className="hm-roommate-kicker"><Users className="h-3.5 w-3.5"/> LIVE WITH THE RIGHT FIT</span>
          <h2 className="mt-4 text-balance text-[28px] font-extrabold leading-tight tracking-tight text-white sm:text-[38px]">A better roommate match starts with the right questions.</h2>
          <p className="mt-4 max-w-lg text-[13px] leading-6 text-white/70">Tell us how you live. HOMORA helps you compare practical preferences before you decide to connect.</p>
          <div className="mt-7 grid gap-4 sm:grid-cols-3">
            {steps.map((step, index) => <div key={step.title} className="rounded-2xl border border-white/15 bg-white/[.07] p-3.5 backdrop-blur-sm"><span className="text-[10px] font-extrabold tracking-widest text-violet-200">0{index + 1}</span><h3 className="mt-2 text-[12px] font-bold text-white">{step.title}</h3><p className="mt-1.5 text-[10px] leading-5 text-white/60">{step.body}</p></div>)}
          </div>
          <Link to="/roommates" className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-[12px] font-extrabold text-violet-800 transition hover:bg-violet-50">Explore roommate matching <ArrowRight className="h-4 w-4"/></Link>
        </div>
        <div className="hm-roommate-art" aria-hidden="true"><div className="hm-roommate-art-photo"/><div className="hm-roommate-float"><ShieldCheck className="h-4 w-4 text-emerald-600"/><span>Preferences first</span><CheckCircle2 className="ml-auto h-4 w-4 text-emerald-600"/></div><div className="hm-roommate-float hm-roommate-float-bottom"><SlidersHorizontal className="h-4 w-4 text-violet-600"/><span>Compare what matters</span></div></div>
      </div>
    </section>
  );
}
