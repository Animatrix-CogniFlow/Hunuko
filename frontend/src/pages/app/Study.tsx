import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Plus,
  Layers,
  Brain,
  Trash2,
  Clock,
  Loader2,
} from "lucide-react";
import { PageContainer } from "../../components/shell/PageContainer";
import { SpotlightCard } from "../../components/ui/SpotlightCard";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { EmptyState } from "../../components/ui/EmptyState";
import { StaggerGroup, StaggerItem } from "../../components/ui/Motion";
import { useStudyStore } from "../../stores/useStudyStore";
import { useChatStore } from "../../stores/useChatStore";
import { studyService } from "../../services/studyService";

export default function Study() {
  const navigate = useNavigate();
  const documents = useChatStore((s) => s.documents);
  const docsLoading = useChatStore((s) => s.documentsLoading);
  const loadDocuments = useChatStore((s) => s.loadDocuments);

  const addDocument = useStudyStore((s) => s.addDocument);
  const removeDocument = useStudyStore((s) => s.removeDocument);
  const getDocument = useStudyStore((s) => s.getDocument);

  const [confirmId, setConfirmId] = useState<string | null>(null);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  useEffect(() => {
    documents.forEach((doc) => {
      if (!getDocument(doc.id)) {
        addDocument({
          document_id: doc.id,
          title: doc.title,
          subject: doc.subject,
        });
      }
    });
  }, [documents, addDocument, getDocument]);

  return (
    <PageContainer>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-[#F8FAFA]">Study Decks</h1>
          <p className="mt-1 text-sm text-[#B2C9C5]">
            Create flashcard sets and practice quizzes from your study notes. Review them regularly to lock them in memory.
          </p>
        </div>
        <Button onClick={() => navigate("/app/upload")} className="bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] text-[#070B0A] font-bold hover:brightness-110 shadow-lg shadow-[#D4AF37]/25 border-none">
          <Plus className="h-4 w-4" /> New deck
        </Button>
      </div>

      {docsLoading ? (
        <div className="flex h-60 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
        </div>
      ) : documents.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No study sets yet"
          description="Create your first set of flashcards and quiz questions by uploading your study notes."
          action={
            <Button onClick={() => navigate("/app/upload")} className="bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] text-[#070B0A] font-bold hover:brightness-110 shadow-lg shadow-[#D4AF37]/25 border-none">
              <Plus className="h-4 w-4" /> Create a set
            </Button>
          }
        />
      ) : (
        <StaggerGroup className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => {
            const studyData = getDocument(doc.id);
            const cards = studyData?.flashcards ?? [];
            const due = studyService.dueCards(cards).length;
            const mastery = studyService.deckMastery({ cards } as any);

            return (
              <StaggerItem key={doc.id}>
                <motion.div whileHover={{ y: -4 }}>
                  <SpotlightCard className="flex h-full flex-col p-5 bg-[#0E1715]/85 border-[#96C4BB]/20 backdrop-blur-xl shadow-xl hover:border-[#96C4BB]/50 transition-all">
                    <div className="flex items-start justify-between">
                      <Badge tone="neutral" className="bg-[#507C7C]/20 text-[#96C4BB] border-[#96C4BB]/30">{doc.subject}</Badge>
                      <div className="flex items-center gap-2">
                        {due > 0 && (
                          <Badge tone="warning" className="bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/30 font-semibold">
                            <Clock className="h-3 w-3" /> {due} due
                          </Badge>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmId(doc.id);
                          }}
                          aria-label="Delete deck"
                          className="rounded-md p-1.5 text-[#B2C9C5] transition hover:bg-rose-500/20 hover:text-rose-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <h3 className="mt-3 font-display text-lg font-semibold tracking-tight text-[#F8FAFA]">
                      {doc.title}
                    </h3>
                    <div className="mt-1 flex items-center gap-3 text-xs text-[#96C4BB]">
                      <span className="inline-flex items-center gap-1">
                        <Brain className="h-3 w-3" /> {cards.length} cards
                      </span>
                    </div>

                    {/* Mastery bar */}
                    <div className="mt-4">
                      <div className="mb-1.5 flex items-center justify-between text-xs">
                        <span className="text-[#B2C9C5]">Mastery</span>
                        <span className="font-semibold text-[#F8FAFA]">{mastery}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-[#111A18] border border-[#96C4BB]/15">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${mastery}%` }}
                          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                          className="h-full rounded-full bg-gradient-to-r from-[#507C7C] via-[#96C4BB] to-[#D4AF37]"
                        />
                      </div>
                    </div>

                    <div className="mt-auto flex gap-2 pt-5">
                      <Button
                        size="sm"
                        className="flex-1 bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] text-[#070B0A] font-bold border-none hover:brightness-110 shadow-md shadow-[#D4AF37]/20"
                        onClick={() => navigate(`/app/study/${doc.id}/review`)}
                        disabled={cards.length === 0}
                      >
                        <Brain className="h-4 w-4" /> Review
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="flex-1 bg-[#111A18] text-[#F8FAFA] border-[#96C4BB]/25 hover:border-[#D4AF37]"
                        onClick={() => navigate(`/app/study/${doc.id}`)}
                      >
                        Open
                      </Button>
                    </div>
                  </SpotlightCard>
                </motion.div>
              </StaggerItem>
            );
          })}
        </StaggerGroup>
      )}

      {/* Delete confirm */}
      <Modal open={!!confirmId} onClose={() => setConfirmId(null)} title="Clear local progress?">
        <p className="text-sm text-silver-600 dark:text-silver-600">
          This will reset the spaced repetition metrics for this study set. Your uploaded document on the backend will not be deleted.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setConfirmId(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              if (confirmId) removeDocument(confirmId);
              setConfirmId(null);
            }}
          >
            <Trash2 className="h-4 w-4" /> Clear
          </Button>
        </div>
      </Modal>
    </PageContainer>
  );
}
