import { useState, useEffect } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, X, Trophy, RotateCcw, Loader2 } from "lucide-react";
import { PageContainer } from "../../components/shell/PageContainer";
import { Card, CardBody } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { useStudyStore } from "../../stores/useStudyStore";
import { studyService } from "../../services/studyService";
import { cn } from "../../lib/utils";
import { MarkdownLite } from "../../components/tutor/MarkdownLite";

interface LocalQuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export default function Quiz() {
  const { deckId } = useParams();
  const id = deckId || "";
  const navigate = useNavigate();
  const deck = useStudyStore((s) => s.documents.find((d) => d.document_id === id));

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quizId, setQuizId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<LocalQuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [result, setResult] = useState<{ score: number; correct: number; total: number } | null>(null);

  useEffect(() => {
    if (!id) return;

    async function loadQuiz() {
      setLoading(true);
      setError(null);
      try {
        const response = await studyService.generateQuiz(id);
        setQuizId(response.quiz_id);
        
        // Map backend format to local QuizQuestion format
        const mapped = response.questions.map((q: any, idx: number) => {
          const keys = ["A", "B", "C", "D"];
          return {
            id: String(idx),
            prompt: q.question,
            options: keys.map((k) => q.options[k]),
            answerIndex: keys.indexOf(q.correct_answer),
            explanation: q.explanation,
          };
        });
        setQuestions(mapped);
      } catch (err: any) {
        setError(err.message || "Failed to load quiz. Please make sure the document is ready.");
      } finally {
        setLoading(false);
      }
    }

    loadQuiz();
  }, [id]);

  if (!deckId) return <Navigate to="/app/study" replace />;
  if (!deck) return <Navigate to="/app/study" replace />;

  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === questions.length;

  function select(qId: string, optIdx: number) {
    if (submitted) return;
    setAnswers((a) => ({ ...a, [qId]: optIdx }));
  }

  async function submit() {
    if (!quizId || submitting) return;
    setSubmitting(true);
    try {
      // Map local answers to backend format: { "0": "A", "1": "C", ... }
      const keys = ["A", "B", "C", "D"];
      const formattedAnswers: Record<string, string> = {};
      Object.entries(answers).forEach(([qId, optIdx]) => {
        formattedAnswers[qId] = keys[optIdx];
      });

      const res = await studyService.submitQuiz(quizId, formattedAnswers);
      setResult({
        score: res.percentage,
        correct: res.score,
        total: res.total,
      });
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      alert(err.message || "Failed to submit answers.");
    } finally {
      setSubmitting(false);
    }
  }

  function retry() {
    setAnswers({});
    setSubmitted(false);
    setResult(null);
    // Reload a fresh quiz from backend
    navigate(0);
  }

  return (
    <PageContainer>
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate(`/app/study/${deck.document_id}`)}
          className="inline-flex items-center gap-1.5 text-sm text-silver-600 transition hover:text-gold-600 dark:text-silver-600"
        >
          <ArrowLeft className="h-4 w-4" /> {deck.title}
        </button>
        {!submitted && !loading && (
          <Badge tone="neutral">
            {answeredCount} / {questions.length} answered
          </Badge>
        )}
      </div>

