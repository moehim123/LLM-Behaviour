import { useEffect, useMemo, useState } from "react";
import OverviewStat from "./OverviewStat";
import PromptInput from "./PromptInput";
import Dropdown from "./Dropdown";
import ModelCard from "./ModelCard";
import RunCard from "./RunCard";
import ScoreSlider from "./ScoreSlider";
import ChevronDown from "../assets/chevron-down.svg";

type Mode = "Run Mode" | "Comparison Mode";

type Model = {
  id: string;
  name: string;
  description: string;
  paramSizeLabel: string;
  quantLabel: string;
};

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
  tags: { id: string; label: string; weight?: number }[];
  notes?: string;
};

type Props = {
  experimentName: string;

  models: Model[];
  selectedModelId: string;
  onSelectModel: (id: string) => void;

  mode: Mode;
  onModeChange: (m: Mode) => void;

  runsCount: number;
  bestScore: number;
  latencyAvg: number;
  avgScore: number;

  promptValue: string;
  onPromptChange: (v: string) => void;
  onSendPrompt: () => void;

  runs: Run[];
  onUpdateRun: (id: string, next: Partial<Run>) => void;
  onDeleteRun: (id: string) => void;
  onReuseRunParams: (id: string) => void;
};

function runLabel(r: Run) {
  return `#Run${r.runNumber}`;
}

function summarize(a: Run | null, b: Run | null) {
  if (!a || !b) return "";

  const parts: string[] = [];

  if (a.modelName !== b.modelName) parts.push(`Model → ${a.modelName} to ${b.modelName}`);

  const aTok = a.tokens ?? 0;
  const bTok = b.tokens ?? 0;
  if (aTok !== bTok) parts.push(`Tokens → ${aTok} to ${bTok}`);

  const aTemp = a.temperature ?? 0;
  const bTemp = b.temperature ?? 0;
  if (aTemp !== bTemp) parts.push(`Temp → ${aTemp} to ${bTemp}`);

  const aLat = a.latencySec !== undefined ? Number(a.latencySec.toFixed(1)) : undefined;
  const bLat = b.latencySec !== undefined ? Number(b.latencySec.toFixed(1)) : undefined;
  if (aLat !== bLat) parts.push(`Latency → ${aLat ?? "n a"} to ${bLat ?? "n a"}`);

  if (!parts.length) return "No differences detected";
  return parts.join("  |  ");
}

