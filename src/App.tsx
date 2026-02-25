import "./App.css";
import { useEffect, useMemo, useState } from "react";
import Sidebar from "./components/Sidebar";
import ExperimentButton from "./components/ExperimentButton";
import MainArea from "./components/MainArea";
import { runOllama } from "./api/run";

type Mode = "Run Mode" | "Comparison Mode";

type Tag = { id: string; label: string; weight?: number };

type Run = {
  id: string;
  runNumber: number;
  status: "complete" | "error" | "pending";
  modelName: string;
  latencySec?: number;
  temperature?: number;
  tokens?: number;
  prompt: string;
  response: string;
  score: number;
  tags: Tag[];
  notes?: string;
};

type Experiment = {
  id: string;
  name: string;
  createdAt: number;
  runs: Run[];
};

const STORAGE_KEY = "maincode_state_v1";

function makeFirstExperiment(): Experiment {
  return {
    id: crypto.randomUUID(),
    name: "#1Concept A Vs Concept B",
    createdAt: Date.now(),
    runs: [],
  };
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const first = makeFirstExperiment();
    return {
      experiments: [first] as Experiment[],
      selectedExperimentId: first.id as string | null,
      expandedExperimentId: first.id as string | null,
      temperature: 0.9,
      maxTokens: 305,
      systemPrompt: "",
      selectedModelId: "m1",
      mode: "Run Mode" as Mode,
    };
  }

  const parsed = JSON.parse(raw);

  const exps: Experiment[] = parsed.experiments ?? [];
  const fallback = exps[0] ?? makeFirstExperiment();

  return {
    experiments: exps.length ? exps : [fallback],
    selectedExperimentId: parsed.selectedExperimentId ?? fallback.id,
    expandedExperimentId: parsed.expandedExperimentId ?? fallback.id,
    temperature: parsed.temperature ?? 0.9,
    maxTokens: parsed.maxTokens ?? 305,
    systemPrompt: parsed.systemPrompt ?? "",
    selectedModelId: parsed.selectedModelId ?? "m1",
    mode: parsed.mode ?? ("Run Mode" as Mode),
  };
}

