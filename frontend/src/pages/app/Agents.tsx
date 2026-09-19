import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookText,
  GraduationCap,
  Image as ImageIcon,
  Film,
  ClipboardCheck,
  Scissors,
  MessageSquareHeart,
  Play,
} from "lucide-react";
import type { AgentId } from "../../lib/types";
import { PageContainer } from "../../components/shell/PageContainer";
import { Button } from "../../components/ui/Button";
import { Card, CardBody } from "../../components/ui/Card";
import { AmbientBackground } from "../../components/visuals/AmbientBackground";
import { useAgentStore } from "../../stores/useAgentStore";
import { cn } from "../../lib/utils";

const ICONS: Record<AgentId, typeof BookText> = {
  story: BookText,
  tutor: GraduationCap,
  visual: ImageIcon,
  motion: Film,
  examiner: ClipboardCheck,
  editor: Scissors,
  feedback: MessageSquareHeart,
};

// Node positions on a 100x100 viewBox for the orchestration graph
const POSITIONS: Record<AgentId, { x: number; y: number }> = {
  story: { x: 50, y: 12 },
  tutor: { x: 80, y: 32 },
  visual: { x: 84, y: 66 },
  motion: { x: 58, y: 86 },
  editor: { x: 28, y: 84 },
  examiner: { x: 14, y: 52 },
  feedback: { x: 26, y: 22 },
};

const EDGES: [AgentId, AgentId][] = [
  ["story", "tutor"],
  ["tutor", "visual"],
  ["visual", "motion"],
  ["motion", "editor"],
  ["editor", "examiner"],
  ["examiner", "feedback"],
  ["feedback", "story"],
];

