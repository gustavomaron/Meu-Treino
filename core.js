export const STORAGE_KEY = "meu-treino:v1";
export const goalProgress = (g) =>
  g.done
    ? 100
    : Math.max(
        0,
        Math.min(
          100,
          Math.round(
            ((g.current - g.initial) / (g.target - g.initial)) * 100,
          ) || 0,
        ),
      );
export const toDisplay = (v, unit) =>
  unit === "lb" ? v * 2.2046226218 : unit === "in" ? v / 2.54 : v;
export const toCanonical = (v, unit) =>
  unit === "lb" ? v / 2.2046226218 : unit === "in" ? v * 2.54 : v;
export function pickWorkout(s, date = new Date()) {
  return (
    s.workouts.find((w) => w.id === s.active?.workoutId) ||
    s.workouts.find((w) => w.days.includes(date.getDay())) ||
    s.workouts[0]
  );
}

export function getDailySession(state, workoutId, date = new Date()) {
  if (!workoutId) return null;
  const today = localDate(date);
  let latest = null,
    latestTime = -Infinity;
  for (const session of state.history) {
    if (session.workoutId !== workoutId || session.demo === true) continue;
    const finished = Date.parse(session.finishedAt);
    const hasFinished = Number.isFinite(finished);
    const day = hasFinished ? localDate(new Date(finished)) : session.date;
    if (day !== today) continue;
    const time = hasFinished
      ? finished
      : Number.isFinite(session.startedAt)
        ? session.startedAt
        : 0;
    if (time >= latestTime) {
      latest = session;
      latestTime = time;
    }
  }
  return latest;
}
export function startSession(workout, now = Date.now()) {
  return {
    id: uid(),
    workoutId: workout.id,
    name: workout.name,
    group: workout.group,
    date: localDate(new Date(now)),
    startedAt: now,
    runningSince: now,
    accumulated: 0,
    paused: false,
    notes: "",
    rest: null,
    exercises: workout.exercises.map((e) => ({
      ...structuredClone(e),
      done: false,
      actualNotes: "",
      effort: "",
      actualSets: Array.from({ length: e.sets }, () => ({
        load: e.load,
        reps: e.reps,
        done: false,
      })),
    })),
  };
}
export function elapsed(a, now = Date.now()) {
  return Math.max(
    0,
    Math.floor((a.accumulated + (a.paused ? 0 : now - a.runningSince)) / 1000),
  );
}
export function pauseSession(a, now = Date.now()) {
  if (!a.paused) {
    a.accumulated += now - a.runningSince;
    a.paused = true;
    if (a.rest?.endAt) {
      a.rest.remaining = Math.max(0, a.rest.endAt - now);
      a.rest.endAt = null;
    }
  }
}
export function resumeSession(a, now = Date.now()) {
  if (a.paused) {
    a.runningSince = now;
    a.paused = false;
    if (a.rest?.remaining) {
      a.rest.endAt = now + a.rest.remaining;
      a.rest.remaining = null;
    }
  }
}
export function restartSession(a, now = Date.now()) {
  a.startedAt = now;
  a.runningSince = now;
  a.accumulated = 0;
  a.paused = false;
  a.rest = null;
  a.notes = "";
  for (const e of a.exercises) {
    e.done = false;
    e.actualNotes = "";
    e.effort = "";
    e.actualSets = Array.from({ length: e.sets }, () => ({
      load: e.load,
      reps: e.reps,
      done: false,
    }));
  }
}
export function finishSession(a, now = Date.now()) {
  const h = structuredClone(a);
  h.duration = elapsed(a, now);
  h.finishedAt = new Date(now).toISOString();
  delete h.rest;
  return h;
}

