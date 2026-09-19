import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { PageContainer } from "../../../components/shell/PageContainer";
import { Card, CardBody } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { useChatStore } from "../../../stores/useChatStore";
import { useAuthStore } from "../../../stores/useAuthStore";
import { Clock, Zap, BarChart3, Settings, Play, Plus, Sparkles, Compass } from "lucide-react";

export default function CasualDashboard({ onChangePersona }: { onChangePersona: () => void }) {
  const navigate = useNavigate();
  const documents = useChatStore((s) => s.documents);
  const loadDocuments = useChatStore((s) => s.loadDocuments);
  const documentsLoading = useChatStore((s) => s.documentsLoading);
  const user = useAuthStore((s) => s.user);

  const userName = user?.name ?? "Lifelong Learner";
  const latestDoc = documents.length > 0 ? documents[0] : null;

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  return (
    <PageContainer>
      {/* High-End Minimalist Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-[#96C4BB]/15 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Badge tone="gold">Adult & Upskill Node</Badge>
            <span className="text-xs text-[#96C4BB] font-mono">Continuous Visual Mastery</span>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-[#F8FAFA] mt-1.5">
            Welcome back, {userName}
          </h1>
          <p className="text-sm text-[#B2C9C5] mt-1">
            Visual concept streams and self-paced spaced repetition.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onChangePersona}
          className="border-[#96C4BB]/30 text-[#B2C9C5] hover:text-[#F8FAFA] hover:bg-[#507C7C]/20 text-xs cursor-pointer"
        >
          <Settings className="h-3.5 w-3.5 mr-1.5" /> Shift Domain
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {/* AGENT PERFORMANCE METRICS */}
        <div className="md:col-span-3 space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <MetricCard icon={Clock} value="4.2 hrs" label="Time Spent Learning" color="text-[#96C4BB]" />
            <MetricCard icon={Zap} value="18" label="Concepts Mastered" color="text-[#D4AF37]" />
            <MetricCard icon={BarChart3} value="88%" label="Recall Accuracy" color="text-emerald-400" />
          </div>

          {documentsLoading ? (
            <Card>
              <CardBody className="p-12 text-center flex flex-col items-center justify-center gap-3">
                <span className="h-7 w-7 rounded-full border-2 border-[#96C4BB] border-t-[#D4AF37] animate-spin" />
                <span className="text-sm text-[#A3B8B5] font-mono">Syncing active skill decks...</span>
              </CardBody>
            </Card>
          ) : latestDoc ? (
            /* ACTIVE FOCUS BLOCK */
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-[#0E1715]/90 border border-[#96C4BB]/25 backdrop-blur-xl shadow-xl">
                <CardBody className="p-7 text-[#F8FAFA]">
                  <span className="text-[10px] font-mono tracking-widest text-[#D4AF37] uppercase font-bold bg-[#D4AF37]/15 border border-[#D4AF37]/30 px-2.5 py-0.5 rounded-full">
                    Active Skill Deck
                  </span>
                  <h2 className="text-2xl font-bold tracking-tight mt-3 text-[#F8FAFA]">
                    {latestDoc.title}
                  </h2>
                  <p className="text-xs text-[#96C4BB] font-mono mt-1 uppercase tracking-wider">
                    Domain: {latestDoc.subject}
                  </p>

                  <div className="mt-8 border-t border-[#96C4BB]/15 pt-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-[#111A18] h-2 rounded-full overflow-hidden border border-[#96C4BB]/10">
                        <div className="h-full bg-gradient-to-r from-[#507C7C] to-[#D4AF37]" style={{ width: "60%" }} />
                      </div>
                      <span className="text-xs font-mono font-bold text-[#A3B8B5]">
                        60% Complete
                      </span>
                    </div>

                    <div className="flex gap-3">
                      <Button 
                        onClick={() => navigate("/app/lab")}
                        className="bg-[#D4AF37] hover:bg-[#e0be4d] text-[#070B0A] text-xs font-bold px-6 py-2.5 border-none rounded-xl shadow-lg shadow-[#D4AF37]/20 cursor-pointer"
                      >
                        <Play className="h-3.5 w-3.5 mr-1.5 fill-current" /> Resume Stream
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => navigate("/app/upload")}
                        className="border-[#96C4BB]/30 text-[#F8FAFA] hover:bg-[#507C7C]/20 text-xs px-5 py-2.5 cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5 mr-1.5" /> Ingest New
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          ) : (
            /* NEW USER WELCOME */
            <div className="rounded-3xl border border-dashed border-[#96C4BB]/30 bg-[#0E1715]/70 p-8 text-center backdrop-blur-xl">
              <div className="h-14 w-14 rounded-2xl bg-[#507C7C]/20 border border-[#96C4BB]/30 text-[#D4AF37] flex items-center justify-center mx-auto mb-4">
                <Compass className="h-7 w-7" />
              </div>
              <h4 className="font-display font-bold text-xl text-[#F8FAFA]">No active skill decks yet</h4>
              <p className="text-xs text-[#A3B8B5] mt-1 max-w-sm mx-auto leading-relaxed">
                Upload business reports, technical guides, or articles to get interactive visual summaries and flashcards.
              </p>
              <Button 
                onClick={() => navigate("/app/upload")}
                className="mt-5 bg-[#D4AF37] hover:bg-[#e0be4d] text-[#070B0A] font-bold text-xs px-6 py-2.5 rounded-xl cursor-pointer"
              >
                <Plus className="h-4 w-4 mr-1.5" /> Ingest New Material
              </Button>
            </div>
          )}
        </div>

        {/* SIDE BAR */}
        <div className="space-y-6">
          <Card className="border-[#96C4BB]/20 bg-[#0E1715]/90">
            <CardBody className="p-5">
              <h4 className="font-display font-semibold text-sm text-[#F8FAFA] mb-2 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-[#D4AF37]" /> Efficiency Metric
              </h4>
              <p className="text-xs text-[#B2C9C5] leading-relaxed">
                Adaptive spacing saves ~40% of standard study time by eliminating over-repetition of known items.
              </p>
            </CardBody>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}

function MetricCard({ icon: Icon, value, label, color }: any) {
  return (
    <div className="p-4 rounded-2xl bg-[#0E1715]/85 border border-[#96C4BB]/20 backdrop-blur-xl shadow-lg">
      <div className="flex items-center justify-between">
        <span className="text-xs text-[#A3B8B5] font-medium">{label}</span>
        <Icon className={`h-4 w-4 ${color}`} />
      </div>
      <p className="mt-2 text-2xl font-bold font-display tracking-tight text-[#F8FAFA]">{value}</p>
    </div>
  );
}