export default function Agents() {
  const { agents, load, runOrchestration, orchestrating } = useAgentStore();
  const [selected, setSelected] = useState<AgentId | null>(null);

  useEffect(() => {
    load();
  }, [load]);

  const activeAgent = agents.find((a) => a.id === selected);

  return (
    <PageContainer wide>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-[#F8FAFA]">
            Study Assistants Hub
          </h1>
          <p className="mt-1 text-sm text-[#B2C9C5]">
            Meet the AI helpers that prepare your flashcards, generate quizzes, and coordinate your learning path.
          </p>
        </div>
        <Button onClick={runOrchestration} loading={orchestrating} className="bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] text-[#070B0A] font-bold hover:brightness-110 shadow-lg shadow-[#D4AF37]/25 border-none">
          <Play className="h-4 w-4" /> {orchestrating ? "Processing…" : "Update materials"}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Graph */}
        <div className="lg:col-span-2">
          <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-[#96C4BB]/25 bg-[#070B0A]/95 shadow-2xl backdrop-blur-xl sm:aspect-[4/3]">
            <AmbientBackground variant="hero" particles={false} />
            <div className="absolute inset-0 cf-grid-bg opacity-20" />
            <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet">
              {EDGES.map(([from, to], i) => {
                const a = POSITIONS[from];
                const b = POSITIONS[to];
                const fromActive =
                  agents.find((x) => x.id === from)?.status === "complete";
                const toActive = agents.find((x) => x.id === to)?.status === "active";
                const live = fromActive && toActive;
                return (
                  <g key={i}>
                    <line
                      x1={a.x}
                      y1={a.y}
                      x2={b.x}
                      y2={b.y}
                      stroke={live ? "#D4AF37" : "rgba(150,196,187,0.18)"}
                      strokeWidth={live ? 0.8 : 0.4}
                    />
                    {live && (
                      <motion.circle
                        r={1.2}
                        fill="#D4AF37"
                        initial={{ cx: a.x, cy: a.y }}
                        animate={{ cx: b.x, cy: b.y }}
                        transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
                      />
                    )}
                  </g>
                );
              })}
            </svg>

            {agents.map((agent) => {
              const pos = POSITIONS[agent.id];
              const Icon = ICONS[agent.id];
              return (
                <motion.button
                  key={agent.id}
                  onClick={() => setSelected((s) => (s === agent.id ? null : agent.id))}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 focus:outline-none"
                  style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                  animate={
                    agent.status === "active"
                      ? { scale: [1, 1.12, 1] }
                      : { scale: 1 }
                  }
                  transition={{ duration: 1.2, repeat: agent.status === "active" ? Infinity : 0 }}
                  aria-label={`${agent.name}: ${agent.role}`}
                >
                  <div className="flex flex-col items-center gap-1.5">
                    <div
                      className={cn(
                        "relative flex h-11 w-11 items-center justify-center rounded-xl border transition-all sm:h-14 sm:w-14 backdrop-blur-md shadow-lg",
                        selected === agent.id && "ring-2 ring-[#D4AF37] ring-offset-2 ring-offset-[#070B0A]",
                        agent.status === "active"
                          ? "border-[#D4AF37] bg-gradient-to-tr from-[#D4AF37] to-[#F59E0B] text-[#070B0A] shadow-[0_0_24px_rgba(212,175,55,0.6)] font-bold"
                          : agent.status === "complete"
                          ? "border-[#96C4BB]/50 bg-[#507C7C]/30 text-[#96C4BB]"
                          : "border-[#96C4BB]/20 bg-[#111A18]/80 text-[#B2C9C5] hover:border-[#D4AF37]/50"
                      )}
                    >
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                      {agent.status === "active" && (
                        <motion.span
                          className="absolute inset-0 rounded-xl border border-[#D4AF37]"
                          animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
                          transition={{ duration: 1.4, repeat: Infinity }}
                        />
                      )}
                    </div>
                    <span className="hidden text-[10px] font-medium text-[#B2C9C5] sm:block">
                      {agent.name.replace(" Agent", "")}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Selected agent detail */}
          <AnimatePresence>
            {activeAgent && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                className="mt-4 flex items-center gap-3 rounded-2xl border border-[#96C4BB]/25 bg-[#0E1715]/90 p-4 backdrop-blur-xl shadow-xl"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#D4AF37]/20 text-[#D4AF37] ring-1 ring-[#D4AF37]/30">
                  {(() => {
                    const I = ICONS[activeAgent.id];
                    return <I className="h-5 w-5" />;
                  })()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-display font-semibold tracking-tight text-[#F8FAFA]">{activeAgent.name}</p>
                  <p className="text-sm text-[#B2C9C5]">{activeAgent.role}</p>
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">{activeAgent.status}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Agent list */}
        <div className="space-y-3">
          {agents.map((agent) => {
            const Icon = ICONS[agent.id];
            return (
              <Card
                key={agent.id}
                interactive
                onClick={() => setSelected((s) => (s === agent.id ? null : agent.id))}
                className={cn(
                  "cursor-pointer bg-[#0E1715]/85 border-[#96C4BB]/20 backdrop-blur-xl shadow-md transition-all hover:border-[#96C4BB]/50",
                  selected === agent.id && "border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.25)]"
                )}
              >
                <CardBody className="flex items-center gap-3 p-4">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl",
                      agent.status === "active"
                        ? "bg-gradient-to-tr from-[#D4AF37] to-[#F59E0B] text-[#070B0A] shadow-md shadow-[#D4AF37]/30 font-bold"
                        : agent.status === "complete"
                        ? "bg-[#507C7C]/30 text-[#96C4BB] ring-1 ring-[#96C4BB]/30"
                        : "bg-[#111A18] text-[#B2C9C5] border border-[#96C4BB]/20"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[#F8FAFA]">{agent.name}</p>
                    <p className="truncate text-xs text-[#B2C9C5]">{agent.role}</p>
                  </div>
                  <span
                    className={cn(
                      "text-xs font-medium capitalize",
                      agent.status === "active"
                        ? "text-[#D4AF37] font-semibold"
                        : agent.status === "complete"
                        ? "text-[#96C4BB]"
                        : "text-[#B2C9C5]"
                    )}
                  >
                    {agent.status}
                  </span>
                </CardBody>
              </Card>
            );
          })}
        </div>
      </div>
    </PageContainer>
  );
}
