import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { PageContainer } from "../../../components/shell/PageContainer";
import { Card, CardBody } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { useChatStore } from "../../../stores/useChatStore";
import { useAuthStore } from "../../../stores/useAuthStore";
import { BookOpen, Target, Plus, Play, Sparkles, HelpCircle, GraduationCap, Settings, Layers } from "lucide-react";

export default function SecondaryDashboard({ onChangePersona }: { onChangePersona: () => void }) {
  const navigate = useNavigate();
  const documents = useChatStore((s) => s.documents);
  const loadDocuments = useChatStore((s) => s.loadDocuments);
  const documentsLoading = useChatStore((s) => s.documentsLoading);
  const user = useAuthStore((s) => s.user);

  const userName = user?.name ?? "Student";
  const latestDoc = documents.length > 0 ? documents[0] : null;

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  return (
    <PageContainer>
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-[#96C4BB]/15 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Badge tone="teal">Secondary / High School</Badge>
            <span className="text-xs text-[#96C4BB] font-medium">Exam Preparation Suite</span>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-[#F8FAFA] mt-1.5">
            Welcome back, {userName}!
          </h1>
          <p className="text-sm text-[#B2C9C5] mt-1">
            Exam preparation suite active. Review concepts, practice flashcards, and test with timed quizzes.
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onChangePersona} 
          className="border-[#96C4BB]/30 text-[#B2C9C5] hover:text-[#F8FAFA] hover:bg-[#507C7C]/20 text-xs cursor-pointer"
        >
          <Settings className="h-3.5 w-3.5 mr-1.5" /> Change Persona
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ACTIVE SYLLABUS TRACKER */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#96C4BB]">
            My Course Work
          </h3>

          {documentsLoading ? (
            <Card>
              <CardBody className="p-12 text-center flex flex-col items-center justify-center gap-3">
                <span className="h-7 w-7 rounded-full border-2 border-[#96C4BB] border-t-[#D4AF37] animate-spin" />
                <span className="text-sm text-[#A3B8B5] font-medium">Fetching syllabus decks...</span>
              </CardBody>
            </Card>
          ) : latestDoc ? (
            /* ACTIVE MATERIAL CARD */
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-[#0E1715]/90 border border-[#96C4BB]/25 p-6 rounded-3xl backdrop-blur-xl shadow-xl flex flex-col justify-between min-h-[220px]"
            >
              <div className="flex gap-4 items-start">
                <div className="rounded-2xl bg-[#507C7C]/20 border border-[#96C4BB]/30 p-3.5 text-[#D4AF37] shrink-0">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div>
                  <span className="inline-block text-[10px] uppercase font-bold tracking-wider bg-[#507C7C]/20 text-[#96C4BB] border border-[#96C4BB]/30 px-2.5 py-0.5 rounded-full mb-2">
                    Active Study Syllabus
                  </span>
                  <h4 className="font-display font-bold text-xl text-[#F8FAFA] leading-tight">
                    {latestDoc.title}
                  </h4>
                  <p className="text-xs text-[#A3B8B5] mt-1 font-semibold uppercase tracking-wider">
                    Subject: {latestDoc.subject}
                  </p>
                </div>
              </div>

              <div className="mt-6 border-t border-[#96C4BB]/15 pt-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-[#111A18] h-2.5 rounded-full overflow-hidden border border-[#96C4BB]/15">
                    <div className="h-full bg-gradient-to-r from-[#507C7C] to-[#D4AF37]" style={{ width: "80%" }} />
                  </div>
                  <span className="text-xs font-bold text-[#D4AF37] font-mono">
                    80% Reviewed
                  </span>
                </div>

                <div className="flex gap-3">
                  <Button 
                    onClick={() => navigate("/app/lab")}
                    className="bg-[#D4AF37] hover:bg-[#e0be4d] text-[#070B0A] border-none font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-[#D4AF37]/20 cursor-pointer"
                  >
                    <Play className="h-3.5 w-3.5 mr-1.5 fill-current" /> Study Deck
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => navigate("/app/upload")}
                    className="border-[#96C4BB]/30 text-[#F8FAFA] hover:bg-[#507C7C]/20 text-xs px-5 py-2.5 rounded-xl cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Chapter
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : (
            /* NEW USER WELCOME / EMPTY STATE */
            <div className="rounded-3xl border border-dashed border-[#96C4BB]/30 bg-[#0E1715]/75 p-8 text-center backdrop-blur-xl">
              <div className="h-14 w-14 rounded-2xl bg-[#507C7C]/20 border border-[#96C4BB]/30 text-[#D4AF37] flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="h-7 w-7" />
              </div>
              <h4 className="font-display font-bold text-xl text-[#F8FAFA]">No syllabus uploaded yet</h4>
              <p className="text-xs text-[#A3B8B5] mt-1 max-w-sm mx-auto leading-relaxed">
                Drop in your high school class notes, textbook chapters, or exam study guides to get started.
              </p>
              <Button 
                onClick={() => navigate("/app/upload")}
                className="mt-5 bg-[#D4AF37] hover:bg-[#e0be4d] text-[#070B0A] font-bold text-xs px-6 py-2.5 rounded-xl cursor-pointer"
              >
                <Plus className="h-4 w-4 mr-1.5" /> Upload Class Notes
              </Button>
            </div>
          )}
        </div>

        {/* SIDE PANELS */}
        <div className="space-y-6">
          <Card className="border-[#96C4BB]/20 bg-[#0E1715]/90">
            <CardBody className="p-5">
              <h4 className="font-display font-semibold text-sm text-[#F8FAFA] mb-2 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-[#D4AF37]" /> Exam Tips
              </h4>
              <p className="text-xs text-[#B2C9C5] leading-relaxed">
                Review your flashcards every 2 days before an exam. The spaced-repetition scheduler automatically presents cards right before you're likely to forget them.
              </p>
            </CardBody>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
