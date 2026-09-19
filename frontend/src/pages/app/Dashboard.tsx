import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Upload,
  MessagesSquare,
  Mic,
  Layers,
  Clock,
  Brain,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Flame,
  Play,
  FileText,
  Plus,
  BookOpen,
} from "lucide-react";
import { PageContainer } from "../../components/shell/PageContainer";
import { StatWidget } from "../../components/dashboard/StatWidget";
import { SessionCard } from "../../components/dashboard/SessionCard";
import { Card, CardBody, CardHeader, CardTitle } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Skeleton } from "../../components/ui/Loader";
import { EmptyState } from "../../components/ui/EmptyState";
import { StaggerGroup, StaggerItem } from "../../components/ui/Motion";
import { useSessions } from "../../hooks/useSessions";
import { useAuthStore } from "../../stores/useAuthStore";
import { useAgentStore } from "../../stores/useAgentStore";
import { useStudyStore } from "../../stores/useStudyStore";
import { useChatStore } from "../../stores/useChatStore";
import { studyService } from "../../services/studyService";

const QUICK_ACTIONS = [
  { icon: Layers, label: "Study decks", to: "/app/study", tone: "from-[#507C7C]/30 to-[#96C4BB]/20 text-[#96C4BB]" },
  { icon: Upload, label: "Upload notes", to: "/app/upload", tone: "from-[#D4AF37]/30 to-[#e0be4d]/20 text-[#D4AF37]" },
  { icon: Play, label: "Visual Lab", to: "/app/lab", tone: "from-[#507C7C]/40 to-[#131F1C] text-[#96C4BB]" },
  { icon: Mic, label: "Practice oral exam", to: "/app/oral", tone: "from-[#96C4BB]/30 to-[#507C7C]/20 text-[#D4AF37]" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { sessions, loading: sessionsLoading } = useSessions();
  const user = useAuthStore((s) => s.user);
  const { orchestrating, runOrchestration } = useAgentStore();
  
  // Connect both stores for comprehensive study material display
  const decks = useStudyStore((s) => s.documents);
  const chatDocs = useChatStore((s) => s.documents);
  const allDocs = decks.length > 0 ? decks : chatDocs.map(d => ({
    document_id: d.id,
    title: d.title,
    subject: d.subject,
    flashcards: [],
  }));

  const totalDue = decks.reduce((n: number, d: any) => n + studyService.dueCards(d.flashcards ?? []).length, 0);
  const masteredCards = decks.reduce(
    (n: number, d: any) => n + (d.flashcards ?? []).filter((c: any) => c.repetitions >= 2 && c.interval >= 6).length,
    0
  );
  const avgScore = 88;

  return (
    <PageContainer>
      {/* ── Welcome Banner with Hunuko Mascot ───────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative mb-8 overflow-hidden rounded-3xl border border-[#96C4BB]/30 bg-gradient-to-r from-[#0E1715]/95 via-[#131F1C]/90 to-[#0E1715]/95 p-6 sm:p-8 backdrop-blur-2xl shadow-[0_0_35px_rgba(80,124,124,0.2)]"
      >
        {/* Ambient Radial Lights behind banner */}
        <div className="absolute -left-12 -top-12 h-64 w-64 rounded-full bg-[#507C7C]/20 blur-3xl -z-10 pointer-events-none" />
        <div className="absolute -right-12 -bottom-12 h-64 w-64 rounded-full bg-[#D4AF37]/15 blur-3xl -z-10 pointer-events-none" />

        <div className="grid items-center gap-6 lg:grid-cols-12">
          {/* Left Column: Greeting, Streak, & Upload CTA */}
          <div className="lg:col-span-8">
            <div className="flex flex-wrap items-center gap-2.5 mb-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#D4AF37]/50 bg-[#D4AF37]/15 px-3 py-1 text-xs font-bold text-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.25)]">
                <Flame className="h-3.5 w-3.5 fill-[#D4AF37]" /> 3 Day Study Streak
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#96C4BB]/30 bg-[#507C7C]/15 px-3 py-1 text-xs font-semibold text-[#96C4BB]">
                <Sparkles className="h-3.5 w-3.5 text-[#D4AF37]" /> Visual Intelligence Active
              </span>
            </div>

            <h1 className="font-display text-3xl font-bold tracking-tight text-[#F8FAFA] sm:text-4xl">
              Welcome back, {user?.name?.split(" ")[0] ?? "Learner"}
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#B2C9C5] sm:text-base">
              Your personalized study space is ready. Turn static lectures and reading notes into interactive visual explanations, flashcards, and graded oral exams.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button
                onClick={() => navigate("/app/upload")}
                className="bg-[#D4AF37] text-[#070B0A] hover:bg-[#e0be4d] font-bold shadow-[0_0_20px_rgba(212,175,55,0.3)] px-6 py-2.5 rounded-xl border-none cursor-pointer"
              >
                <Upload className="h-4 w-4 mr-2" /> Upload Notes
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/app/lab")}
                className="border-[#96C4BB]/35 text-[#F8FAFA] hover:bg-[#507C7C]/20 hover:border-[#96C4BB]/60 px-5 py-2.5 rounded-xl cursor-pointer"
              >
                <Play className="h-4 w-4 mr-2 text-[#96C4BB]" /> Open Visual Lab
              </Button>
            </div>
          </div>

          {/* Right Column: Floating Hunuko Mascot Avatar */}
          <div className="relative flex items-center justify-center lg:col-span-4">
            <div className="relative flex items-center justify-center">
              {/* Radial aura circles */}
              <div className="absolute h-44 w-44 rounded-full bg-[#507C7C]/25 blur-2xl animate-pulse" />
              <div className="absolute h-32 w-32 rounded-full bg-[#D4AF37]/20 blur-xl" />

              {/* Floating mascot image */}
              <motion.img
                src="/assets/mascot.jpg"
                alt="Hunuko Mascot"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10 h-44 w-44 rounded-3xl object-contain drop-shadow-[0_16px_35px_rgba(0,0,0,0.6)] border border-[#96C4BB]/30"
              />

              {/* Speech bubble indicator */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="absolute -bottom-2 -left-2 z-20 rounded-xl border border-[#96C4BB]/30 bg-[#111A18]/95 px-2.5 py-1 text-[11px] font-semibold text-[#96C4BB] shadow-lg backdrop-blur-md"
              >
                Ready to study! ✨
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Stats Grid ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatWidget icon={Layers} label="Study decks" numeric={allDocs.length} />
        <StatWidget icon={Clock} label="Cards due now" numeric={totalDue} />
        <StatWidget icon={Brain} label="Concepts mastered" numeric={masteredCards} />
        <StatWidget icon={TrendingUp} label="Avg. quiz score" numeric={avgScore} suffix="%" />
      </div>

      {/* ── Quick Actions ───────────────────────────────────────────── */}
      <div className="mt-8">
        <h2 className="mb-4 font-display text-lg font-semibold tracking-tight text-[#F8FAFA]">
          Quick actions
        </h2>
        <StaggerGroup className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {QUICK_ACTIONS.map((a) => (
            <StaggerItem key={a.label}>
              <Link to={a.to}>
                <motion.div
                  whileHover={{ y: -3, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative overflow-hidden rounded-2xl border border-[#96C4BB]/20 bg-[#0E1715]/85 p-5 backdrop-blur-xl transition-all duration-300 hover:border-[#96C4BB]/50 hover:shadow-[0_0_20px_rgba(80,124,124,0.22)]"
                >
                  <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${a.tone} border border-[#96C4BB]/20 shadow-md`}>
                    <a.icon className="h-5 w-5" />
                  </div>
                  <p className="font-medium text-[#F8FAFA] group-hover:text-white">{a.label}</p>
                  <ArrowRight className="absolute bottom-5 right-5 h-4 w-4 text-[#A3B8B5] transition-all group-hover:translate-x-1 group-hover:text-[#D4AF37]" />
                </motion.div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>

      {/* ── Main Content Grid: Study Decks & Side Panels ───────────── */}
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Left 2 Columns: Study Decks & Upload Dropzone */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Your Study Decks Section */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold tracking-tight text-[#F8FAFA]">
                Your study decks
              </h2>
              <Link to="/app/study" className="text-sm font-semibold text-[#D4AF37] hover:underline">
                View all ({allDocs.length})
              </Link>
            </div>

            {allDocs.length > 0 ? (
              <StaggerGroup className="grid gap-4 sm:grid-cols-2">
                {allDocs.slice(0, 4).map((d: any) => {
                  const due = studyService.dueCards(d.flashcards ?? []).length;
                  const count = (d.flashcards ?? []).length;
                  return (
                    <StaggerItem key={d.document_id}>
                      <Link to={`/app/study/${d.document_id}`}>
                        <motion.div
                          whileHover={{ y: -3 }}
                          className="group relative flex items-center gap-3 rounded-2xl border border-[#96C4BB]/20 bg-[#0E1715]/85 p-4 backdrop-blur-xl transition-all duration-300 hover:border-[#D4AF37]/50 hover:shadow-[0_0_20px_rgba(80,124,124,0.2)]"
                        >
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#507C7C]/20 text-[#96C4BB] border border-[#96C4BB]/30">
                            <Layers className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-semibold text-[#F8FAFA] group-hover:text-[#D4AF37] transition-colors">
                              {d.title}
                            </p>
                            <p className="text-xs text-[#A3B8B5]">
                              {count > 0 ? `${count} flashcards` : "Study set ready"}
                            </p>
                          </div>
                          {due > 0 ? (
                            <span className="shrink-0 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 px-2 py-0.5 text-xs font-bold text-[#D4AF37]">
                              {due} due
                            </span>
                          ) : (
                            <ArrowRight className="h-4 w-4 shrink-0 text-[#A3B8B5] transition-all group-hover:translate-x-1 group-hover:text-[#D4AF37]" />
                          )}
                        </motion.div>
                      </Link>
                    </StaggerItem>
                  );
                })}
              </StaggerGroup>
            ) : (
              <EmptyState
                title="No study decks yet"
                description="Upload notes or slide decks to automatically generate visual flashcards and practice quizzes."
                speech="Ready when you are! Upload lecture notes to get started."
                action={
                  <Button onClick={() => navigate("/app/upload")} className="bg-[#D4AF37] text-[#070B0A] font-bold">
                    <Plus className="h-4 w-4 mr-1.5" /> Create a set
                  </Button>
                }
              />
            )}
          </div>

          {/* Re-skinned Upload Dropzone */}
          <div
            onClick={() => navigate("/app/upload")}
            className="group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#96C4BB]/40 bg-[#0E1715]/40 p-8 text-center transition-all duration-300 hover:border-[#D4AF37] hover:bg-[#111A18]/60 cursor-pointer shadow-lg"
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#507C7C]/20 text-[#96C4BB] border border-[#96C4BB]/30 transition-transform duration-300 group-hover:scale-110 group-hover:text-[#D4AF37] group-hover:border-[#D4AF37]/40">
              <Upload className="h-6 w-6" />
            </div>
            <h3 className="font-display font-semibold text-base text-[#F8FAFA] group-hover:text-[#D4AF37] transition-colors">
              Drop lecture notes or syllabus to create a new deck
            </h3>
            <p className="mt-1 text-xs text-[#A3B8B5] max-w-md">
              Supports PDFs up to 50MB. Hunuko reads your document and generates scene animations, flashcards, and quizzes.
            </p>
          </div>

          {/* Continue learning (Recent Sessions) */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold tracking-tight text-[#F8FAFA]">
                Continue learning
              </h2>
              <Link to="/app/lab" className="text-sm font-semibold text-[#D4AF37] hover:underline">
                Open Lab
              </Link>
            </div>
            {sessionsLoading ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} className="h-40" />
                ))}
              </div>
            ) : sessions.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {sessions.slice(0, 4).map((s: any) => (
                  <SessionCard key={s.id} session={s} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-[#96C4BB]/15 bg-[#0E1715]/60 p-6 text-center text-xs text-[#A3B8B5]">
                No recent study sessions yet. Start by exploring a concept in the Visual Lab!
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Due For Review & Multi-Agent Orchestrator */}
        <div className="space-y-6">
          {/* Due for review panel */}
          <Card>
            <CardHeader className="pb-3 border-b border-[#96C4BB]/10">
              <CardTitle className="flex items-center gap-2 text-base text-[#F8FAFA]">
                <Brain className="h-5 w-5 text-[#D4AF37]" /> Due for review
              </CardTitle>
            </CardHeader>
            <CardBody className="pt-4">
              {totalDue > 0 ? (
                <>
                  <p className="text-xs text-[#B2C9C5] leading-relaxed">
                    You have <span className="font-bold text-[#D4AF37]">{totalDue}</span>{" "}
                    {totalDue === 1 ? "card" : "cards"} ready for spaced-repetition review.
                  </p>
                  <div className="mt-3 space-y-2">
                    {decks
                      .filter((d: any) => studyService.dueCards(d.flashcards ?? []).length > 0)
                      .slice(0, 3)
                      .map((d: any) => (
                        <Link
                          key={d.document_id}
                          to={`/app/study/${d.document_id}/review`}
                          className="flex items-center justify-between rounded-xl bg-[#111A18] border border-[#96C4BB]/15 px-3 py-2.5 text-xs transition-all hover:border-[#D4AF37]/40 hover:bg-[#152220]"
                        >
                          <span className="truncate text-[#F8FAFA] font-medium">{d.title}</span>
                          <span className="shrink-0 font-bold text-[#D4AF37] bg-[#D4AF37]/15 px-2 py-0.5 rounded-full border border-[#D4AF37]/30">
                            {studyService.dueCards(d.flashcards ?? []).length}
                          </span>
                        </Link>
                      ))}
                  </div>
                  <Link to="/app/study">
                    <Button className="mt-4 w-full bg-[#D4AF37] text-[#070B0A] font-bold" size="sm">
                      Go to review stage
                    </Button>
                  </Link>
                </>
              ) : (
                <div className="text-center py-4">
                  <span className="inline-block p-2 rounded-full bg-[#507C7C]/20 text-[#96C4BB] mb-2">
                    <Sparkles className="h-5 w-5" />
                  </span>
                  <p className="text-xs text-[#B2C9C5]">
                    All caught up! No flashcards due for recall review today.
                  </p>
                </div>
              )}
            </CardBody>
          </Card>

          {/* AI Orchestration Panel */}
          <Card className="relative overflow-hidden">
            <CardBody className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-display font-semibold tracking-tight text-[#F8FAFA]">Multi-Agent Hub</h4>
                <Badge tone="teal">Active</Badge>
              </div>
              <p className="text-xs text-[#B2C9C5] leading-relaxed">
                Autonomous agents coordinate your syllabus summaries, concept visual scripts, and adaptive tutoring in real time.
              </p>
              <Button
                className="mt-4 w-full"
                size="sm"
                variant="secondary"
                onClick={runOrchestration}
                loading={orchestrating}
              >
                Sync Study Engine
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
