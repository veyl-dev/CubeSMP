import { ArrowUpRight, Blocks, Check, ChevronRight, Copy, Crown, Gem, Shield, ShoppingBag, Sparkles, Zap } from "lucide-react";

const ranks = [
  { name: "VIP", detail: "Your first step beyond the ordinary.", price: "Set by server", perks: ["Exclusive VIP prefix", "Extra homes", "Priority support"], icon: Shield },
  { name: "MVP", detail: "More freedom for your next adventure.", price: "Set by server", perks: ["Everything in VIP", "MVP chat prefix", "More gameplay perks"], icon: Crown, featured: true },
  { name: "ELITE", detail: "The complete premium experience.", price: "Set by server", perks: ["Everything in MVP", "Elite prefix", "Exclusive perks"], icon: Gem }
];
const packages = [{name:"Starter",points:"1,000"},{name:"Standard",points:"3,000"},{name:"Advanced",points:"5,000"},{name:"Premium",points:"10,000"}];

function Logo() {
  return <a href="#" className="flex items-center gap-3 font-black tracking-tight"><span className="grid h-10 w-10 place-items-center rounded-xl border border-sky-400/40 bg-sky-400/10 text-sky-300"><Blocks size={23}/></span><span className="text-xl">CUBE<span className="text-sky-400">SMP</span></span></a>;
}
function Button({children, secondary=false}:{children:React.ReactNode;secondary?:boolean}) {
  return <a href="#store" className={secondary ? "inline-flex items-center gap-2 rounded-xl border border-white/10 px-5 py-3 text-sm font-bold text-white transition hover:border-sky-400/60 hover:bg-white/5" : "inline-flex items-center gap-2 rounded-xl bg-brand-gradient px-5 py-3 text-sm font-extrabold text-white shadow-glow transition hover:brightness-110"}>{children}</a>;
}