export function numeric(value, min = 0, max = 10000, integer = false) {
  const n = Number(value);
  if (
    value === "" ||
    value === null ||
    typeof value === "boolean" ||
    !Number.isFinite(n) ||
    n < min ||
    n > max ||
    (integer && !Number.isInteger(n))
  )
    throw new Error(
      `Informe um número ${integer ? "inteiro " : ""}entre ${min} e ${max}.`,
    );
  return n;
}
export function validDate(v) {
  if (typeof v !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const d = new Date(v + "T12:00:00");
  return !isNaN(d) && localDate(d) === v;
}
export function parseBackup(text) {
  if (text.length > 5000000)
    throw new Error("O backup deve ter no máximo 5 MB.");
  const fail = () => {
    throw new Error(
      "Backup inválido ou incompatível. Nenhum dado foi alterado.",
    );
  };
  let b;
  try {
    b = JSON.parse(text);
  } catch {
    fail();
  }
  if (b?.app !== "meu-treino" || b.version !== 1) fail();
  const s = b.data;
  const str = (v, max = 2000) => typeof v === "string" && v.length <= max;
  const num = (v, min = 0, max = 10000, int = false) =>
    typeof v === "number" &&
    Number.isFinite(v) &&
    v >= min &&
    v <= max &&
    (!int || Number.isInteger(v));
  const arr = (v, max = 10000) => Array.isArray(v) && v.length <= max;
  const id = (v) => str(v, 100) && v.length > 0;
  const ex = (e) =>
    e &&
    id(e.id) &&
    str(e.name, 120) &&
    e.name.trim() &&
    num(e.sets, 1, 30, true) &&
    num(e.reps, 1, 1000, true) &&
    num(e.load, 0, 2000) &&
    num(e.rest, 0, 3600, true) &&
    str(e.notes);
  const actual = (e) =>
    ex(e) &&
    typeof e.done === "boolean" &&
    str(e.actualNotes) &&
    ["", 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].includes(e.effort) &&
    arr(e.actualSets, 30) &&
    e.actualSets.length > 0 &&
    e.actualSets.every(
      (a) =>
        a &&
        num(a.load, 0, 2000) &&
        num(a.reps, 0, 1000, true) &&
        typeof a.done === "boolean",
    );
  const session = (a) =>
    a &&
    id(a.id) &&
    id(a.workoutId) &&
    str(a.name, 120) &&
    str(a.group, 120) &&
    validDate(a.date) &&
    str(a.notes) &&
    arr(a.exercises, 100) &&
    a.exercises.every(actual);
  if (
    !s ||
    s.version !== 1 ||
    !s.profile ||
    !str(s.profile.name, 80) ||
    typeof s.profile.dark !== "boolean" ||
    !["kg", "lb"].includes(s.profile.massUnit) ||
    !["cm", "in"].includes(s.profile.lengthUnit) ||
    typeof s.demo !== "boolean"
  )
    fail();
  if (
    !arr(s.workouts, 100) ||
    !s.workouts.every(
      (w) =>
        w &&
        id(w.id) &&
        str(w.name, 120) &&
        w.name.trim() &&
        str(w.group, 120) &&
        str(w.notes) &&
        arr(w.days, 7) &&
        w.days.every((d) => num(d, 0, 6, true)) &&
        arr(w.exercises, 100) &&
        w.exercises.every(ex),
    )
  )
    fail();
  if (new Set(s.workouts.map((w) => w.id)).size !== s.workouts.length) fail();
  if (
    !arr(s.history) ||
    !s.history.every((h) => session(h) && num(h.duration, 0, 31536000))
  )
    fail();
  if (
    !arr(s.measurements) ||
    !s.measurements.every(
      (m) =>
        m &&
        id(m.id) &&
        validDate(m.date) &&
        ["weight", "waist", "chest", "arm", "thigh", "hip"].some(
          (k) => m[k] != null,
        ) &&
        ["weight", "waist", "chest", "arm", "thigh", "hip"].every(
          (k) => m[k] == null || num(m[k], 0.01, 1000),
        ),
    )
  )
    fail();
  if (
    !arr(s.goals, 1000) ||
    !s.goals.every(
      (g) =>
        g &&
        id(g.id) &&
        str(g.title, 120) &&
        g.title.trim() &&
        ["weight", "load", "weekly", "total", "measure"].includes(g.category) &&
        num(g.initial) &&
        num(g.target) &&
        g.initial !== g.target &&
        num(g.current) &&
        typeof g.done === "boolean" &&
        (g.deadline === "" || validDate(g.deadline)),
    )
  )
    fail();
  if (s.active !== null) {
    const a = s.active;
    if (
      !session(a) ||
      a.exercises.length === 0 ||
      !num(a.startedAt, 0, 1e15) ||
      !num(a.runningSince, 0, 1e15) ||
      !num(a.accumulated, 0, 1e15) ||
      typeof a.paused !== "boolean"
    )
      fail();
    if (
      a.rest !== null &&
      (!a.rest ||
        !num(a.rest.seconds, 1, 3600) ||
        !(a.rest.endAt === null || num(a.rest.endAt, 0, 1e15)) ||
        !(a.rest.remaining === null || num(a.rest.remaining, 0, 3600000)))
    )
      fail();
  }
  return s;
}
export function uid() {
  if (globalThis.crypto.randomUUID) return globalThis.crypto.randomUUID();
  const bytes = globalThis.crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 15) | 64;
  bytes[8] = (bytes[8] & 63) | 128;
  const hex = [...bytes].map((n) => n.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
export const localDate = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
// Compatibility only: identify untouched legacy plans by their original
// metadata AND a linked, identical demonstration snapshot. Never seed data.
export function prepareState(source) {
  const s = structuredClone(source);
  const demoSessions = s.history.filter((h) => h.demo === true);
  const protectedPlans = new Set(
    s.history.filter((h) => h.demo !== true).map((h) => h.workoutId),
  );
  if (s.active) protectedPlans.add(s.active.workoutId);
  const legacyMetadata = [
    [
      "Treino A",
      "Peito e Tríceps",
      [1, 4],
      "Priorize a técnica e respeite seu ritmo.",
    ],
    [
      "Treino B",
      "Costas e Bíceps",
      [2, 5],
      "Movimentos controlados em todas as repetições.",
    ],
    ["Treino C", "Pernas e Ombros", [3, 6], "Aqueça antes de começar."],
  ].map((value) => JSON.stringify(value));
  const exercisePlan = (exercises) =>
    exercises.map((e) => [
      e.id,
      e.name,
      e.sets,
      e.reps,
      e.load,
      e.rest,
      e.notes,
    ]);
  s.workouts = s.workouts.filter((w) => {
    if (protectedPlans.has(w.id)) return true;
    if (w.demo === true) return false;
    if (
      s.demo !== true ||
      !legacyMetadata.includes(
        JSON.stringify([w.name, w.group, w.days, w.notes]),
      )
    )
      return true;
    return !demoSessions.some(
      (h) =>
        h.workoutId === w.id &&
        h.name === w.name &&
        h.group === w.group &&
        JSON.stringify(exercisePlan(h.exercises)) ===
          JSON.stringify(exercisePlan(w.exercises)),
    );
  });
  for (const key of ["history", "measurements", "goals"])
    s[key] = s[key].filter((record) => record.demo !== true);
  s.demo = false;
  return s;
}
export function createState() {
  return {
    version: 1,
    profile: { name: "", dark: false, massUnit: "kg", lengthUnit: "cm" },
    workouts: [],
    history: [],
    measurements: [],
    goals: [],
    active: null,
    demo: false,
  };
}