export default function MainArea({
  experimentName,
  models,
  selectedModelId,
  onSelectModel,
  mode,
  onModeChange,
  runsCount,
  bestScore,
  latencyAvg,
  avgScore,
  promptValue,
  onPromptChange,
  onSendPrompt,
  runs,
  onUpdateRun,
  onDeleteRun,
  onReuseRunParams,
}: Props) {
  useMemo(() => models.find((m) => m.id === selectedModelId) ?? models[0], [models, selectedModelId]);

  const [filtersOpen, setFiltersOpen] = useState(false);

  const modelNameOptions = useMemo(() => {
    const unique = Array.from(new Set(runs.map((r) => r.modelName)));
    unique.sort((a, b) => a.localeCompare(b));
    return ["All", ...unique];
  }, [runs]);

  function selectedTagLabels(run: Run) {
  return (run.tags ?? [])
    .filter((t) => (t.weight ?? 0) > 0)
    .map((t) => t.label);
}

  const tagLabelOptions = useMemo(() => {
    const all = new Set<string>();

    runs.forEach((r) => {
      selectedTagLabels(r).forEach((label) => all.add(label));
    });

    const unique = Array.from(all);
    unique.sort((a, b) => a.localeCompare(b));
    return ["All", ...unique];
  }, [runs]);
  const [draftModel, setDraftModel] = useState<string>("All");
  const [draftTag, setDraftTag] = useState<string>("All");
  const [draftScoreMin, setDraftScoreMin] = useState<number>(0);
  const [draftTempMin, setDraftTempMin] = useState<number>(0);
  const [draftTokensMin, setDraftTokensMin] = useState<number>(0);

  const [appliedModel, setAppliedModel] = useState<string>("All");
  const [appliedTag, setAppliedTag] = useState<string>("All");
  const [appliedScoreMin, setAppliedScoreMin] = useState<number>(0);
  const [appliedTempMin, setAppliedTempMin] = useState<number>(0);
  const [appliedTokensMin, setAppliedTokensMin] = useState<number>(0);

  const [didSearch, setDidSearch] = useState(false);

  const filteredRuns = useMemo(() => {
    if (!didSearch) return runs;

    return runs.filter((r) => {
      const okModel = appliedModel === "All" ? true : r.modelName === appliedModel;
      const okTag =
        appliedTag === "All"
          ? true
          : selectedTagLabels(r).some((label) => label === appliedTag);      const okScore = r.score >= appliedScoreMin;

      const t = r.temperature ?? 0;
      const okTemp = t >= appliedTempMin;

      const tok = r.tokens ?? 0;
      const okTokens = tok >= appliedTokensMin;

      return okModel && okTag && okScore && okTemp && okTokens;
    });
  }, [runs, didSearch, appliedModel, appliedTag, appliedScoreMin, appliedTempMin, appliedTokensMin]);

  const runOptions = useMemo(() => {
    return runs.map((r) => ({
      value: r.id,
      label: runLabel(r),
    }));
  }, [runs]);

  const [leftRunId, setLeftRunId] = useState<string>("");
  const [rightRunId, setRightRunId] = useState<string>("");

  useEffect(() => {
    if (!runs.length) {
      setLeftRunId("");
      setRightRunId("");
      return;
    }

    setLeftRunId((prev) => (runs.some((r) => r.id === prev) ? prev : runs[0].id));

    const fallbackRight = runs[1]?.id ?? runs[0].id;
    setRightRunId((prev) => (runs.some((r) => r.id === prev) ? prev : fallbackRight));
  }, [runs]);

  const leftRun = useMemo(() => runs.find((r) => r.id === leftRunId) ?? null, [runs, leftRunId]);
  const rightRun = useMemo(() => runs.find((r) => r.id === rightRunId) ?? null, [runs, rightRunId]);

  const summaryText = useMemo(() => summarize(leftRun, rightRun), [leftRun, rightRun]);

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4 font-sans min-h-0">
      <div className="flex items-center justify-center gap-3">
        <Dropdown
          value={selectedModelId}
          onChange={(id) => onSelectModel(id)}
          menuWidth="content"
          options={models.map((m) => ({
            value: m.id,
            label: m.name,
            render: (
              <ModelCard
                name={m.name}
                description={m.description}
                paramSizeLabel={m.paramSizeLabel}
                quantLabel={m.quantLabel}
                selected={m.id === selectedModelId}
              />
            ),
          }))}
        />

        <Dropdown
          value={mode}
          onChange={(v) => onModeChange(v)}
          options={[
            { value: "Run Mode" as const, label: "Run Mode" },
            { value: "Comparison Mode" as const, label: "Comparison Mode" },
          ]}
        />
      </div>

      <section className="flex-1 min-h-0 rounded-t-[24px] bg-ui-backgroundGrey px-6 pt-6 pb-8 flex flex-col">
        <div className="flex items-center gap-6">
          <div className="text-[18px] font-medium text-ui-black">{experimentName}</div>

          <div className="h-[80px] w-[0.2px] bg-ui-black/20" />

          <div className="flex flex-wrap items-center gap-4">
            <OverviewStat label="Runs" value={runsCount} />
            <OverviewStat label="Best Score" value={bestScore} />
            <OverviewStat label="Latency" value={latencyAvg} />
            <OverviewStat label="Average Score" value={avgScore} />
          </div>
        </div>

        <div className="mt-6 h-[0.2px] w-full bg-ui-black/20" />

        {mode === "Run Mode" ? (
          <>
            <div className="mt-6">
              <PromptInput value={promptValue} onChange={onPromptChange} onSubmit={onSendPrompt} />
            </div>

            <div className="mt-6 h-[0.2px] w-full bg-ui-black/20" />

            <div className="mt-4 flex w-full items-center justify-end">
              <button
                type="button"
                onClick={() => setFiltersOpen((v) => !v)}
                className="
                  inline-flex
                  items-center
                  gap-[8px]
                  px-[6px] py-[5px]
                  rounded-[8px]
                  border border-ui-black/50
                  bg-white
                  font-sans
                "
                aria-expanded={filtersOpen}
              >
                <span className="text-[14px] font-normal text-ui-black">Filter By</span>
                <img
                  src={ChevronDown}
                  alt=""
                  className={[
                    "h-4 w-4 transition-transform",
                    filtersOpen ? "rotate-180" : "rotate-0",
                  ].join(" ")}
                />
              </button>
            </div>

            {filtersOpen && (
              <div className="mt-4 w-full rounded-[16px] bg-ui-backgroundGrey py-5">
                <div className="flex w-full flex-wrap items-start gap-10">
                  <Dropdown
                    value={draftModel}
                    onChange={setDraftModel}
                    options={modelNameOptions.map((name) => ({
                      value: name,
                      label: name === "All" ? "Models" : name,
                    }))}
                  />

                  <Dropdown
                    value={draftTag}
                    onChange={setDraftTag}
                    options={tagLabelOptions.map((name) => ({
                      value: name,
                      label: name === "All" ? "Tags" : name,
                    }))}
                  />

                  <div className="flex flex-col">
                    <div className="text-[12px] font-normal text-ui-black">Score</div>
                    <ScoreSlider value={draftScoreMin} onChange={setDraftScoreMin} min={0} max={9} step={0.1} />
                  </div>

                  <div className="flex flex-col">
                    <div className="text-[12px] font-normal text-ui-black">Temperature</div>
                    <ScoreSlider value={draftTempMin} onChange={setDraftTempMin} min={0} max={2} step={0.1} />
                  </div>

                  <div className="flex flex-col">
                    <div className="text-[12px] font-normal text-ui-black">Tokens</div>
                    <ScoreSlider value={draftTokensMin} onChange={setDraftTokensMin} min={0} max={4000} step={10} />
                  </div>
                </div>

                <div className="mt-5 flex w-full items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setDraftModel("All");
                      setDraftTag("All");
                      setDraftScoreMin(0);
                      setDraftTempMin(0);
                      setDraftTokensMin(0);

                      setAppliedModel("All");
                      setAppliedTag("All");
                      setAppliedScoreMin(0);
                      setAppliedTempMin(0);
                      setAppliedTokensMin(0);

                      setDidSearch(false);
                    }}
                    className="
                      inline-flex items-center justify-center
                      px-3 py-2
                      rounded-[8px]
                      border border-ui-black/50
                      bg-white
                      text-[14px] font-normal text-ui-black
                    "
                  >
                    Clear
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAppliedModel(draftModel);
                      setAppliedTag(draftTag);
                      setAppliedScoreMin(draftScoreMin);
                      setAppliedTempMin(draftTempMin);
                      setAppliedTokensMin(draftTokensMin);
                      setDidSearch(true);
                    }}
                    className="
                      inline-flex items-center justify-center
                      px-3 py-2
                      rounded-[8px]
                      bg-ui-black
                      text-[14px] font-normal text-white
                    "
                  >
                    Search
                  </button>
                </div>
              </div>
            )}

            <div className="mt-6 flex-1 min-h-0 overflow-y-auto pr-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex flex-col gap-6">
                {filteredRuns.length ? (
                  filteredRuns.map((r) => (
                    <RunCard
                      key={r.id}
                      runNumber={r.runNumber}
                      status={r.status}
                      modelName={r.modelName}
                      latencySec={r.latencySec}
                      temperature={r.temperature}
                      tokens={r.tokens}
                      prompt={r.prompt}
                      response={r.response}
                      score={r.score}
                      onScoreChange={(next) => onUpdateRun(r.id, { score: next })}
                      tags={r.tags}
                      onTagsChange={(next) => onUpdateRun(r.id, { tags: next })}
                      notes={r.notes ?? ""}
                      onNotesSave={(value) => onUpdateRun(r.id, { notes: value })}
                      onReuseParams={() => onReuseRunParams(r.id)}
                      onDeleteRun={() => onDeleteRun(r.id)}
                    />
                  ))
                ) : (
                  <div className="w-full py-10 text-center text-[11px] font-normal text-ui-grey">
                    No runs found
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="mt-6 flex items-center gap-4">
              <div className="text-[14px] font-normal text-ui-black">Compare</div>

              <Dropdown value={leftRunId} onChange={setLeftRunId} menuWidth="content" options={runOptions} />

              <div className="text-[14px] font-normal text-ui-black">to</div>

              <Dropdown value={rightRunId} onChange={setRightRunId} menuWidth="content" options={runOptions} />
            </div>

            <div className="mt-6 flex-1 min-h-0 overflow-y-auto pr-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="mx-auto flex w-full max-w-[980px] items-start justify-center gap-6">
                {leftRun ? (
                  <RunCard
                    key={leftRun.id}
                    runNumber={leftRun.runNumber}
                    status={leftRun.status}
                    modelName={leftRun.modelName}
                    latencySec={leftRun.latencySec}
                    temperature={leftRun.temperature}
                    tokens={leftRun.tokens}
                    prompt={leftRun.prompt}
                    response={leftRun.response}
                    score={leftRun.score}
                    onScoreChange={(next) => onUpdateRun(leftRun.id, { score: next })}
                    tags={leftRun.tags}
                    onTagsChange={(next) => onUpdateRun(leftRun.id, { tags: next })}
                    notes={leftRun.notes ?? ""}
                    onNotesSave={(value) => onUpdateRun(leftRun.id, { notes: value })}
                    onReuseParams={() => onReuseRunParams(leftRun.id)}
                    onDeleteRun={() => onDeleteRun(leftRun.id)}
                    containerClassName="w-full max-w-[470px]"
                  />
                ) : (
                  <div className="w-full max-w-[470px]" />
                )}

                {rightRun ? (
                  <RunCard
                    key={rightRun.id}
                    runNumber={rightRun.runNumber}
                    status={rightRun.status}
                    modelName={rightRun.modelName}
                    latencySec={rightRun.latencySec}
                    temperature={rightRun.temperature}
                    tokens={rightRun.tokens}
                    prompt={rightRun.prompt}
                    response={rightRun.response}
                    score={rightRun.score}
                    onScoreChange={(next) => onUpdateRun(rightRun.id, { score: next })}
                    tags={rightRun.tags}
                    onTagsChange={(next) => onUpdateRun(rightRun.id, { tags: next })}
                    notes={rightRun.notes ?? ""}
                    onNotesSave={(value) => onUpdateRun(rightRun.id, { notes: value })}
                    onReuseParams={() => onReuseRunParams(rightRun.id)}
                    onDeleteRun={() => onDeleteRun(rightRun.id)}
                    containerClassName="w-full max-w-[470px]"
                  />
                ) : (
                  <div className="w-full max-w-[470px]" />
                )}
              </div>

              <div className="mt-10">
                <div className="text-[14px] font-normal text-ui-black">
                  Comparison Summary | {leftRun ? runLabel(leftRun) : ""} Vs {rightRun ? runLabel(rightRun) : ""}
                </div>

                <div className="mt-3 w-[820px] flex flex-col items-start bg-white rounded-[8px] pl-[16px] pr-[595px] pb-[6px]">
                  <div className="pt-3 text-[12px] font-light text-ui-black">{summaryText}</div>
                </div>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}