export default function App() {
  const initial = useMemo(() => loadState(), []);

  const [temperature, setTemperature] = useState<number>(initial.temperature);
  const [maxTokens, setMaxTokens] = useState<number>(initial.maxTokens);
  const [expandedExperimentId, setExpandedExperimentId] = useState<string | null>(
    initial.expandedExperimentId
  );
  const [selectedExperimentId, setSelectedExperimentId] = useState<string | null>(
    initial.selectedExperimentId
  );
  const [systemPrompt, setSystemPrompt] = useState<string>(initial.systemPrompt);

  const [promptValue, setPromptValue] = useState("");
  const [experiments, setExperiments] = useState<Experiment[]>(initial.experiments);
  const [selectedModelId, setSelectedModelId] = useState<string>(initial.selectedModelId);
  const [mode, setMode] = useState<Mode>(initial.mode);

  const models = useMemo(
    () => [
      {
        id: "m1",
        name: "llama3.2:3b",
        description: "Fast small model for quick iterations",
        paramSizeLabel: "3B . Parameter size",
        quantLabel: "Q4_K_M",
      },
      {
        id: "m2",
        name: "mistral:7b",
        description: "Stronger reasoning, good comparison target",
        paramSizeLabel: "7B parameter size",
        quantLabel: "Q4_K_M",
      },
    ],
    []
  );

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        experiments,
        selectedExperimentId,
        expandedExperimentId,
        temperature,
        maxTokens,
        systemPrompt,
        selectedModelId,
        mode,
      })
    );
  }, [
    experiments,
    selectedExperimentId,
    expandedExperimentId,
    temperature,
    maxTokens,
    systemPrompt,
    selectedModelId,
    mode,
  ]);

  const selectedExperiment = useMemo(() => {
    if (!selectedExperimentId) return null;
    return experiments.find((e) => e.id === selectedExperimentId) ?? null;
  }, [experiments, selectedExperimentId]);

  const runs = selectedExperiment?.runs ?? [];

  async function onSendPrompt() {
    if (!selectedExperiment) return;

    const prompt = promptValue.trim();
    if (!prompt) return;

    const runNumber = selectedExperiment.runs.length + 1;
    const tempRunId = crypto.randomUUID();

    const modelName =
      models.find((m) => m.id === selectedModelId)?.name ?? models[0].name;

    const pendingRun: Run = {
      id: tempRunId,
      runNumber,
      status: "pending",
      modelName,
      temperature,
      tokens: maxTokens,
      latencySec: undefined,
      prompt,
      response: "Pending response",
      score: 0,
      tags: [
          { id: crypto.randomUUID(), label: "Accurate", weight: -1 },
          { id: crypto.randomUUID(), label: "Concise", weight: -1 },
          { id: crypto.randomUUID(), label: "Verbose", weight: -1 },
          { id: crypto.randomUUID(), label: "Hallucinated", weight: -1 },
        ], 
      notes: "",
    };

    setExperiments((prev) =>
      prev.map((e) =>
        e.id !== selectedExperimentId ? e : { ...e, runs: [pendingRun, ...e.runs] }
      )
    );

    setPromptValue("");

    try {
      const start = performance.now();

      const data = await runOllama({
        model: modelName,
        prompt,
        system: systemPrompt || undefined,
        temperature,
        maxTokens,
      });

      const end = performance.now();

      const latencySec =
        data.totalDurationMs !== undefined
          ? data.totalDurationMs / 1000
          : (end - start) / 1000;

      setExperiments((prev) =>
        prev.map((e) => {
          if (e.id !== selectedExperimentId) return e;

          return {
            ...e,
            runs: e.runs.map((r) =>
              r.id === tempRunId
                ? {
                    ...r,
                    status: "complete",
                    response: data.response,
                    latencySec,
                    tokens: data.evalCount ?? r.tokens,
                  }
                : r
            ),
          };
        })
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Request failed";

      setExperiments((prev) =>
        prev.map((e) => {
          if (e.id !== selectedExperimentId) return e;

          return {
            ...e,
            runs: e.runs.map((r) =>
              r.id === tempRunId ? { ...r, status: "error", response: message } : r
            ),
          };
        })
      );
    }
  }

  const runsCount = runs.length;
  const bestScore = runsCount ? Math.max(...runs.map((r) => r.score)) : 0;
  const avgScore = runsCount ? runs.reduce((a, r) => a + r.score, 0) / runsCount : 0;
  const latencyAvg = runsCount
    ? runs.reduce((a, r) => a + (r.latencySec ?? 0), 0) / runsCount
    : 0;

  const sidebarExperiments = useMemo(() => {
  return experiments.map((e) => ({
    id: e.id,
    name: e.name,
    runCount: e.runs.length,
    runs: e.runs.slice(0, 5).map((r) => ({
      id: r.id,
      modelName: r.modelName,
      temperature: r.temperature ?? temperature,
      tokens: r.tokens ?? maxTokens,
      latencySec: r.latencySec ?? 0,
      score: r.score,
      promptPreview: r.prompt,
      tags: (r.tags ?? []).filter((t) => (t.weight ?? -1) >= 0).map((t) => t.label),
      hasNotes: Boolean(r.notes && r.notes.trim().length > 0),
    })),
  }));
}, [experiments, temperature, maxTokens]);


  return (
    <div className="flex h-screen w-full bg-white overflow-hidden">
      <div className="w-[283px] shrink-0 flex flex-col bg-white">
        <div className="px-5 pt-6 pb-4">
          <ExperimentButton
            onClick={() => {
              const next: Experiment = {
                id: crypto.randomUUID(),
                name: `#${experiments.length + 1}New Experiment`,
                createdAt: Date.now(),
                runs: [],
              };

              setExperiments((prev) => [next, ...prev]);
              setSelectedExperimentId(next.id);
              setExpandedExperimentId(next.id);
            }}
          >
            New Experiment
          </ExperimentButton>
        </div>

        <div className="flex-1 min-h-0 bg-ui-backgroundGrey rounded-t-[24px] overflow-hidden">
          <Sidebar
            temperature={temperature}
            maxTokens={maxTokens}
            onTemperatureChange={setTemperature}
            onMaxTokensChange={setMaxTokens}
            experiments={sidebarExperiments}
            expandedExperimentId={expandedExperimentId}
            onToggleExperiment={(id) => {
              setExpandedExperimentId((prev) => (prev === id ? null : id));
              setSelectedExperimentId(id);
            }}
            systemPrompt={systemPrompt}
            onSaveSystemPrompt={setSystemPrompt}
          />
        </div>
      </div>

      <div className="flex-1 min-w-0 px-6 pt-6 flex flex-col min-h-0">
        <MainArea
          experimentName={selectedExperiment?.name ?? ""}
          models={models}
          selectedModelId={selectedModelId}
          onSelectModel={setSelectedModelId}
          mode={mode}
          onModeChange={setMode}
          runsCount={runsCount}
          bestScore={Number(bestScore.toFixed(1))}
          latencyAvg={Number(latencyAvg.toFixed(1))}
          avgScore={Number(avgScore.toFixed(1))}
          promptValue={promptValue}
          onPromptChange={setPromptValue}
          onSendPrompt={onSendPrompt}
          runs={runs}
          onUpdateRun={(id, next) =>
            setExperiments((prev) =>
              prev.map((e) =>
                e.id !== selectedExperimentId
                  ? e
                  : { ...e, runs: e.runs.map((r) => (r.id === id ? { ...r, ...next } : r)) }
              )
            )
          }
          onDeleteRun={(id) =>
            setExperiments((prev) =>
              prev.map((e) =>
                e.id !== selectedExperimentId ? e : { ...e, runs: e.runs.filter((r) => r.id !== id) }
              )
            )
          }
          onReuseRunParams={(id) => {
            const run = runs.find((r) => r.id === id);
            if (run) setPromptValue(run.prompt);
          }}
        />
      </div>
    </div>
  );
}