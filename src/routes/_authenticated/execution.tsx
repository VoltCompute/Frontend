import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { Upload, FileText, FolderArchive, Github, RefreshCw, AlertCircle, X } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/execution")({
  head: () => ({
    meta: [
      { title: "Exécution — VoltCompute" },
      { name: "description", content: "Configurez et lancez vos workloads décentralisés sur les nodes du réseau." },
    ],
  }),
  component: ExecutionPage,
});

const INITIAL_LOGS = [
  { t: "system", text: "[SYSTEM] Initialisation de l'environnement Docker..." },
  { t: "system", text: "[SYSTEM] Téléchargement de l'image python:3.9-slim..." },
  { t: "system", text: "[SYSTEM] Montage du volume éphémère /app..." },
  { t: "exec", text: "→ Executing script: compute_main.py" },
  { t: "info", text: "INFO: Loading dataset 'bitcoin_historical_data'..." },
  { t: "info", text: "INFO: Pre-processing 1,240,000 entries..." },
  { t: "debug", text: "DEBUG: Allocating 4GB RAM to worker node..." },
];

function ExecutionPage() {
  const [tab, setTab] = useState<"file" | "zip" | "github">("file");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [githubUrl, setGithubUrl] = useState("");
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState(INITIAL_LOGS);
  const [showError, setShowError] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const accept = tab === "zip" ? ".zip" : ".py,.js,.sh,.ts";

  function handleFile(file: File) {
    setSelectedFile(file);
    toast.success(`Fichier sélectionné : ${file.name}`);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleLancer() {
    const hasInput = tab === "github" ? githubUrl.trim() : selectedFile;
    if (!hasInput) {
      toast.error(tab === "github" ? "Veuillez entrer une URL GitHub." : "Veuillez sélectionner un fichier.");
      return;
    }
    setRunning(true);
    setShowError(false);
    setLogs([{ t: "system", text: "[SYSTEM] Démarrage de la session..." }]);
    // TODO: remplacer par l'appel API réel
    setTimeout(() => {
      setLogs((prev) => [...prev, { t: "exec", text: `→ Executing: ${tab === "github" ? githubUrl : selectedFile!.name}` }]);
    }, 600);
    setTimeout(() => {
      setLogs((prev) => [...prev, { t: "info", text: "INFO: Connexion au node Benin-Alpha-Node..." }]);
    }, 1200);
    setTimeout(() => {
      setRunning(false);
      setLogs((prev) => [...prev, { t: "info", text: "INFO: Exécution terminée avec succès." }]);
      toast.success("Exécution terminée !");
    }, 2500);
  }

  function handleRetry() {
    setShowError(false);
    setLogs(INITIAL_LOGS.slice(0, 4));
    toast.info("Relance en cours...");
    setTimeout(() => {
      setLogs((prev) => [...prev, { t: "info", text: "INFO: Réinstallation de numpy==1.24.0..." }]);
    }, 800);
    setTimeout(() => {
      setLogs((prev) => [...prev, { t: "info", text: "INFO: Exécution relancée avec succès." }]);
      toast.success("Script relancé !");
    }, 2000);
  }

  return (
    <AppShell>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_460px] gap-6">
        <section>
          <div className="flex items-start justify-between flex-wrap gap-3 mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Configuration d'Exécution</h1>
              <p className="text-muted-foreground mt-1.5">Préparez vos fichiers et lancez votre workload décentralisé.</p>
            </div>
            <div className="px-4 py-2 rounded-full bg-secondary/15 border border-secondary/30 text-sm">
              <span className="text-success">✓</span> <span className="font-semibold">Benin-Alpha-Node</span> — 3 Sats/min
            </div>
          </div>

          <div className="card-surface overflow-hidden">
            <div className="flex border-b border-border">
              <TabBtn active={tab === "file"} onClick={() => { setTab("file"); setSelectedFile(null); }} icon={FileText}>Fichier</TabBtn>
              <TabBtn active={tab === "zip"} onClick={() => { setTab("zip"); setSelectedFile(null); }} icon={FolderArchive}>ZIP</TabBtn>
              <TabBtn active={tab === "github"} onClick={() => setTab("github")} icon={Github}>GitHub</TabBtn>
            </div>

            <div className="p-6">
              {tab === "github" ? (
                <input
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="w-full bg-input border border-border rounded-lg px-4 py-3 text-sm font-mono focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none"
                  placeholder="https://github.com/user/repo.git"
                />
              ) : (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={accept}
                    className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                  />
                  {selectedFile ? (
                    <div className="flex items-center gap-3 rounded-lg border border-primary/40 bg-primary/5 p-4">
                      <FileText className="size-5 text-primary shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{selectedFile.name}</div>
                        <div className="text-xs text-muted-foreground">{(selectedFile.size / 1024).toFixed(1)} KB</div>
                      </div>
                      <button onClick={() => setSelectedFile(null)} className="text-muted-foreground hover:text-foreground">
                        <X className="size-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-border rounded-lg py-16 text-center hover:border-primary/50 transition cursor-pointer"
                    >
                      <div className="size-14 rounded-full bg-surface-3 grid place-items-center mx-auto mb-4">
                        <Upload className="size-6 text-muted-foreground" />
                      </div>
                      <div className="font-semibold text-lg">Déposez votre script ici</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {tab === "zip" ? "Archive .zip (Max 200MB)" : "Supporte .py, .js, .sh (Max 50MB)"}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                        className="mt-5 px-5 py-2 rounded-lg bg-surface-2 border border-border text-sm font-medium hover:border-primary/50 transition"
                      >
                        Parcourir les fichiers
                      </button>
                    </div>
                  )}
                </>
              )}

              <button
                onClick={handleLancer}
                disabled={running}
                className="w-full mt-6 premium-gradient text-white font-semibold rounded-lg py-4 flex items-center justify-center gap-2.5 shadow-lg hover:opacity-95 text-base disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {running ? (
                  <>
                    <RefreshCw className="size-4 animate-spin" /> Exécution en cours...
                  </>
                ) : (
                  "⚡ Lancer l'exécution (30 Sats)"
                )}
              </button>
            </div>
          </div>
        </section>

        <aside className="card-surface flex flex-col min-h-[600px] bg-[oklch(0.10_0.02_270)] dark:bg-[oklch(0.10_0.02_270)]">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2 text-sm">
              <span className={`size-2 rounded-full pulse-dot ${running ? "bg-success text-success" : "bg-destructive text-destructive"}`} />
              <span className="font-semibold">Console en direct</span>
            </div>
            <div className="text-xs font-mono px-3 py-1 rounded-md bg-surface-3 border border-border">
              {running ? "En cours..." : "Session Active : 09:59"}
            </div>
          </div>
          <div className="flex-1 px-5 py-4 font-mono text-[13px] leading-6 space-y-1 overflow-y-auto">
            {logs.map((l, i) => (
              <div
                key={i}
                className={
                  l.t === "system" ? "text-muted-foreground"
                  : l.t === "exec" ? "text-primary"
                  : l.t === "info" ? "text-success"
                  : "text-tertiary"
                }
              >
                {l.text}
              </div>
            ))}

            {showError && (
              <div className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 p-4">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="size-4 text-destructive shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <div className="font-semibold text-destructive">ModuleNotFoundError: No module named 'numpy'</div>
                    <div className="text-xs text-muted-foreground leading-5">
                      Le script a échoué car une dépendance est manquante. Veuillez vérifier votre configuration pip.
                    </div>
                    <button
                      onClick={handleRetry}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-destructive/20 hover:bg-destructive/30 text-destructive text-xs font-semibold transition"
                    >
                      <RefreshCw className="size-3" /> Corriger & Relancer
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="text-muted-foreground pt-2">_</div>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}

function TabBtn({
  children,
  active,
  onClick,
  icon: Icon,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition ${
        active ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
      }`}
    >
      <Icon className="size-4" /> {children}
    </button>
  );
}
