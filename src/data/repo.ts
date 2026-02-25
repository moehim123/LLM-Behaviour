export type Experiment = {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
};

export type RunStatus = "pending" | "complete" | "error";

export type Run = {
  id: string;
  experimentId: string;
  runNumber: number;
  status: RunStatus;

  modelName: string;
  temperature?: number;
  tokens?: number;

  prompt: string;
  response: string;

  latencyMs?: number;

  score: number;
  tags: { id: string; label: string; weight?: number }[];
  notes: string;

  createdAt: number;
  updatedAt: number;
};

const KEY = "mcdb_v1";

type DB = {
  experiments: Experiment[];
  runs: Run[];
};

function load(): DB {
  const raw = localStorage.getItem(KEY);
  if (!raw) return { experiments: [], runs: [] };
  try {
    return JSON.parse(raw) as DB;
  } catch {
    return { experiments: [], runs: [] };
  }
}

function save(db: DB) {
  localStorage.setItem(KEY, JSON.stringify(db));
}

export function createExperiment(name?: string): Experiment {
  const db = load();
  const now = Date.now();
  const exp: Experiment = {
    id: crypto.randomUUID(),
    name: name ?? `Experiment ${db.experiments.length + 1}`,
    createdAt: now,
    updatedAt: now,
  };
  db.experiments.unshift(exp);
  save(db);
  return exp;
}

export function renameExperiment(id: string, name: string) {
  const db = load();
  const now = Date.now();
  db.experiments = db.experiments.map((e) =>
    e.id === id ? { ...e, name, updatedAt: now } : e
  );
  save(db);
}

export function listExperiments(): Experiment[] {
  return load().experiments;
}

export function listRuns(experimentId: string): Run[] {
  return load()
    .runs
    .filter((r) => r.experimentId === experimentId)
    .sort((a, b) => a.runNumber - b.runNumber);
}

export function createRun(input: {
  experimentId: string;
  modelName: string;
  temperature?: number;
  tokens?: number;
  prompt: string;
}): Run {
  const db = load();
  const now = Date.now();
  const runNumber =
    db.runs.filter((r) => r.experimentId === input.experimentId).length + 1;

  const run: Run = {
    id: crypto.randomUUID(),
    experimentId: input.experimentId,
    runNumber,
    status: "pending",
    modelName: input.modelName,
    temperature: input.temperature,
    tokens: input.tokens,
    prompt: input.prompt,
    response: "",
    score: 0,
    tags: [
      { id: crypto.randomUUID(), label: "Accurate", weight: -1 },
      { id: crypto.randomUUID(), label: "Concise", weight: -1 },
      { id: crypto.randomUUID(), label: "Verbose", weight: -1 },
      { id: crypto.randomUUID(), label: "Hallucinated", weight: -1 },
    ],
    notes: "",
    createdAt: now,
    updatedAt: now,
  };

  db.runs.push(run);
  save(db);
  return run;
}

export function updateRun(id: string, patch: Partial<Run>) {
  const db = load();
  const now = Date.now();
  db.runs = db.runs.map((r) => (r.id === id ? { ...r, ...patch, updatedAt: now } : r));
  save(db);
}

export function getExperimentStats(experimentId: string) {
  const runs = listRuns(experimentId);
  const runsCount = runs.length;

  const bestScore = runsCount ? Math.max(...runs.map((r) => r.score)) : 0;

  const completed = runs.filter((r) => typeof r.latencyMs === "number");
  const latencyAvg = completed.length
    ? completed.reduce((acc, r) => acc + (r.latencyMs ?? 0), 0) / completed.length / 1000
    : 0;

  const avgScore = runsCount
    ? runs.reduce((acc, r) => acc + (r.score ?? 0), 0) / runsCount
    : 0;

  return { runsCount, bestScore, latencyAvg, avgScore };
}