      {loading ? (
        <div className="flex h-60 flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gold-500" />
          <p className="mt-4 text-sm text-silver-600">Generating fresh quiz questions...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-rose-500 font-medium">
          {error}
        </div>
      ) : (
        <>
          {/* Result banner with Celebratory Mascot State */}
          <AnimatePresence>
            {submitted && result && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="mb-8"
              >
                <Card className="border border-[#96C4BB]/30 bg-gradient-to-r from-[#0E1715] via-[#131F1C] to-[#0E1715] p-6 backdrop-blur-2xl shadow-[0_0_35px_rgba(80,124,124,0.25)]">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                      {/* Celebratory Mascot Avatar */}
                      <div className="relative flex shrink-0 items-center justify-center">
                        <div className="absolute h-24 w-24 rounded-full bg-[#D4AF37]/20 blur-xl animate-pulse" />
                        <motion.img
                          src="/assets/mascot.jpg"
                          alt="Hunuko Mascot"
                          animate={{ y: [0, -6, 0], rotate: [0, 2, -2, 0] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                          className="relative z-10 h-20 w-20 rounded-2xl object-contain border-2 border-[#D4AF37]/70 shadow-lg"
                        />
                        <span className="absolute -top-1 -right-1 text-xl animate-bounce">🏆</span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border",
                              result.score >= 70
                                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                                : result.score >= 40
                                ? "bg-[#D4AF37]/15 border-[#D4AF37]/30 text-[#D4AF37]"
                                : "bg-rose-500/15 border-rose-500/30 text-rose-400"
                            )}
                          >
                            Score: {result.score}%
                          </span>
                          <span className="text-xs text-[#A3B8B5]">
                            {result.correct} of {result.total} questions correct
                          </span>
                        </div>
                        <h2 className="font-display text-2xl font-bold tracking-tight text-[#F8FAFA] mt-1">
                          {result.score >= 70 ? "Mastery Demonstrated!" : result.score >= 40 ? "Solid Progress, Keep Going!" : "Review Concepts and Retry"}
                        </h2>
                        <p className="text-xs text-[#B2C9C5] mt-0.5">
                          {result.score >= 70 ? "Your conceptual model is strong across these key topics." : "Targeted flashcard review will solidify these terms."}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2.5 shrink-0">
                      <Button variant="secondary" onClick={retry} className="border-[#96C4BB]/30 text-[#F8FAFA] hover:bg-[#507C7C]/20 cursor-pointer">
                        <RotateCcw className="h-4 w-4 mr-1" /> Retry
                      </Button>
                      <Button
                        onClick={() => navigate(`/app/study/${deck.document_id}/review`)}
                        className="bg-[#D4AF37] text-[#070B0A] hover:bg-[#e0be4d] font-bold shadow-lg shadow-[#D4AF37]/20 border-none cursor-pointer"
                      >
                        <Trophy className="h-4 w-4 mr-1" /> Review cards
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Questions */}
          <div className="space-y-5">
            {questions.map((q, qi) => {
              const selected = answers[q.id];
              return (
                <Card key={q.id} className="border-[#96C4BB]/20 bg-[#0E1715]/85 backdrop-blur-xl">
                  <CardBody className="p-6">
                    <div className="font-display font-semibold tracking-tight flex items-start gap-2 text-[#F8FAFA] text-base">
                      <span className="text-[#D4AF37] font-mono">{qi + 1}.</span>
                      <div className="flex-1 text-left leading-relaxed">
                        <MarkdownLite text={q.prompt} />
                      </div>
                    </div>
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      {q.options.map((opt, oi) => {
                        const isSelected = selected === oi;
                        const isCorrect = oi === q.answerIndex;
                        const showState = submitted;
                        return (
                          <motion.button
                            key={opt}
                            whileTap={submitted ? {} : { scale: 0.98 }}
                            whileHover={submitted ? {} : { y: -1 }}
                            onClick={() => select(q.id, oi)}
                            disabled={submitted}
                            className={cn(
                              "flex items-center justify-between gap-3 rounded-2xl border px-4 py-3.5 text-left text-sm transition-all duration-200 cursor-pointer",
                              !showState &&
                                (isSelected
                                  ? "border-2 border-[#D4AF37] bg-[#D4AF37]/20 text-white shadow-[0_0_15px_rgba(212,175,55,0.3)] font-semibold"
                                  : "border-[#96C4BB]/20 bg-[#111A18]/70 text-[#F8FAFA] hover:border-[#96C4BB]/60 hover:bg-[#507C7C]/15 hover:shadow-[0_0_15px_rgba(150,196,187,0.2)]"),
                              showState &&
                                isCorrect &&
                                "border-2 border-[#96C4BB] bg-[#507C7C]/30 text-[#F8FAFA] shadow-[0_0_20px_rgba(150,196,187,0.4)] font-semibold",
                              showState &&
                                isSelected &&
                                !isCorrect &&
                                "border-2 border-rose-500/70 bg-rose-500/20 text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.3)]",
                              showState && !isCorrect && !isSelected && "border-[#96C4BB]/10 bg-[#111A18]/40 opacity-50 text-[#A3B8B5]"
                            )}
                          >
                            <span className="flex-1 text-left leading-snug"><MarkdownLite text={opt} /></span>
                            {showState && isCorrect && <Check className="h-4 w-4 shrink-0 text-[#96C4BB]" />}
                            {showState && isSelected && !isCorrect && <X className="h-4 w-4 shrink-0 text-rose-400" />}
                          </motion.button>
                        );
                      })}
                    </div>

                    {submitted && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-4 rounded-xl bg-[#111A18] border border-[#96C4BB]/20 px-4 py-3 text-xs text-[#B2C9C5] text-left leading-relaxed"
                      >
                        <span className="font-bold text-[#D4AF37] block mb-1">Explanation:</span>
                        <MarkdownLite text={q.explanation} />
                      </motion.div>
                    )}
                  </CardBody>
                </Card>
              );
            })}
          </div>

          {!submitted && (
            <div className="sticky bottom-4 mt-8 flex justify-center z-20">
              <Button
                size="lg"
                onClick={submit}
                loading={submitting}
                disabled={!allAnswered}
                className="bg-[#D4AF37] text-[#070B0A] hover:bg-[#e0be4d] font-bold shadow-[0_0_25px_rgba(212,175,55,0.35)] px-8 py-3 rounded-2xl border-none cursor-pointer"
              >
                {allAnswered ? "Submit quiz for grading" : `Answer all ${questions.length} questions`}
              </Button>
            </div>
          )}
        </>
      )}
    </PageContainer>
  );
}
