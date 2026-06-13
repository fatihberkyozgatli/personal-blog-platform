import { Logo } from "@/components/shared/Logo";
import { Floret } from "@/components/shared/Ornament";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh place-items-center px-5 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="relative rounded-t-[3rem] border border-gold/30 bg-parchment px-7 py-10 shadow-card sm:px-10">
          <div className="pointer-events-none absolute inset-3 rounded-t-[2.6rem] border border-gold/15" />
          <div className="relative">
            <Floret className="mx-auto mb-5 h-5 w-5" />
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
