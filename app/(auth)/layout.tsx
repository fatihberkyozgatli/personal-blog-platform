import { Logo } from "@/components/shared/Logo";
import { Floret } from "@/components/shared/Ornament";
import { CornerSpray, PerchedBird } from "@/components/shared/ornaments";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh place-items-center px-5 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="relative overflow-hidden rounded-t-[3rem] border border-gold/30 bg-parchment px-7 py-10 shadow-card sm:px-10">
          <div className="pointer-events-none absolute inset-3 rounded-t-[2.6rem] border border-gold/15" />
          {/* floral + bird ornament, bottom corners */}
          <CornerSpray className="pointer-events-none absolute bottom-0 left-0 h-20 w-20 opacity-80" />
          <CornerSpray className="pointer-events-none absolute bottom-0 right-0 h-20 w-20 -scale-x-100 opacity-80" />
          <PerchedBird className="pointer-events-none absolute bottom-3 right-6 h-9 w-11 opacity-80" />
          <div className="relative">
            <Floret className="mx-auto mb-5 h-5 w-5" />
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