export default function Home() {
  return <main className="min-h-screen overflow-hidden">
    <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_-20%,rgba(0,132,255,.17),transparent_55%)]"/>
    <header className="sticky top-0 z-30 border-b border-white/[.07] bg-ink/85 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <Logo/>
        <div className="hidden items-center gap-8 text-sm font-semibold text-slate-400 md:flex"><a className="text-white" href="#">Home</a><a className="transition hover:text-white" href="#store">Store</a><a className="transition hover:text-white" href="#ranks">Ranks</a><a className="transition hover:text-white" href="#how">How to buy</a></div>
        <div className="flex items-center gap-3"><a href="/login" className="hidden text-sm font-bold text-slate-300 hover:text-white sm:block">Log in</a><a href="/register" className="rounded-xl border border-sky-400/30 bg-sky-400/10 px-4 py-2.5 text-sm font-extrabold text-sky-300 transition hover:bg-sky-400/20">My account <ArrowUpRight size={15} className="ml-1 inline"/></a></div>
      </nav>
    </header>
    <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-24 pt-20 md:grid-cols-[1.05fr_.95fr] md:pb-32 md:pt-28">
      <div>
        <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/[.07] px-3 py-1.5 text-xs font-bold tracking-wide text-sky-300"><Sparkles size={13}/> YOUR ADVENTURE STARTS HERE</div>
        <h1 className="max-w-2xl text-5xl font-black leading-[1.04] tracking-[-.055em] sm:text-6xl lg:text-7xl">MAKE YOUR<br/><span className="bg-brand-gradient bg-clip-text text-transparent">MARK.</span></h1>
        <p className="mt-6 max-w-lg text-base leading-7 text-slate-400">Gear up, stand out, and make every moment count. Explore the official CubeSMP store for ranks, points, and server upgrades.</p>
        <div className="mt-9 flex flex-wrap gap-3"><Button>Explore the store <ChevronRight size={16}/></Button><Button secondary>Server information</Button></div>
        <div className="mt-12 flex flex-wrap gap-8 border-t border-white/[.08] pt-7 text-sm"><div><div className="font-extrabold text-white">JAVA + BEDROCK</div><div className="mt-1 text-xs text-slate-500">Play your way</div></div><div><div className="font-extrabold text-white">PLAYER FIRST</div><div className="mt-1 text-xs text-slate-500">Fair, transparent checkout</div></div></div>
      </div>
      <div className="relative mx-auto grid aspect-square w-full max-w-[470px] place-items-center">
        <div className="absolute inset-[8%] rounded-full border border-sky-400/10 bg-sky-400/[.025] shadow-[0_0_100px_rgba(0,130,255,.12)]"/>
        <div className="absolute inset-[19%] rotate-45 rounded-[2.5rem] border border-sky-400/20 bg-gradient-to-br from-sky-400/[.08] to-blue-600/[.03]"/>
        <div className="relative grid h-48 w-48 place-items-center rounded-[2.8rem] border border-sky-300/30 bg-gradient-to-br from-sky-300/20 via-blue-500/10 to-blue-700/20 shadow-[0_0_90px_rgba(0,140,255,.2)]"><Blocks className="text-sky-300" size={104} strokeWidth={1.2}/></div>
        <div className="absolute bottom-[13%] right-[4%] rounded-2xl border border-white/10 bg-panel/90 px-4 py-3 shadow-2xl"><div className="flex items-center gap-2 text-xs font-bold text-emerald-300"><span className="h-2 w-2 rounded-full bg-emerald-400"/> SERVER NETWORK</div><div className="mt-1 text-xs text-slate-400">Join the adventure</div></div>
      </div>
    </section>
    <section id="store" className="border-y border-white/[.06] bg-[#080c13]">
      <div className="mx-auto max-w-7xl px-5 py-20">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4"><div><div className="text-xs font-black tracking-[.22em] text-sky-400">THE CUBESMP STORE</div><h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">UPGRADE YOUR GAME</h2><p className="mt-2 text-sm text-slate-400">Choose your upgrade. Make it yours.</p></div><a href="/store" className="text-sm font-bold text-sky-300 hover:text-white">View all products <ArrowUpRight className="ml-1 inline" size={15}/></a></div>
        <div id="ranks" className="grid gap-4 md:grid-cols-3">{ranks.map((rank)=><article key={rank.name} className={`relative rounded-2xl border p-6 ${rank.featured?"border-sky-400/50 bg-sky-400/[.055] shadow-glow":"border-white/[.08] bg-panel"}`}>{rank.featured&&<div className="absolute right-5 top-5 rounded-full bg-sky-400/15 px-3 py-1 text-[10px] font-black tracking-wider text-sky-300">POPULAR</div>}<rank.icon className="text-sky-400" size={27}/><h3 className="mt-5 text-2xl font-black">{rank.name}</h3><p className="mt-2 min-h-10 text-sm text-slate-400">{rank.detail}</p><div className="my-6 border-t border-white/[.08] pt-5"><span className="text-xl font-black">{rank.price}</span><span className="ml-2 text-xs text-slate-500">price configured in store</span></div><ul className="space-y-3 text-sm text-slate-300">{rank.perks.map(p=><li key={p} className="flex items-center gap-2"><Check size={15} className="text-sky-400"/>{p}</li>)}</ul><a href="/store?category=ranks" className="mt-7 flex items-center justify-center gap-2 rounded-xl border border-sky-400/30 bg-sky-400/10 px-4 py-3 text-sm font-extrabold text-sky-300 hover:bg-sky-400/20">Explore rank <ArrowUpRight size={15}/></a></article>)}</div>
        <div className="mt-14"><div className="mb-6 flex items-end justify-between"><div><div className="text-xs font-black tracking-[.2em] text-sky-400">IN-GAME CURRENCY</div><h3 className="mt-2 text-2xl font-black">POINT PACKAGES</h3></div><Zap className="text-sky-400" size={25}/></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{packages.map(p=><a href="/store?category=points" key={p.name} className="group rounded-xl border border-white/[.08] bg-panel p-5 transition hover:-translate-y-1 hover:border-sky-400/40"><div className="text-sm font-bold text-slate-400">{p.name}</div><div className="mt-2 text-2xl font-black">{p.points}<span className="ml-2 text-xs font-semibold text-sky-400">PTS</span></div><div className="mt-4 flex items-center justify-between text-xs text-slate-500"><span>View package</span><ArrowUpRight size={15} className="text-sky-400 transition group-hover:translate-x-1"/></div></a>)}</div>
      </div>
    </section>
    <section id="how" className="mx-auto max-w-7xl px-5 py-20"><div className="max-w-xl"><div className="text-xs font-black tracking-[.2em] text-sky-400">SIMPLE & SECURE</div><h2 className="mt-3 text-3xl font-black">HOW TO PURCHASE</h2><p className="mt-3 text-sm leading-6 text-slate-400">A straightforward manual payment process. Your order is delivered after an administrator verifies your payment.</p></div><div className="mt-9 grid gap-4 md:grid-cols-3">{[{n:"01",t:"Choose your upgrade",d:"Pick a rank, points package, or available server product."},{n:"02",t:"Submit your payment",d:"Pay using the configured GCash or Maya details and upload your receipt."},{n:"03",t:"Get verified & delivered",d:"An administrator reviews your proof. Approved purchases enter the Minecraft delivery queue."}].map(s=><div key={s.n} className="rounded-2xl border border-white/[.08] bg-panel p-6"><div className="text-sm font-black text-sky-400">{s.n}</div><h3 className="mt-5 font-extrabold">{s.t}</h3><p className="mt-2 text-sm leading-6 text-slate-400">{s.d}</p></div>)}</div></section>
    <footer className="border-t border-white/[.07] bg-[#070a10]"><div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 sm:flex-row sm:items-center sm:justify-between"><Logo/><p className="text-xs text-slate-500">© {new Date().getFullYear()} CubeSMP. All rights reserved.</p><div className="flex gap-5 text-xs font-semibold text-slate-400"><a href="/support" className="hover:text-white">Support</a><a href="/login" className="hover:text-white">Player login</a><a href="/admin" className="hover:text-white">Admin</a></div></div></footer>
  </main>;
}
