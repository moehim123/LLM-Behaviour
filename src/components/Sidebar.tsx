import ParameterSlider from "./ParamSlider";
import ExperimentSidebarOverview from "./ExperimentOverview";
import RunOverviewCard from "./RunOverviewCard";
import SystemPromptBox from "./SystemPromptInput";

type RunOverview = {
  id: string;
  modelName: string;
  temperature: number;
  tokens: number;
  latencySec: number;
  score?: number;
  promptPreview: string;
  tags: string[];
  hasNotes: boolean;
};

type Experiment = {
  id: string;
  name: string;
  runCount: number;
  runs: RunOverview[];
};

type Props = {
  temperature: number;
  maxTokens: number;
  onTemperatureChange: (v: number) => void;
  onMaxTokensChange: (v: number) => void;

  experiments: Experiment[];
  expandedExperimentId: string | null;
  onToggleExperiment: (id: string) => void;

  systemPrompt: string;
  onSaveSystemPrompt: (v: string) => void;
};

function isSelectedTagLabel(label: string) {
  const v = label.trim().toLowerCase();
  if (!v) return false;
  if (v === "tags") return false;
  return true;
}

export default function Sidebar({
  temperature,
  maxTokens,
  onTemperatureChange,
  onMaxTokensChange,
  experiments,
  expandedExperimentId,
  onToggleExperiment,
  systemPrompt,
  onSaveSystemPrompt,
}: Props) {
  return (
    <aside className="h-full px-2 pt-6 pb-5 flex flex-col overflow-hidden font-sans">
      <div className="flex-1 rounded-t-[24px] bg-ui-backgroundGrey px-5 pt-6 pb-5 flex flex-col overflow-hidden">
        <div className="text-[18px] font-medium text-ui-black">Parameters</div>

        <div className="mt-5 flex flex-col gap-6">
          <ParameterSlider
            label="Temperature"
            value={temperature}
            min={0}
            max={2}
            step={0.1}
            onChange={onTemperatureChange}
          />

          <ParameterSlider
            label="Max Tokens"
            value={maxTokens}
            min={1}
            max={4096}
            step={1}
            onChange={onMaxTokensChange}
          />
        </div>

        <div className="my-6 h-[0.5px] w-full bg-ui-black/20" />

        <div className="text-[18px] font-medium text-ui-black">
          Experiments/ Sessions
        </div>

        <div className="mt-4 flex-1 overflow-y-auto pr-1">
          <div className="flex flex-col gap-3">
            {experiments.map((exp) => {
              const open = expandedExperimentId === exp.id;

              return (
                <div key={exp.id} className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => onToggleExperiment(exp.id)}
                    className="text-left"
                  >
                    <ExperimentSidebarOverview
                      title={exp.name}
                      runsCount={exp.runCount}
                      defaultOpen={open}
                    />
                  </button>

                  {open && (
                    <div className="flex flex-col gap-2 pl-2">
                      {exp.runs.map((run) => {
                        const filteredTags = (run.tags ?? []).filter(isSelectedTagLabel);

                        return (
                          <RunOverviewCard
                            key={run.id}
                            modelName={run.modelName}
                            temperature={run.temperature}
                            maxTokens={run.tokens}
                            latencySeconds={run.latencySec}
                            score={run.score}
                            prompt={run.promptPreview}
                            tags={filteredTags}
                            notesAttached={run.hasNotes}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6">
          <SystemPromptBox
            initialValue={systemPrompt}
            onSave={onSaveSystemPrompt}
          />
        </div>
      </div>
    </aside>
  );
}