export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950">
      <div className="relative flex items-center justify-center w-20 h-20">
        <div className="absolute w-20 h-20 rounded-full border-4 border-zinc-800" />
        <div className="absolute w-20 h-20 rounded-full border-4 border-transparent border-t-cyan-400 animate-spin" />

        <div className="absolute w-12 h-12 rounded-full border-4 border-transparent border-t-violet-500 animate-spin [animation-duration:600ms] [animation-direction:reverse]" />

        <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
      </div>
      <p className="mt-6 text-zinc-400 text-sm tracking-[0.3em] uppercase animarr-pules">
        少々お待ちください。。。
      </p>
    </div>
  );
}
