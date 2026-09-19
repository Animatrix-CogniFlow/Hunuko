import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { motion } from "framer-motion";
import { GraduationCap, Baby, BookOpen, Compass, LayoutDashboard, Sparkles } from "lucide-react";

import UniDashboard from "./personas/UniDashboard";
import KidsDashboard from "./personas/KidsDashboard";
import SecondaryDashboard from "./personas/SecondaryDashboard";
import CasualDashboard from "./personas/CasualDashboard";
import Dashboard from "./Dashboard";
import { PageLoader } from "../../components/ui/Loader";
import { AmbientBackground } from "../../components/visuals/AmbientBackground";

const API = (import.meta.env.VITE_API_URL as string) || "";

export default function AdaptiveDashboard() {
  const [persona, setPersona] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useFlagship, setUseFlagship] = useState(false);
  const db = getFirestore();
  const auth = getAuth();

  useEffect(() => {
    async function checkUserPersona() {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists() && userDoc.data().persona) {
          setPersona(userDoc.data().persona);
        } else {
          setPersona(null);
        }
      } catch (err) {
        console.error("Error fetching persona:", err);
      } finally {
        setLoading(false);
      }
    }

    const unsubscribe = auth.onAuthStateChanged(() => {
      checkUserPersona();
    });
    return () => unsubscribe();
  }, [auth, db]);

  async function handleSelectPersona(selectedPersona: string) {
    if (selectedPersona === "flagship") {
      setUseFlagship(true);
      return;
    }
    setLoading(true);
    setError(null);
    const user = auth.currentUser;
    if (!user) return;

    try {
      // 1. Tell the backend first
      const token = await user.getIdToken();
      const res = await fetch(`${API}/api/profile/persona`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ persona: selectedPersona }),
      });

      if (!res.ok) {
        console.warn("Backend persona sync warning, proceeding with local update.");
      }

      // 2. Save to Firestore users collection
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { persona: selectedPersona });

      setPersona(selectedPersona);
    } catch (err) {
      console.error("Error saving persona:", err);
      // Still set locally so the user isn't locked out
      setPersona(selectedPersona);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#070B0A] text-[#F8FAFA]">
        <PageLoader />
      </div>
    );
  }

  if (useFlagship) {
    return <Dashboard />;
  }

  if (!persona) {
    return (
      <div className="relative">
        {error && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 bg-rose-600/90 text-white px-6 py-3 rounded-2xl text-sm font-semibold shadow-2xl backdrop-blur-md border border-rose-500/30">
            {error}
          </div>
        )}
        <OnboardingPersonaSelection
          onSelect={handleSelectPersona}
          onSkip={() => setUseFlagship(true)}
        />
      </div>
    );
  }

  switch (persona) {
    case "university":
      return <UniDashboard onChangePersona={() => setPersona(null)} />;
    case "kid":
      return <KidsDashboard onChangePersona={() => setPersona(null)} />;
    case "secondary":
      return <SecondaryDashboard onChangePersona={() => setPersona(null)} />;
    case "casual":
      return <CasualDashboard onChangePersona={() => setPersona(null)} />;
    default:
      return <Dashboard />;
  }
}

function OnboardingPersonaSelection({
  onSelect,
  onSkip,
}: {
  onSelect: (p: string) => void;
  onSkip: () => void;
}) {
  const options = [
    {
      id: "university",
      title: "University / Research",
      desc: "Deep academic content, technical depth, precise terminology.",
      icon: GraduationCap,
      color: "hover:border-[#96C4BB]/60",
    },
    {
      id: "kid",
      title: "Kids / Primary School",
      desc: "Fun, bright, playful and encouraging.",
      icon: Baby,
      color: "hover:border-[#D4AF37]/60",
    },
    {
      id: "secondary",
      title: "High School Student",
      desc: "Clear structure, exam focused, relatable.",
      icon: BookOpen,
      color: "hover:border-[#96C4BB]/60",
    },
    {
      id: "casual",
      title: "Casual / Adult Learner",
      desc: "Relaxed, practical, real world focused.",
      icon: Compass,
      color: "hover:border-[#D4AF37]/60",
    },
  ];

  return (
    <div className="flex min-h-screen w-screen items-center justify-center bg-[#070B0A] px-6 py-12 text-[#F8FAFA] relative overflow-hidden cf-grid-bg">
      <AmbientBackground variant="hero" />

      <div className="relative z-10 max-w-3xl text-center">
        {/* Mascot Avatar Header */}
        <div className="mb-6 flex justify-center">
          <div className="relative flex items-center justify-center">
            <div className="absolute h-24 w-24 rounded-full bg-[#507C7C]/30 blur-xl animate-pulse" />
            <motion.img
              src="/assets/mascot.jpg"
              alt="Hunuko Mascot"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10 h-20 w-20 rounded-2xl object-contain border border-[#96C4BB]/30 shadow-lg"
            />
          </div>
        </div>

        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-4xl font-bold tracking-tight text-[#F8FAFA]"
        >
          Choose Your Learning Flow
        </motion.h1>
        <p className="mt-2 text-sm text-[#B2C9C5] max-w-lg mx-auto leading-relaxed">
          Hunuko adapts everything — visual explanations, socratic questions, and feedback — based on your study profile.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 text-left">
          {options.map((opt, i) => {
            const Icon = opt.icon;
            return (
              <motion.button
                key={opt.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -3, scale: 1.015 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelect(opt.id)}
                className={`p-5 rounded-2xl border border-[#96C4BB]/20 bg-[#0E1715]/85 backdrop-blur-xl transition-all text-left flex gap-4 items-start shadow-lg hover:shadow-[0_0_20px_rgba(80,124,124,0.25)] ${opt.color} cursor-pointer group`}
              >
                <div className="rounded-xl bg-[#507C7C]/20 border border-[#96C4BB]/25 p-3 text-[#D4AF37] group-hover:scale-105 transition-transform">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-lg text-[#F8FAFA] group-hover:text-[#D4AF37] transition-colors">
                    {opt.title}
                  </h3>
                  <p className="text-xs text-[#A3B8B5] mt-1 leading-relaxed">{opt.desc}</p>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Skip to flagship dashboard CTA */}
        <div className="mt-8">
          <button
            onClick={onSkip}
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#D4AF37] hover:underline cursor-pointer"
          >
            <LayoutDashboard className="h-4 w-4" /> Or continue to default dashboard overview
          </button>
        </div>
      </div>
    </div>
  );
}
