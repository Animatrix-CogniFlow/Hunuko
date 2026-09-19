import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { PageContainer } from "../../../components/shell/PageContainer";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { useChatStore } from "../../../stores/useChatStore";
import { useAuthStore } from "../../../stores/useAuthStore";
import { Sparkles, Trophy, Flame, Star, Rocket, Play, Plus, BookOpen, MessageSquare, Gamepad2, Settings } from "lucide-react";

export default function KidsDashboard({ onChangePersona }: { onChangePersona: () => void }) {
  const navigate = useNavigate();
  const documents = useChatStore((s) => s.documents);
  const loadDocuments = useChatStore((s) => s.loadDocuments);
  const documentsLoading = useChatStore((s) => s.documentsLoading);
  const user = useAuthStore((s) => s.user);

  const userName = user?.name ?? "Explorer";
  const latestDoc = documents.length > 0 ? documents[0] : null;

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  return (
    <PageContainer>
      {/* Playful Animatrix Top Banner */}
      <div className="flex flex-wrap justify-between items-center mb-8 bg-[#0E1715]/90 backdrop-blur-xl rounded-3xl p-5 border border-[#96C4BB]/25 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <img
              src="/assets/mascot.jpg"
              alt="Hunuko Mascot"
              className="h-12 w-12 rounded-2xl object-cover border border-[#96C4BB]/40 shadow-lg"
            />
            <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-[#D4AF37] border-2 border-[#070B0A] animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-bold tracking-tight text-[#F8FAFA]">
                CogniAdventure
              </h1>
              <Badge tone="gold">Kids Mode</Badge>
            </div>
            <p className="text-xs text-[#96C4BB] font-medium">Your interactive visual space playground</p>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-3 sm:mt-0">
          <div className="flex items-center gap-1.5 bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#D4AF37] px-3.5 py-1.5 rounded-full text-xs font-bold shadow-sm">
            <Flame className="h-4 w-4 fill-current" /> Welcome, {userName}!
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onChangePersona}
            className="text-xs border-[#96C4BB]/30 text-[#B2C9C5] hover:text-white hover:bg-[#507C7C]/20 cursor-pointer"
          >
            <Settings className="h-3.5 w-3.5 mr-1" /> Switch
          </Button>
        </div>
      </div>

      {/* Main Play Area */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          {documentsLoading ? (
            <div className="bg-[#0E1715]/80 rounded-3xl p-12 text-center border border-[#96C4BB]/20 flex flex-col items-center justify-center gap-3">
              <span className="h-8 w-8 rounded-full border-2 border-[#96C4BB] border-t-[#D4AF37] animate-spin" />
              <span className="font-bold text-sm text-[#96C4BB]">Loading your adventure maps...</span>
            </div>
          ) : latestDoc ? (
            /* ACTIVE MISSION CARD */
            <motion.div
              whileHover={{ y: -3 }}
              className="bg-[#0E1715]/90 rounded-3xl p-7 border border-[#96C4BB]/25 backdrop-blur-xl shadow-xl flex flex-col justify-between min-h-[260px]"
            >
              <div>
                <div className="inline-flex items-center gap-1.5 bg-[#507C7C]/20 border border-[#96C4BB]/30 text-[#96C4BB] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                  <Sparkles className="h-3 w-3 text-[#D4AF37]" /> Active Space Mission
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-[#F8FAFA] leading-tight">
                  Let's explore: {latestDoc.title}!
                </h2>
                <p className="text-[#A3B8B5] mt-1.5 text-sm font-medium">
                  Subject: {latestDoc.subject}
                </p>
              </div>

              {/* Progress and Actions */}
              <div className="mt-8 border-t border-[#96C4BB]/15 pt-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-32 bg-[#111A18] h-2.5 rounded-full overflow-hidden border border-[#96C4BB]/15">
                    <div className="h-full bg-gradient-to-r from-[#507C7C] via-[#96C4BB] to-[#D4AF37]" style={{ width: "70%" }} />
                  </div>
                  <span className="text-xs font-bold text-[#D4AF37]">70% Explored</span>
                </div>

                <div className="flex gap-3 w-full sm:w-auto">
                  <Button
                    onClick={() => navigate("/app/lab")}
                    className="flex-1 sm:flex-none bg-[#D4AF37] hover:bg-[#e0be4d] text-[#070B0A] font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-[#D4AF37]/20 border-none cursor-pointer"
                  >
                    <Play className="h-4 w-4 mr-1.5 fill-current" /> Go to Mission 🚀
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/app/upload")}
                    className="flex-1 sm:flex-none border-[#96C4BB]/30 text-[#F8FAFA] hover:bg-[#507C7C]/20 font-semibold py-2.5 px-4 rounded-xl cursor-pointer"
                  >
                    <Plus className="h-4 w-4 mr-1" /> New Map
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : (
            /* NEW USER WELCOME ONBOARDING MAT */
            <motion.div
              className="bg-[#0E1715]/85 rounded-3xl p-8 border border-[#96C4BB]/25 backdrop-blur-xl shadow-xl"
            >
              <div className="text-center flex flex-col items-center max-w-lg mx-auto">
                <div className="h-16 w-16 bg-[#507C7C]/20 border border-[#96C4BB]/30 text-[#D4AF37] rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                  <Rocket className="h-8 w-8 animate-bounce" />
                </div>
                <h2 className="text-2xl font-bold text-[#F8FAFA]">Welcome to CogniAdventure!</h2>
                <p className="text-[#A3B8B5] mt-1.5 text-sm">
                  We turn school lessons into interactive visual stories and fun games. Here is how you can play:
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 mt-6">
                <div className="p-3.5 rounded-2xl bg-[#111A18]/80 border border-[#96C4BB]/15">
                  <span className="font-bold text-xs text-[#D4AF37] flex items-center gap-1.5 mb-1">
                    <Plus className="h-3.5 w-3.5" /> 1. Upload a Book
                  </span>
                  <p className="text-xs text-[#A3B8B5] leading-relaxed">
                    Upload your lesson notes or homework file.
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#111A18]/80 border border-[#96C4BB]/15">
                  <span className="font-bold text-xs text-[#96C4BB] flex items-center gap-1.5 mb-1">
                    <BookOpen className="h-3.5 w-3.5" /> 2. Watch Animation
                  </span>
                  <p className="text-xs text-[#A3B8B5] leading-relaxed">
                    Watch the concepts move around in the Visual Lab!
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#111A18]/80 border border-[#96C4BB]/15">
                  <span className="font-bold text-xs text-[#D4AF37] flex items-center gap-1.5 mb-1">
                    <MessageSquare className="h-3.5 w-3.5" /> 3. Chat with Hunuko
                  </span>
                  <p className="text-xs text-[#A3B8B5] leading-relaxed">
                    Click the mascot bubble on the bottom right to ask questions!
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#111A18]/80 border border-[#96C4BB]/15">
                  <span className="font-bold text-xs text-[#96C4BB] flex items-center gap-1.5 mb-1">
                    <Gamepad2 className="h-3.5 w-3.5" /> 4. Play Quizzes
                  </span>
                  <p className="text-xs text-[#A3B8B5] leading-relaxed">
                    Answer quick questions and earn cool space badges!
                  </p>
                </div>
              </div>

              <div className="mt-6 text-center">
                <Button
                  onClick={() => navigate("/app/upload")}
                  className="bg-[#D4AF37] hover:bg-[#e0be4d] text-[#070B0A] font-bold text-sm py-3 px-6 rounded-xl border-none shadow-lg shadow-[#D4AF37]/25 cursor-pointer"
                >
                  Start Your First Mission 🚀
                </Button>
              </div>
            </motion.div>
          )}
        </div>

        {/* REWARDS BLOCK */}
        <div className="bg-[#0E1715]/90 rounded-3xl p-6 border border-[#D4AF37]/25 backdrop-blur-xl shadow-xl flex flex-col justify-between min-h-[260px]">
          <div>
            <h3 className="font-display font-bold text-lg text-[#F8FAFA] flex items-center gap-2">
              <Trophy className="h-5 w-5 text-[#D4AF37]" /> My Space Badges
            </h3>
            <div className="grid grid-cols-3 gap-3 mt-4">
              {[1, 2, 3].map((b) => (
                <div
                  key={b}
                  className="aspect-square bg-[#111A18] border border-[#96C4BB]/20 rounded-2xl flex items-center justify-center text-[#D4AF37] hover:scale-105 transition-transform hover:border-[#D4AF37]/50 shadow-md"
                >
                  <Star className="h-6 w-6 fill-current text-[#D4AF37]" />
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs font-medium text-[#A3B8B5] text-center mt-4">
            Gain <span className="font-bold text-[#D4AF37]">50 XP</span> more to unlock the next badge!
          </p>
        </div>
      </div>
    </PageContainer>
  );
}
