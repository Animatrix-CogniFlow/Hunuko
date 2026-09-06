import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { BrandLogo } from "../brand/BrandLogo";
import { AmbientBackground } from "../visuals/AmbientBackground";

export function AuthLayout({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Cinematic side panel — Deep Void with Animatrix Mascot Showcase */}
      <div className="dark relative hidden overflow-hidden bg-[#070B0A] lg:block border-r border-[#96C4BB]/20">
        <AmbientBackground variant="hero" />
        <div className="absolute inset-0 cf-grid-bg opacity-30" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <BrandLogo textClassName="text-white" />

          {/* Mascot in glowing glass card frame */}
          <div className="flex flex-1 items-center justify-center py-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-[#96C4BB]/35 bg-[#111A18]/75 p-7 shadow-[0_0_35px_rgba(80,124,124,0.25)] backdrop-blur-xl text-center"
            >
              {/* Radial glow aura */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="h-44 w-44 rounded-full bg-[#507C7C]/25 blur-2xl" />
                <div className="absolute h-32 w-32 rounded-full bg-[#D4AF37]/15 blur-xl" />
              </div>

              <motion.img
                src="/assets/mascot.jpg"
                alt="Hunuko AI Mascot"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10 mx-auto h-52 w-auto max-w-full rounded-2xl object-contain drop-shadow-[0_16px_28px_rgba(0,0,0,0.7)]"
              />

              <div className="relative z-10 mt-5">
                <h3 className="font-display text-xl font-bold tracking-tight text-[#F8FAFA]">
                  Ready to learn visually with Hunuko?
                </h3>
                <p className="mt-1.5 text-xs text-[#B2C9C5] leading-relaxed">
                  Your autonomous companion transforms complex concepts into animated, interactive explanations.
                </p>
              </div>
            </motion.div>
          </div>

          <div className="max-w-md">
            <h2 className="font-display text-2xl font-semibold leading-tight tracking-tight text-[#F8FAFA]">
              Visual intelligence for effortless learning.
            </h2>
            <p className="mt-2 text-sm text-[#B2C9C5] leading-relaxed">
              Upload notes, practice oral exams, and master challenging concepts with Hunuko.
            </p>
          </div>
        </div>
      </div>

      {/* Form side — clean high-contrast responsive theme */}
      <div className="flex items-center justify-center bg-[#F5F8F7] p-6 sm:p-10 dark:bg-[#0E1715] transition-colors">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-sm"
        >
          <div className="mb-8 lg:hidden">
            <BrandLogo />
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#0B1311] dark:text-[#F8FAFA]">{title}</h1>
          <p className="mt-1.5 text-sm text-[#2D3E3A] dark:text-[#B2C9C5]">{subtitle}</p>
          <div className="mt-7">{children}</div>
        </motion.div>
      </div>
    </div>
  );
}
