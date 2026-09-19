import { useRef, useState, type DragEvent } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  Loader2,
  Brain,
  Video,
  ArrowRight,
} from "lucide-react";
import { PageContainer } from "../../components/shell/PageContainer";
import { Card, CardBody } from "../../components/ui/Card";
import { SpotlightCard } from "../../components/ui/SpotlightCard";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Input } from "../../components/ui/Input";
import { contentService, type UploadResult } from "../../services/contentService";
import { formatBytes, cn } from "../../lib/utils";
import { useChatStore } from "../../stores/useChatStore";

const PIPELINE = ["Uploading", "Reading document", "Finding key topics", "Creating study materials"];

export default function Upload() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const selectDocument = useChatStore((s) => s.selectDocument);

  // Clean, focused state
  const [dragging, setDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  
  // Processing state
  const [processing, setProcessing] = useState(false);
  const [stage, setStage] = useState("");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState("");

  function handleFileSelection(file: File) {
    setError("");
    
    // Validate file type (PDF only)
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Only PDF files are accepted.");
      setSelectedFile(null);
      return;
    }

    // Validate file size (Max 50MB)
    const MAX_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setError(`File is too large. Maximum allowed size is 50MB. Your file is ${Math.round(file.size / (1024 * 1024) * 10) / 10}MB.`);
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    // Auto-fill the title from the file name, removing the extension
    if (!title) setTitle(file.name.replace(/\.[^.]+$/, ""));
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelection(file);
  }

  async function generate() {
    if (!selectedFile) return;
    
    setProcessing(true);
    setResult(null);
    setError("");
    setStage(PIPELINE[0]);
    setProgress(0);

    try {
      const generator = contentService.uploadDocument(selectedFile, "en");
      let finalResult: UploadResult | null = null;
      
      // We use a while loop here to capture the final 'return' value of the generator,
      // while updating the UI with the 'yield' progress events.
      while (true) {
        const current = await generator.next();
        if (current.done) {
          finalResult = current.value as UploadResult;
          break;
        }
        setStage(current.value.stage);
        setProgress(current.value.progress);
      }

      setResult(finalResult);
      setProgress(100);
      setStage("Done");
    } catch (err: any) {
      setError(err.message || "Failed to upload document. Please try again.");
    } finally {
      setProcessing(false);
    }
  }

  function resetAll() {
    setSelectedFile(null);
    setTitle("");
    setSubject("");
    setResult(null);
    setProgress(0);
    setStage("");
    setError("");
  }

  return (
    <PageContainer>
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="font-display text-3xl font-semibold tracking-tight text-[#F8FAFA]">
          Add Learning Material
        </h1>
        <p className="mt-2 text-[#B2C9C5]">
          Upload your notes, slides, or textbook chapters (PDF) to start learning. Hunuko will read the file, summarize the core topics, and create your personalized study space.
        </p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          
          {/* MASSIVE DROPZONE */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={!processing ? { scale: 1.01 } : {}}
            onDragOver={(e) => {
              e.preventDefault();
              if (!processing) setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={processing ? undefined : onDrop}
            className={cn(
              "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-20 text-center transition-all duration-300 cursor-pointer",
              "border-[#96C4BB]/40 hover:border-[#D4AF37] hover:bg-[#111A18]/60 bg-[#0E1715]/40 backdrop-blur-xl shadow-xl",
              dragging && "border-[#D4AF37] bg-[#D4AF37]/10 shadow-[0_0_30px_rgba(212,175,55,0.25)]",
              processing && "opacity-60 cursor-not-allowed",
              selectedFile && !dragging && "border-[#96C4BB]/70 bg-[#507C7C]/15 shadow-[0_0_25px_rgba(150,196,187,0.2)]"
            )}
            onClick={() => !processing && inputRef.current?.click()}
          >
            <motion.div
              animate={{ y: dragging ? -8 : 0 }}
              className={cn(
                "mb-5 flex h-20 w-20 items-center justify-center rounded-2xl transition-colors shadow-inner",
                selectedFile ? "bg-[#507C7C]/30 text-[#96C4BB] ring-1 ring-[#96C4BB]/40" : "bg-[#D4AF37]/20 text-[#D4AF37] ring-1 ring-[#D4AF37]/30"
              )}
            >
              {selectedFile ? <FileText className="h-10 w-10" /> : <UploadCloud className="h-10 w-10" />}
            </motion.div>
            
            <h3 className="font-display text-xl font-semibold tracking-tight text-[#F8FAFA]">
              {selectedFile ? "File Ready" : "Drag & Drop your document here"}
            </h3>
            <p className="mt-2 text-sm text-[#B2C9C5]">
              Supports PDF (Max 50MB)
            </p>
            
            <Button 
              className="mt-6 bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] text-[#070B0A] font-bold shadow-lg shadow-[#D4AF37]/25 hover:brightness-110 border-none" 
              onClick={(e) => {
                e.stopPropagation();
                inputRef.current?.click();
              }}
              disabled={processing}
            >
              {selectedFile ? "Change File" : "Browse files"}
            </Button>
            
            <input
              ref={inputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileSelection(e.target.files[0])}
            />

            {selectedFile && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-4 flex items-center gap-3 rounded-full border border-[#96C4BB]/30 bg-[#0E1715]/95 px-5 py-2 shadow-lg backdrop-blur-md"
              >
                <span className="text-sm font-medium text-[#F8FAFA] truncate max-w-[200px]">
                  {selectedFile.name}
                </span>
                <span className="text-xs text-[#96C4BB] font-mono">
                  {formatBytes(selectedFile.size)}
                </span>
              </motion.div>
            )}
          </motion.div>

          {/* METADATA INPUTS */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Input 
              label="Document Title" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="e.g. Applied Geophysics Chap 1" 
              disabled={processing}
            />
            <Input 
              label="Subject / Category" 
              value={subject} 
              onChange={(e) => setSubject(e.target.value)} 
              placeholder="e.g. Earth Sciences" 
              disabled={processing}
            />
          </div>

          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-400 font-medium">
              {error}
            </motion.p>
          )}

          <div className="flex items-center justify-between border-t border-[#96C4BB]/15 pt-6">
            <Button variant="ghost" onClick={resetAll} disabled={processing || !selectedFile} className="text-[#B2C9C5] hover:text-[#F8FAFA]">
              Clear
            </Button>
            <Button 
              onClick={generate} 
              loading={processing} 
              disabled={!selectedFile || !title.trim()}
              className="bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] text-[#070B0A] font-bold hover:brightness-110 shadow-lg shadow-[#D4AF37]/20 border-none px-6"
            >
              <Brain className="h-4 w-4 mr-2" /> 
              {processing ? stage || "Reading file..." : "Start Processing"}
            </Button>
          </div>

          {/* SUCCESS RESULT */}
          <AnimatePresence>
            {result && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <SpotlightCard className="p-6 border-[#96C4BB]/40 bg-[#0E1715]/90 backdrop-blur-xl shadow-2xl" tilt={false}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#507C7C]/30 text-[#96C4BB] ring-1 ring-[#96C4BB]/30">
                      <CheckCircle2 className="h-6 w-6 text-[#96C4BB]" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-semibold tracking-tight text-[#F8FAFA]">Material Added!</h3>
                      <p className="text-sm text-[#B2C9C5]">
                        {result.title} has been successfully loaded.
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <Stat icon={Brain} label="Topics Identified" value={result.total_concepts} />
                    <Stat icon={FileText} label="Language" valueText={result.language_code.toUpperCase()} />
                  </div>
                  
                  <div className="mt-6 flex flex-wrap gap-3 border-t border-[#96C4BB]/20 pt-6">
                    <Button 
                      onClick={() => {
                        selectDocument(result.document_id);
                        navigate("/app/lab");
                      }} 
                      className="bg-gradient-to-r from-[#507C7C] to-[#96C4BB] hover:brightness-110 text-[#070B0A] font-bold border-none"
                    >
                      <Video className="h-4 w-4 mr-2" /> Enter Visual Lab
                    </Button>
                    <Button 
                      variant="secondary" 
                      onClick={() => {
                        selectDocument(result.document_id);
                        navigate("/app/study");
                      }}
                      className="bg-[#111A18] text-[#F8FAFA] border-[#96C4BB]/30 hover:border-[#D4AF37]"
                    >
                      <ArrowRight className="h-4 w-4 mr-2" /> Continue to Dashboard
                    </Button>
                  </div>
                </SpotlightCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* PIPELINE SIDEBAR */}
        <div>
          <Card className="sticky top-6 bg-[#0E1715]/85 border-[#96C4BB]/20 backdrop-blur-xl shadow-xl">
            <CardBody>
              <h3 className="mb-5 font-display text-lg font-semibold tracking-tight text-[#F8FAFA]">Progress Tracker</h3>
              <div className="space-y-3">
                {PIPELINE.map((p, i) => {
                  const activeIdx = PIPELINE.indexOf(stage);
                  const status =
                    result || (!processing && progress === 100)
                      ? "done"
                      : processing && activeIdx === i
                      ? "active"
                      : processing && activeIdx > i
                      ? "done"
                      : "idle";
                  
                  return (
                    <motion.div 
                      key={p} 
                      className="flex items-center gap-4 py-1"
                      animate={{ opacity: status === "idle" ? 0.5 : 1 }}
                    >
                      <span
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors duration-500",
                          status === "done" ? "bg-[#507C7C] text-white shadow-lg shadow-[#507C7C]/30 ring-1 ring-[#96C4BB]/40"
                            : status === "active" ? "bg-[#D4AF37] text-[#070B0A] shadow-lg shadow-[#D4AF37]/30 ring-1 ring-[#D4AF37]"
                            : "bg-[#111A18] text-[#B2C9C5] border border-[#96C4BB]/15"
                        )}
                      >
                        {status === "done" ? <CheckCircle2 className="h-5 w-5 text-white" />
                          : status === "active" ? <Loader2 className="h-4 w-4 animate-spin text-[#070B0A]" />
                          : i + 1}
                      </span>
                      <span className={cn("text-sm transition-all duration-300", status === "active" ? "font-semibold text-[#F8FAFA]" : "font-medium text-[#B2C9C5]")}>
                        {p}
                      </span>
                    </motion.div>
                  );
                })}
              </div>

              {processing && (
                <div className="mt-6 h-2 overflow-hidden rounded-full bg-[#111A18] border border-[#96C4BB]/20 shadow-inner">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-[#507C7C] via-[#96C4BB] to-[#D4AF37]"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ ease: "easeOut" }}
                  />
                </div>
              )}

              <div className="mt-8 rounded-xl bg-[#111A18]/70 p-4 border border-[#96C4BB]/20">
                <Badge tone="flow" className="mb-3 border-[#D4AF37]/40 text-[#D4AF37] bg-[#D4AF37]/10">How it works</Badge>
                <p className="text-xs leading-relaxed text-[#B2C9C5]">
                  Your study material is read and organized using advanced AI technology. Once processed, you'll be able to watch interactive animations, practice with a voice tutor, and test yourself with customized flashcards.
                </p>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}

function Stat({ icon: Icon, label, value, valueText }: { icon: typeof Brain; label: string; value?: number; valueText?: string; }) {
  return (
    <div className="rounded-xl border border-[#96C4BB]/20 bg-[#111A18]/80 p-4 shadow-sm flex items-start gap-4 backdrop-blur-sm">
      <div className="rounded-lg bg-[#507C7C]/20 p-2 text-[#96C4BB] ring-1 ring-[#96C4BB]/30">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="font-display text-xl font-bold tracking-tight text-[#F8FAFA]">
          {valueText ?? value}
        </p>
        <p className="text-xs font-medium text-[#B2C9C5] uppercase tracking-wider mt-0.5">{label}</p>
      </div>
    </div>
  );
}
