import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { PageContainer } from "../../../components/shell/PageContainer";
import { Card, CardBody } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { useChatStore } from "../../../stores/useChatStore";
import { useAuthStore } from "../../../stores/useAuthStore";
import { Terminal, Cpu, Settings, Play, Plus, BookOpen, GraduationCap } from "lucide-react";

export default function UniDashboard({ onChangePersona }: { onChangePersona: () => void }) {
  const navigate = useNavigate();
  const documents = useChatStore((s) => s.documents);
  const loadDocuments = useChatStore((s) => s.loadDocuments);
  const documentsLoading = useChatStore((s) => s.documentsLoading);
  const user = useAuthStore((s) => s.user);

  const userName = user?.name ?? "Researcher";
  const latestDoc = documents.length > 0 ? documents[0] : null;

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  return (
    <PageContainer>
      {/* Top Header Section */}
      <div className="mb-8 flex flex-wrap justify-between items-center gap-4 border-b border-[#96C4BB]/15 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Badge tone="teal">Academic Domain</Badge>
            <span className="text-xs font-mono text-[#A3B8B5]">Socratic RAG Matrix Active</span>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-[#F8FAFA] mt-1.5">
            Welcome back, {userName}
          </h1>
          <p className="text-sm text-[#B2C9C5] mt-1">
            Academic Knowledge Terminal ready for deep cross-examination and visual concept modeling.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onChangePersona}
          className="text-xs border-[#96C4BB]/30 text-[#B2C9C5] hover:text-[#F8FAFA] hover:bg-[#507C7C]/20 cursor-pointer"
        >
          <Settings className="h-3.5 w-3.5 mr-1.5" /> Change Persona
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content Area */}
        <div className="md:col-span-2 space-y-6">
          {documentsLoading ? (
            <Card>
              <CardBody className="p-12 text-center flex flex-col items-center justify-center gap-3">
                <span className="h-7 w-7 rounded-full border-2 border-[#96C4BB] border-t-[#D4AF37] animate-spin inline-block" />
                <span className="text-sm text-[#A3B8B5] font-mono">Querying vector database...</span>
              </CardBody>
            </Card>
          ) : latestDoc ? (
            /* LAST USED DOCUMENT VIEW */
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-[#96C4BB]/25 bg-[#0E1715]/90 backdrop-blur-xl shadow-xl">
                <CardBody className="p-7 text-[#F8FAFA]">
                  <div className="flex items-center gap-2 text-[#D4AF37] mb-3">
                    <Cpu className="h-5 w-5 animate-pulse" />
                    <span className="font-mono text-xs uppercase tracking-widest font-bold">Active Research Corpus</span>
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight mb-2 text-[#F8FAFA]">
                    {latestDoc.title}
                  </h2>
                  <p className="text-xs text-[#96C4BB] font-mono uppercase tracking-wider mb-6">
                    Subject: {latestDoc.subject}
                  </p>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-t border-[#96C4BB]/15 pt-5">
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-[#111A18] h-2 rounded-full overflow-hidden border border-[#96C4BB]/10">
                        <div className="h-full bg-gradient-to-r from-[#507C7C] to-[#D4AF37]" style={{ width: "75%" }} />
                      </div>
                      <span className="text-xs font-mono font-bold text-[#A3B8B5]">
                        75% Parsed
                      </span>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={() => navigate("/app/lab")}
                        className="bg-[#D4AF37] hover:bg-[#e0be4d] text-[#070B0A] border-none font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-[#D4AF37]/20 cursor-pointer"
                      >
                        <Play className="h-3.5 w-3.5 mr-1.5 fill-current" /> Study in Lab
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => navigate("/app/upload")}
                        className="border-[#96C4BB]/30 text-[#F8FAFA] hover:bg-[#507C7C]/20 text-xs px-5 py-2.5 cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5 mr-1.5" /> Ingest Material
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          ) : (
            /* NEW USER ONBOARDING GUIDE */
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-dashed border-[#96C4BB]/30 bg-[#0E1715]/70 backdrop-blur-xl">
                <CardBody className="p-8">
                  <div className="max-w-md mx-auto text-center flex flex-col items-center">
                    <div className="h-16 w-16 rounded-2xl bg-[#507C7C]/20 border border-[#96C4BB]/30 flex items-center justify-center mb-5 shadow-lg shadow-[#507C7C]/20">
                      <GraduationCap className="h-8 w-8 text-[#D4AF37]" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-[#F8FAFA]">Welcome to Hunuko, Academic</h3>
                    <p className="text-sm text-[#B2C9C5] mb-6 leading-relaxed">
                      Hunuko utilizes agentic Socratic Retrieval-Augmented Generation to stress-test your comprehension of research papers and textbooks.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 mt-4 text-left">
                    <div className="p-4 rounded-2xl bg-[#111A18]/80 border border-[#96C4BB]/20">
                      <h4 className="font-semibold text-sm flex items-center gap-2 mb-1.5 text-[#D4AF37]">
                        <Plus className="h-4 w-4" /> 1. Ingest Materials
                      </h4>
                      <p className="text-xs text-[#A3B8B5] leading-relaxed">
                        Submit a textbook or research PDF. Our models extract key concepts and build your vector base.
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#111A18]/80 border border-[#96C4BB]/20">
                      <h4 className="font-semibold text-sm flex items-center gap-2 mb-1.5 text-[#96C4BB]">
                        <BookOpen className="h-4 w-4" /> 2. Visual Studio
                      </h4>
                      <p className="text-xs text-[#A3B8B5] leading-relaxed">
                        Visit the Visual Lab to view generated interactive flowcharts, formulas, and scene narratives.
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 text-center">
                    <Button onClick={() => navigate("/app/upload")} className="bg-[#D4AF37] hover:bg-[#e0be4d] text-[#070B0A] font-bold border-none px-6 cursor-pointer">
                      <Plus className="h-4 w-4 mr-2" /> Upload Your First Material
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Side Panel Section */}
        <div className="space-y-6">
          <Card className="border-[#96C4BB]/20 bg-[#0E1715]/90">
            <CardBody className="p-5 font-mono text-xs text-[#A3B8B5] space-y-3">
              <div className="flex items-center gap-2 text-[#96C4BB] mb-2 font-bold">
                <Terminal className="h-4 w-4 text-[#D4AF37]" />
                <span>SYSTEM LOGS</span>
              </div>
              <p className="text-emerald-400">&gt; socratic RAG pipeline: online</p>
              <p>&gt; cross-examination matrix: active</p>
              {latestDoc && <p className="text-[#D4AF37]">&gt; indexed: {latestDoc.title.substring(0, 18)}...</p>}
              <p className="text-[#96C4BB]">&gt; memory tokens synced</p>
            </CardBody>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
