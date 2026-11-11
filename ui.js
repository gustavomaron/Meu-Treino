import {
  goalProgress,
  elapsed,
  toDisplay,
  localDate,
  pickWorkout,
} from "./core.js";
export const esc = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const paths = {
  home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
  dumbbell:
    '<path d="m6 6 12 12M4 9l5-5m6 16 5-5M2 7l5-5m10 20 5-5M2 7l3 3M7 2l3 3m4 14 3 3m2-8 3 3"/>',
  chart: '<path d="M4 3v17h17M8 14l4-5 4 3 5-7"/>',
  history: '<path d="M3 10a9 9 0 1 1 1 7M3 4v6h6m3-3v5l3 2"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a7 7 0 0 1 16 0v2"/>',
  target:
    '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  back: '<path d="m14 5-7 7 7 7"/>',
  play: '<path d="m8 4 13 8-13 8z"/>',
  pause: '<path d="M8 5v14M16 5v14"/>',
  timer:
    '<circle cx="12" cy="14" r="8"/><path d="M12 2v4M8 2h8m2 5 2-2m-8 5v5l3 2"/>',
  check: '<path d="m5 12 4 4L20 5"/>',
  calendar:
    '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4m10-4v4M3 11h18"/>',
  plus: '<path d="M12 4v16M4 12h16"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  edit: '<path d="m14 5 5 5M4 20l5-1L21 7a2 2 0 0 0-5-5L4 15z"/>',
  trash: '<path d="M3 6h18M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7"/>',
  moon: '<path d="M20 15A9 9 0 0 1 9 4 9 9 0 1 0 20 15z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2"/>',
  shield:
    '<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6z"/><path d="m8 12 3 3 5-6"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
  upload: '<path d="M12 16V3m-5 5 5-5 5 5M4 16v5h16v-5"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v.1"/>',
  scale:
    '<path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM7 7h10v5H7zm5 0 2 3"/>',
  flame:
    '<path d="M13 2c1 7 7 8 7 14a8 8 0 0 1-16 0c0-3 2-6 4-8 0 4 2 4 2 4s4-5 3-10z"/>',
  trophy:
    '<path d="M8 3h8v9a4 4 0 0 1-8 0zm4 13v5m-5 0h10M8 5H3v3a5 5 0 0 0 5 5m8-8h5v3a5 5 0 0 1-5 5"/>',
  restart: '<path d="M3 10a9 9 0 1 1 1 7M3 4v6h6"/>',
  volume:
    '<path d="m11 4-6 5H2v6h3l6 5zm4 4a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
};
export const icon = (name, cls = "") =>
  `<svg viewBox="0 0 24 24" aria-hidden="true" class="${cls}">${paths[name] || paths.dumbbell}</svg>`;
export const fmt = (v, d = 1) =>
  Number(v).toLocaleString("pt-BR", { maximumFractionDigits: d });
export const display = (v, unit) => fmt(toDisplay(v, unit));
export const dateFmt = (v, opt = { day: "2-digit", month: "short" }) =>
  new Date(v + "T12:00:00").toLocaleDateString("pt-BR", opt);
export const clock = (s) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
export const duration = (s) =>
  s >= 3600
    ? `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}min`
    : `${Math.floor(s / 60)} min`;
export const btn = (label, action, ic = "", cls = "", attrs = "") =>
  `<button type="button" class="btn ${cls}" data-action="${action}" ${attrs}>${ic ? icon(ic) : ""}${label}</button>`;
export const progress = (n) =>
  `<div class="progress" role="progressbar" aria-valuenow="${n}" aria-valuemin="0" aria-valuemax="100" aria-label="Progresso"><span style="width:${n}%"></span></div>`;
export const empty = (title, text, button = "", ic = "dumbbell") =>
  `<div class="empty">${icon(ic)}<h3>${title}</h3><p>${text}</p>${button}</div>`;
export const names = {
  home: "Início",
  workouts: "Treinos",
  evolution: "Evolução",
  history: "Histórico",
  profile: "Perfil",
  goals: "Minhas metas",
  session: "Treino em andamento",
};
export const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
export const catNames = {
  weight: "Peso corporal",
  load: "Carga no exercício",
  weekly: "Treinos por semana",
  total: "Total de treinos",
  measure: "Medida corporal",
};
export const measures = {
  weight: "Peso corporal",
  waist: "Cintura",
  chest: "Peito",
  arm: "Braço",
  thigh: "Coxa",
  hip: "Quadril",
};
export function shell(s, page, content) {
  const nav = [
    ["home", "home"],
    ["workouts", "dumbbell"],
    ["evolution", "chart"],
    ["history", "history"],
    ["profile", "user"],
  ];
  const name = s.profile.name || "Seu perfil",
    initials = s.profile.name
      ? s.profile.name
          .split(" ")
          .slice(0, 2)
          .map((x) => x[0])
          .join("")
          .toUpperCase()
      : "MT";
  const brand = `<div class="brand-mark">${icon("dumbbell")}</div><span>meu treino<span style="color:#659338">.</span></span>`;
  return `<aside class="sidebar"><div class="brand">${brand}</div><div class="brand-caption">Seu ritmo. Sua evolução.</div><p class="nav-label">Seu espaço</p><nav class="nav" aria-label="Navegação principal">${nav.map(([p, i]) => `<button type="button" class="nav-btn ${page === p || (p === "workouts" && page === "session") ? "active" : ""}" data-page="${p}" ${page === p ? 'aria-current="page"' : ""}>${icon(i)}<span>${names[p]}</span></button>`).join("")}</nav><div class="side-bottom"><button class="nav-btn ${page === "goals" ? "active" : ""}" type="button" data-action="goals">${icon("target")}<span>Minhas metas</span></button><div class="local-note">${icon("shield")}<span>Só seu. Só neste dispositivo.<br>Seus dados ficam com você.</span></div><button type="button" class="user-button" data-action="profile"><span class="avatar">${esc(initials)}</span><span class="grow"><strong>${esc(name)}</strong><span class="muted">Um passo de cada vez</span></span>${icon("chevron")}</button></div></aside>
 <div class="workspace"><header class="topbar"><div class="breadcrumb">Meu espaço ${icon("chevron")} <b>${names[page]}</b></div><div class="brand mobile-brand">${brand}</div><div class="top-actions"><span class="status-dot">${navigator.onLine ? "Salvo neste dispositivo" : "Modo offline"}</span><button type="button" class="icon-btn" data-action="theme" aria-label="${s.profile.dark ? "Ativar modo claro" : "Ativar modo escuro"}">${icon(s.profile.dark ? "sun" : "moon")}</button><button class="avatar" type="button" data-action="profile" aria-label="Abrir perfil">${esc(initials)}</button></div></header><main id="main" class="main" tabindex="-1">${content}<footer class="footer"><span>${icon("shield")} Seus dados ficam somente neste dispositivo</span><span>Meu Treino · Feito para o seu ritmo</span></footer></main></div>`;
}
export function head(eyebrow, title, sub = "", action = "") {
  return `<div class="page-head"><div><div class="eyebrow">${eyebrow}</div><h1>${title}</h1>${sub ? `<p>${sub}</p>` : ""}</div>${action}</div>`;
}
export function miniChart(records, key = "weight", big = false, unit = "kg") {
  const data = records
    .filter((m) => m[key] != null)
    .sort((a, b) => a.date.localeCompare(b.date));
  if (!data.length)
    return `<p class="helper">Registre sua primeira medida para visualizar a evolução.</p>`;
  const vals = data.map((m) => toDisplay(m[key], unit)),
    min = Math.min(...vals),
    max = Math.max(...vals),
    span = max - min || 1;
  const w = 500,
    h = big ? 180 : 75,
    pad = big ? 30 : 4;
  const points = vals.map((v, i) => [
    pad +
      (vals.length === 1
        ? (w - 2 * pad) / 2
        : (i * (w - 2 * pad)) / (vals.length - 1)),
    h - pad - ((v - min) / span) * (h - 2 * pad),
  ]);
  const pts = points.map((p) => p.join(",")).join(" ");
  return `<svg class="${big ? "evolution-chart" : "mini-chart"}" viewBox="0 0 ${w} ${h}" role="img" aria-label="Evolução de ${esc(measures[key])}: ${data.map((m, i) => `${dateFmt(m.date)} ${fmt(vals[i])} ${unit}`).join("; ")}">${big ? [pad, h / 2, h - pad].map((y) => `<path d="M${pad} ${y}H${w - pad}" stroke="var(--border)" stroke-width="1"/>`).join("") : ""}<path class="chart-area" stroke="none" d="M${points[0][0]},${h} L${pts.replace(/ /g, " L")} L${points.at(-1)[0]},${h}Z"/><polyline class="chart-line" points="${pts}"/>${points.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${big ? 4 : 3}" fill="var(--surface)" stroke="#66983c" stroke-width="2"/>`).join("")}</svg>${big ? `<div class="chart-labels"><span>${dateFmt(data[0].date)}</span><span>${dateFmt(data.at(-1).date)}</span></div>` : ""}`;
}
export function delta(records, key, unit) {
  const r = records
    .filter((m) => m[key] != null)
    .sort((a, b) => a.date.localeCompare(b.date));
  if (r.length === 0) return "Sem registros";
  if (r.length === 1) return "Primeiro registro";
  const d = toDisplay(r.at(-1)[key] - r.at(-2)[key], unit);
  return Math.abs(d) < 0.05
    ? "Estável"
    : `${d > 0 ? "+" : "−"}${fmt(Math.abs(d))} ${unit} vs. anterior`;
}
export function goalCard(g, s, compact = false) {
  const n = goalProgress(g),
    unit = ["weight", "load"].includes(g.category)
      ? s.profile.massUnit
      : g.category === "measure"
        ? s.profile.lengthUnit
        : "treinos";
  const value = (v) =>
    ["kg", "lb", "cm", "in"].includes(unit) ? display(v, unit) : fmt(v);
  if (compact)
    return `<div class="card goal-summary"><div class="row"><div class="goal-icon">${icon("target")}</div><div class="grow"><h3>${esc(g.title)}</h3><p class="small muted">${esc(catNames[g.category])}</p></div><strong class="small">${n}%</strong></div>${progress(n)}<div class="row between goal-footer"><span><strong>${value(g.current)}</strong> de ${value(g.target)} ${unit}</span><span>${g.done ? "Concluída" : g.deadline ? "Até " + dateFmt(g.deadline) : "Um treino de cada vez."}</span></div></div>`;
  return `<article class="card goal-card"><div class="row between"><span class="badge">${g.done ? "Concluída" : esc(catNames[g.category])}</span><button type="button" class="icon-btn" data-action="edit-goal" data-id="${esc(g.id)}" aria-label="Editar meta ${esc(g.title)}">${icon("edit")}</button></div><h3>${esc(g.title)}</h3><p class="small muted">${g.deadline ? "Prazo: " + dateFmt(g.deadline, { day: "2-digit", month: "long", year: "numeric" }) : "Sem pressa. Com consistência."}</p>${progress(n)}<div class="row between goal-values"><span>${value(g.current)} / ${value(g.target)} ${unit}</span><strong>${n}%</strong></div><p class="helper">Inicial: ${value(g.initial)} ${unit} · Atualização manual</p><div class="row between actions">${btn(g.done ? "Reabrir" : "Concluir", "complete-goal", "check", "quiet", `data-id="${esc(g.id)}"`)}<button class="icon-btn" type="button" data-action="delete-goal" data-id="${esc(g.id)}" aria-label="Excluir meta ${esc(g.title)}">${icon("trash")}</button></div></article>`;
}
export function home(s) {
  const w = pickWorkout(s),
    a = s.active;
  const total = a ? a.exercises.length : w?.exercises.length || 0;
  const done = a ? a.exercises.filter((e) => e.done).length : 0;
  const percent = total ? Math.round((done / total) * 100) : 0;
  const now = new Date(),
    monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  const week = s.history.filter(
    (h) => h.date >= localDate(monday) && h.date <= localDate(now),
  );
  const weeklyGoal = s.goals.find(
    (g) => g.category === "weekly" && !g.done,
  )?.target;
  const measurements = [...s.measurements]
    .filter((m) => m.weight != null)
    .sort((a, b) => a.date.localeCompare(b.date));
  const last = measurements.at(-1);
  const recent = [...s.history]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);
  const goal = s.goals.find((g) => !g.done) || s.goals[0];
  const totalMinutes = Math.floor(
    s.history.reduce((acc, h) => acc + h.duration, 0) / 60,
  );
  const today =
    a || w
      ? `<section class="today-card"><div class="training-art">${icon("dumbbell")}</div><div class="row between"><span class="eyebrow">${a ? "Treino em andamento" : "Seu treino de hoje"}</span><span class="badge">${icon(a ? "timer" : "calendar")}${a ? (a.paused ? "Pausado" : "Em andamento") : w.days.includes(now.getDay()) ? "Programado" : "Seu plano"}</span></div><h2>${esc(a?.name || w?.name)}</h2><p class="today-sub">${esc(a?.group || w?.group || "Seu plano de exercícios")}</p><div class="today-facts"><span>${icon("dumbbell")}${total} exercícios</span><span>${icon("timer")}${a ? duration(elapsed(a)) : "No seu ritmo"}</span></div>${total ? `<div class="progress-label"><span>${done} de ${total} exercícios concluídos</span><strong>${percent}%</strong></div>${progress(percent)}` : '<p class="today-sub mt mb">Adicione os exercícios antes de começar.</p>'}${btn(a ? "Continuar treino" : total ? "Começar treino" : "Adicionar exercícios", a ? "session" : total ? "start" : "edit-workout", total ? "play" : "plus", "primary", `data-id="${esc(a?.workoutId || w?.id)}"`)}</section>`
      : `<section class="today-card"><div class="training-art">${icon("dumbbell")}</div><span class="eyebrow">Vamos começar</span><h2>Seu primeiro treino</h2><p class="today-sub">Crie seu treino e adicione os exercícios orientados pelo seu professor.</p><p class="today-sub mt mb small">Depois, registre suas séries, repetições e cargas por aqui.</p>${btn("Criar meu treino", "new-workout", "plus", "primary")}</section>`;
  return `${head(s.profile.name ? `Olá, ${esc(s.profile.name)}. Vamos nessa?` : "Bom ter você por aqui", "Seu próximo passo começa aqui.", "Não precisa ser perfeito. Só precisa ser o seu melhor de hoje.", `<div class="date-label">${icon("calendar")}${now.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}</div>`)}
  <section class="mobile-install" aria-label="Instalar Meu Treino"><img src="./icons/apple-touch-icon.png" width="42" height="42" alt=""><div><h2>Ícone na tela inicial</h2><p>Abra como um aplicativo.</p></div>${btn("Adicionar", "install", "", "primary", 'aria-label="Adicionar à tela inicial"')}</section>
  <div class="home-grid">${today}<section class="card weekly-card"><div class="section-head"><h2>Sua semana</h2>${icon("flame")}</div><div class="weekly-number"><strong>${week.length}</strong> <span>${weeklyGoal != null ? `de ${fmt(weeklyGoal, 0)} treinos` : "treinos nesta semana"}</span></div><p class="small muted">${week.length ? "Cada treino realizado aparece no calendário." : "Seu calendário será preenchido quando você finalizar treinos."}</p><div class="week-grid">${Array.from(
    { length: 7 },
    (_, i) => {
      const d = new Date(monday);
      d.setDate(d.getDate() + i);
      const key = localDate(d),
        hit = week.some((h) => h.date === key);
      return `<div class="week-day">${days[d.getDay()]}<div class="day-circle ${hit ? "done" : ""} ${key === localDate(now) ? "today" : ""}" role="img" aria-label="${dateFmt(key)}${hit ? ", treino realizado" : ""}${key === localDate(now) ? ", hoje" : ""}">${hit ? icon("check") : d.getDate()}</div></div>`;
    },
  ).join(
    "",
  )}</div><p class="encourage"><b>Um treino de cada vez.</b><br>${weeklyGoal != null ? "Sua meta semanal foi definida por você." : "Você pode definir uma meta semanal em Minhas metas."}</p></section></div>
  ${s.history.length || last ? `<div class="stat-strip"><div class="card stat-card"><span class="stat-icon">${icon("dumbbell")}</span><div><strong>${s.history.length}</strong><p>Treinos realizados</p></div></div><div class="card stat-card"><span class="stat-icon">${icon("timer")}</span><div><strong>${totalMinutes}<small> min</small></strong><p>Tempo em movimento</p></div></div><div class="card stat-card"><span class="stat-icon">${icon("scale")}</span><div><strong>${last ? display(last.weight, s.profile.massUnit) : "—"}<small> ${s.profile.massUnit}</small></strong><p>Último peso registrado</p></div></div></div>` : ""}
  <div class="lower-grid"><section><div class="section-head"><h2>Suas metas</h2><button class="text-btn" type="button" data-action="goals">Ver metas ${icon("arrow")}</button></div>${goal ? goalCard(goal, s, true) : empty("O que você quer alcançar?", "Defina seu próprio objetivo e atualize o progresso no seu ritmo.", btn("Criar meta", "new-goal", "plus", "primary"), "target")}</section><section><div class="section-head"><h2>Seu corpo, sua evolução</h2><button class="text-btn" type="button" data-action="evolution">Ver evolução ${icon("arrow")}</button></div>${last ? `<div class="card"><div class="row between"><div><p class="small muted">Peso corporal</p><div class="weight-number">${display(last.weight, s.profile.massUnit)} <span>${s.profile.massUnit}</span></div></div><span class="delta">${delta(measurements, "weight", s.profile.massUnit)}</span></div>${miniChart(measurements, "weight", false, s.profile.massUnit)}</div>` : empty("Sua evolução começa com um registro", "Adicione seu peso ou suas medidas. Só você preenche essas informações.", btn("Registrar peso e medidas", "new-measure", "plus", "primary"), "scale")}</section></div>
  <section><div class="section-head"><h2>Seus últimos treinos</h2><button class="text-btn" type="button" data-action="history">Ver histórico ${icon("arrow")}</button></div>${recent.length ? `<div class="card recent-list">${recent.map((h) => `<div class="recent-item"><span class="workout-letter">${icon("dumbbell")}</span><div class="grow"><h3>${esc(h.name)}${h.group ? ` <span class="muted">· ${esc(h.group)}</span>` : ""}</h3><p>${h.exercises.filter((e) => e.done).length} exercícios concluídos · ${duration(h.duration)}</p></div><div class="right"><b>${dateFmt(h.date)}</b><span>${dateFmt(h.date, { weekday: "long" })}</span></div><button type="button" class="icon-btn" data-action="history-detail" data-id="${esc(h.id)}" aria-label="Ver detalhes de ${esc(h.name)} em ${dateFmt(h.date)}">${icon("chevron")}</button></div>`).join("")}</div>` : empty("Nenhum treino realizado ainda", "Ao finalizar seu primeiro treino, ele será salvo aqui.", btn("Ver treinos", "workouts", "dumbbell"), "history")}</section>`;
}
export function workouts(s) {
  return `${head("Seu plano, seu ritmo", "Seu plano de treino", "Organize seus exercícios. Faça cada repetição contar.", btn("Novo treino", "new-workout", "plus", "primary"))}<div class="workout-grid">${
    s.workouts.length
      ? s.workouts
          .map(
            (w) =>
              `<article class="card workout-card"><div class="row between"><span class="workout-letter">${icon("dumbbell")}</span><div class="row gap-sm"><button type="button" class="icon-btn" data-action="edit-workout" data-id="${esc(w.id)}" aria-label="Editar ${esc(w.name)}">${icon("edit")}</button><button type="button" class="icon-btn" data-action="delete-workout" data-id="${esc(w.id)}" aria-label="Excluir ${esc(w.name)}">${icon("trash")}</button></div></div><h2>${esc(w.name)}</h2><p class="group">${esc(w.group) || "Grupo muscular não informado"}</p><div class="row between mt"><span class="badge">${w.days.length ? w.days.map((d) => days[d]).join(" · ") : "Dias livres"}</span><span class="small muted">${w.exercises.length} exercícios</span></div><ul class="exercise-preview">${w.exercises
                .slice(0, 4)
                .map(
                  (e) =>
                    `<li><span>${esc(e.name)}</span><b>${e.sets} × ${e.reps}</b></li>`,
                )
                .join(
                  "",
                )}${w.exercises.length > 4 ? `<li>+ ${w.exercises.length - 4} exercícios</li>` : ""}${!w.exercises.length ? "<li>Adicione exercícios para começar.</li>" : ""}</ul>${w.notes ? `<p class="helper mb">${esc(w.notes)}</p>` : ""}<div class="actions">${btn(s.active?.workoutId === w.id ? "Continuar treino" : "Começar treino", "start", "play", "primary full", `data-id="${esc(w.id)}" ${!w.exercises.length ? "disabled" : ""}`)}</div></article>`,
          )
          .join("")
      : empty(
          "Um plano feito por você",
          "Crie seu primeiro treino e adicione os exercícios indicados pelo seu professor.",
          btn("Criar treino", "new-workout", "plus", "primary"),
        )
  }</div>`;
}
export function session(s, restSeconds = 60) {
  const a = s.active;
  if (!a)
    return (
      head("Treinos", "Tudo pronto para começar") +
      empty(
        "Nenhum treino em andamento",
        "Escolha seu treino e dê o primeiro passo.",
        btn("Ver treinos", "workouts", "dumbbell", "primary"),
      )
    );
  const done = a.exercises.filter((e) => e.done).length,
    p = Math.round((done / a.exercises.length) * 100),
    mu = s.profile.massUnit;
  return `<div class="session-head"><button type="button" class="icon-btn" data-action="workouts" aria-label="Voltar para treinos">${icon("back")}</button><div class="grow"><div class="eyebrow muted">Seu momento de evoluir</div><h1>${esc(a.name)}</h1><p class="small muted">${esc(a.group)}</p></div></div><div class="session-tools"><div class="row">${icon("timer")}<span class="session-clock" id="session-clock">${clock(elapsed(a))}</span></div><div class="row gap-sm">${btn(a.paused ? "Retomar treino" : "Pausar treino", "pause", a.paused ? "play" : "pause", "")}${btn("Reiniciar", "restart", "restart", "quiet")}</div></div>${a.paused ? '<div class="pause-banner">Treino pausado. Seu tempo está preservado.</div>' : ""}<div class="session-layout"><section aria-label="Exercícios do treino">${a.exercises.map((e, i) => `<article class="card exercise-card ${e.done ? "completed" : ""}" data-ex="${i}"><div class="exercise-header"><span class="exercise-number">${e.done ? icon("check") : String(i + 1).padStart(2, "0")}</span><div class="grow"><h3>${esc(e.name)}</h3><p>Planejado: ${e.sets} séries × ${e.reps} reps · ${display(e.load, mu)} ${mu} · ${e.rest}s descanso</p></div></div>${e.notes ? `<p class="helper">${esc(e.notes)}</p>` : ""}<table class="sets-table"><thead><tr><th scope="col">Série</th><th scope="col">Carga (${mu})</th><th scope="col">Repetições</th><th scope="col">Feita</th></tr></thead><tbody>${e.actualSets.map((set, j) => `<tr><td>${j + 1}</td><td><input type="number" inputmode="decimal" min="0" max="${toDisplay(2000, mu)}" step="0.1" value="${Math.round(toDisplay(set.load, mu) * 10) / 10}" data-session-input="load" data-ex="${i}" data-set="${j}" aria-label="Carga da série ${j + 1}" ${a.paused ? "disabled" : ""}></td><td><input type="number" inputmode="numeric" min="0" max="1000" step="1" value="${set.reps}" data-session-input="reps" data-ex="${i}" data-set="${j}" aria-label="Repetições da série ${j + 1}" ${a.paused ? "disabled" : ""}></td><td><input type="checkbox" data-session-input="setdone" data-ex="${i}" data-set="${j}" aria-label="Marcar série ${j + 1} como realizada" ${set.done ? "checked" : ""} ${a.paused ? "disabled" : ""}></td></tr>`).join("")}</tbody></table><div class="row between"><button type="button" class="text-btn" data-action="add-set" data-index="${i}" ${a.paused || e.actualSets.length >= 30 ? "disabled" : ""}>${icon("plus")} Adicionar série</button><button type="button" class="text-btn" data-action="rest-for" data-index="${i}" ${a.paused ? "disabled" : ""}>${icon("timer")} Descansar ${e.rest}s</button></div><details class="exercise-extras"><summary>Observações e esforço (opcional) ${icon("chevron")}</summary><div class="form-grid"><label class="field">Observações<textarea data-session-input="actualNotes" data-ex="${i}" maxlength="2000" placeholder="Como foi este exercício?">${esc(e.actualNotes)}</textarea></label><label class="field">Esforço percebido<select data-session-input="effort" data-ex="${i}"><option value="">Não informar</option>${Array.from({ length: 10 }, (_, j) => `<option value="${j + 1}" ${e.effort === j + 1 ? "selected" : ""}>${j + 1} / 10${j === 0 ? " — Leve" : j === 9 ? " — Máximo" : ""}</option>`).join("")}</select></label></div></details>${btn(e.done ? "Exercício concluído — desfazer" : "Concluir exercício", "toggle-ex", "check", `${e.done ? "" : "primary"} full`, `data-index="${i}" ${a.paused ? "disabled" : ""}`)}</article>`).join("")}<div class="card session-notes-mobile"><label class="field">Observações do treino<textarea data-session-input="session-notes" maxlength="2000" placeholder="Como você se sentiu?">${esc(a.notes)}</textarea></label></div></section><aside class="stack session-overview"><div class="card"><div class="row between"><h2>Seu progresso</h2><strong class="small">${p}%</strong></div><div class="session-progress"><p class="small muted">${done} de ${a.exercises.length} exercícios concluídos</p>${progress(p)}</div>${btn("Finalizar treino", "finish", "check", "navy full")}${btn("Descartar treino", "discard", "", "quiet full")}</div><div class="card rest-card"><h2>${icon("timer")} Hora de recuperar</h2><div class="rest-time" id="rest-clock">${clock(a.rest ? Math.ceil((a.rest.endAt ? Math.max(0, a.rest.endAt - Date.now()) : a.rest.remaining || 0) / 1000) : restSeconds)}</div><p class="small muted" id="rest-status">${a.rest ? "Descanso em andamento" : "Escolha seu intervalo"}</p><div class="rest-choices">${[30, 60, 90, 120].map((n) => `<button type="button" class="${restSeconds === n ? "selected" : ""}" data-action="choose-rest" data-seconds="${n}" aria-pressed="${restSeconds === n}">${n}s</button>`).join("")}</div>${btn(a.rest ? "Reiniciar descanso" : "Iniciar descanso", "rest", "play", "primary full", a.paused ? "disabled" : "")}${a.rest ? btn("Cancelar descanso", "cancel-rest", "", "quiet full") : ""}<p class="helper">${icon("volume")} Alerta visual e sonoro ao terminar. Mantenha o app aberto para ouvir o aviso; celulares podem suspender sons em segundo plano.</p></div><div class="card session-notes"><label class="field">Observações do treino<textarea data-session-input="session-notes" maxlength="2000" placeholder="Como você se sentiu?">${esc(a.notes)}</textarea></label></div></aside></div>`;
}
export function history(s, f = {}) {
  const rows = [...s.history]
    .filter(
      (h) =>
        (!f.workout || h.workoutId === f.workout) &&
        (!f.group || h.group === f.group) &&
        (!f.from || h.date >= f.from) &&
        (!f.to || h.date <= f.to),
    )
    .sort((a, b) => b.date.localeCompare(a.date));
  const allWorkouts = [
    ...new Map(
      [
        ...s.workouts,
        ...s.history.map((h) => ({ id: h.workoutId, name: h.name })),
      ].map((w) => [w.id, w]),
    ).values(),
  ];
  return `${head("Cada treino conta", "Sua jornada até aqui", "Revisite suas sessões e reconheça o seu esforço.")}<div class="filters" aria-label="Filtros do histórico"><label>Treino<select data-filter="workout"><option value="">Todos os treinos</option>${allWorkouts.map((w) => `<option value="${esc(w.id)}" ${f.workout === w.id ? "selected" : ""}>${esc(w.name)}</option>`).join("")}</select></label><label>Grupo muscular<select data-filter="group"><option value="">Todos os grupos</option>${[...new Set(s.history.map((h) => h.group))].map((g) => `<option ${f.group === g ? "selected" : ""}>${esc(g)}</option>`).join("")}</select></label><label>De<input type="date" data-filter="from" value="${esc(f.from || "")}"></label><label>Até<input type="date" data-filter="to" value="${esc(f.to || "")}"></label>${btn("Limpar", "clear-filters", "", "quiet")}</div><p class="helper mb">${rows.length} ${rows.length === 1 ? "treino encontrado" : "treinos encontrados"}</p>${rows.length ? rows.map((h) => `<button type="button" class="card history-card" data-action="history-detail" data-id="${esc(h.id)}"><span class="date-box"><strong>${dateFmt(h.date, { day: "2-digit" })}</strong><small>${dateFmt(h.date, { month: "short" })}</small></span><div class="grow"><h3>${esc(h.name)} <span class="muted">· ${esc(h.group)}</span></h3><p>${h.exercises.filter((e) => e.done).length}/${h.exercises.length} exercícios · ${duration(h.duration)} · ${dateFmt(h.date, { year: "numeric" })}</p></div>${icon("chevron")}</button>`).join("") : empty("Nenhum treino por aqui", "Seu histórico aparece quando você finaliza um treino. Se houver filtros, tente um período diferente.", btn("Ver treinos", "workouts", "dumbbell", "primary"), "history")}`;
}
export function goals(s) {
  return `${head("Um objetivo de cada vez", "Pequenos passos. Grandes conquistas.", "Acompanhe o que importa para você, sem se comparar.", btn("Nova meta", "new-goal", "plus", "primary"))}<div class="goal-grid">${s.goals.length ? s.goals.map((g) => goalCard(g, s)).join("") : empty("Toda conquista começa com uma meta", "Defina um objetivo possível e acompanhe o seu progresso.", btn("Criar meta", "new-goal", "plus", "primary"), "target")}</div><p class="helper mt">O progresso das metas é atualizado por você. Seu ritmo é o que importa.</p>`;
}
export function evolution(s, period = 90, metric = "weight") {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - period);
  const today = localDate();
  const records = s.measurements
    .filter(
      (m) => (period === 0 || m.date >= localDate(cutoff)) && m.date <= today,
    )
    .sort((a, b) => a.date.localeCompare(b.date));
  const relevant = records.filter((m) => m[metric] != null),
    last = relevant.at(-1),
    unit = metric === "weight" ? s.profile.massUnit : s.profile.lengthUnit;
  return `${head("Além do espelho", "Sua evolução, no seu tempo", "Mais do que números: uma história de cuidado com você.", btn("Novo registro", "new-measure", "plus", "primary"))}<div class="filters"><label>Período<select data-evolution="period">${[
    [30, "Últimos 30 dias"],
    [90, "Últimos 90 dias"],
    [180, "Últimos 6 meses"],
    [0, "Todo o período"],
  ]
    .map(
      ([v, t]) =>
        `<option value="${v}" ${period === v ? "selected" : ""}>${t}</option>`,
    )
    .join(
      "",
    )}</select></label><label>Medida<select data-evolution="metric">${Object.entries(
    measures,
  )
    .map(
      ([k, n]) =>
        `<option value="${k}" ${metric === k ? "selected" : ""}>${n}</option>`,
    )
    .join(
      "",
    )}</select></label></div><div class="chart-layout"><section class="card"><div class="chart-header"><div><p class="small muted">${measures[metric]}</p><div class="weight-number">${last ? display(last[metric], unit) : "—"} <span>${unit}</span></div>${last ? `<p class="helper">Último registro: ${dateFmt(last.date)}</p>` : ""}</div><span class="delta">${delta(records, metric, unit)}</span></div>${relevant.length ? miniChart(records, metric, true, unit) : empty("Seu primeiro registro faz a diferença", "Registre uma medida neste período para começar a visualizar seu gráfico.", "", "chart")}</section><section class="card"><h2>Comparativo recente</h2><p class="helper">Atual e anterior de cada medida no período.</p><div class="measure-list">${Object.entries(
    measures,
  )
    .map(([k, n]) => {
      const r = records.filter((m) => m[k] != null),
        m = r.at(-1),
        u = k === "weight" ? s.profile.massUnit : s.profile.lengthUnit;
      return `<div class="measure-row"><div><span>${n}</span><small>${delta(records, k, u)}</small></div><strong>${m ? display(m[k], u) : "—"} <small>${u}</small></strong></div>`;
    })
    .join(
      "",
    )}</div></section></div><div class="section-head"><h2>Seus registros</h2><span class="small muted">${records.length} registros no período</span></div>${
    records.length
      ? `<div class="card table-scroll"><table class="measure-table"><thead><tr><th scope="col">Data</th>${Object.entries(
          measures,
        )
          .map(
            ([k, n]) =>
              `<th scope="col">${n} (${k === "weight" ? s.profile.massUnit : s.profile.lengthUnit})</th>`,
          )
          .join("")}<th scope="col">Ações</th></tr></thead><tbody>${[...records]
          .reverse()
          .map(
            (m) =>
              `<tr><td>${dateFmt(m.date)}</td>${Object.keys(measures)
                .map(
                  (k) =>
                    `<td>${m[k] != null ? display(m[k], k === "weight" ? s.profile.massUnit : s.profile.lengthUnit) : "—"}</td>`,
                )
                .join(
                  "",
                )}<td><div class="measurement-actions"><button type="button" class="icon-btn" data-action="edit-measure" data-id="${esc(m.id)}" aria-label="Editar registro de ${dateFmt(m.date)}">${icon("edit")}</button><button type="button" class="icon-btn" data-action="delete-measure" data-id="${esc(m.id)}" aria-label="Excluir registro de ${dateFmt(m.date)}">${icon("trash")}</button></div></td></tr>`,
          )
          .join("")}</tbody></table></div>`
      : empty(
          "Ainda sem registros neste período",
          "Adicione seu peso ou uma medida corporal. Cada registro ajuda a enxergar sua evolução.",
          btn("Registrar agora", "new-measure", "plus", "primary"),
          "scale",
        )
  }<p class="helper mt">Ganhos, perdas e estabilidade são variações numéricas, não avaliações de saúde. Procure orientação profissional para interpretar suas medidas.</p>`;
}
export function profile(s, canInstall = false, corrupt = false) {
  return `${head("Do seu jeito", "Seu espaço, suas escolhas", "Personalize o app e mantenha seus dados seguros.")}<div class="profile-grid"><div class="stack"><section class="card"><h2>Sobre você</h2><form id="profile-form" class="mt"><div class="stack"><label class="field">Nome ou apelido<input name="name" maxlength="80" value="${esc(s.profile.name)}" placeholder="Como podemos chamar você?" autocomplete="nickname"></label><div class="form-grid"><label class="field">Unidade de peso<select name="massUnit"><option value="kg" ${s.profile.massUnit === "kg" ? "selected" : ""}>Quilogramas (kg)</option><option value="lb" ${s.profile.massUnit === "lb" ? "selected" : ""}>Libras (lb)</option></select></label><label class="field">Unidade de medidas<select name="lengthUnit"><option value="cm" ${s.profile.lengthUnit === "cm" ? "selected" : ""}>Centímetros (cm)</option><option value="in" ${s.profile.lengthUnit === "in" ? "selected" : ""}>Polegadas (in)</option></select></label></div><p class="helper">As unidades são convertidas. Seus registros originais são preservados.</p><button type="submit" class="btn primary">Salvar perfil</button></div></form><div class="settings-row"><div><h3>Modo escuro</h3><p>Mais conforto para os seus olhos.</p></div><button type="button" class="switch" role="switch" aria-checked="${s.profile.dark}" aria-label="Modo escuro" data-action="theme"></button></div></section><section class="card"><h2>Seus objetivos</h2><div class="settings-row"><div><h3>${s.goals.filter((g) => !g.done).length} metas em andamento</h3><p>Uma direção para a sua constância.</p></div></div>${btn("Minhas metas", "goals", "target", "full")}</section><section class="card install-panel"><h2>Seu treino, sempre à mão</h2><p>Adicione o Meu Treino à tela inicial do celular e abra como um aplicativo.</p>${btn(canInstall ? "Instalar aplicativo" : "Como instalar", "install", "download", "primary")}</section></div><div class="stack"><section class="card"><h2>Seus dados são seus</h2><p class="helper">Sem conta, sem nuvem, sem envio de informações.</p><div class="privacy-note">${icon("shield")}<div>Os dados ficam somente neste navegador e dispositivo. Limpar os dados do navegador ou trocar de celular pode apagar seu histórico. Exporte backups regularmente.</div></div><div class="settings-row"><div><h3>Exportar todos os dados</h3><p>Salve um backup completo em JSON.</p></div>${btn("Exportar backup", "export", "download")}</div><div class="settings-row"><div><h3>Restaurar um backup</h3><p>A importação substitui os dados atuais.</p></div>${btn("Importar backup", "import", "upload")}</div>${corrupt ? btn("Exportar arquivo original", "export-raw", "download", "full") : ""}</section><section class="card"><h2>Recomeçar com cuidado</h2><div class="settings-row"><div><h3>Apagar todos os dados</h3><p>Remove perfil, treinos, histórico, medidas e metas. Esta ação não pode ser desfeita.</p></div></div>${btn("Apagar todos os dados", "reset", "trash", "danger full")}</section><p class="helper">Meu Treino · versão 1.0<br>Seu ritmo. Sua evolução.</p></div></div>`;
}
export function historyDetail(h, s) {
  return `<p class="modal-description">${esc(h.group)} · ${dateFmt(h.date, { day: "2-digit", month: "long", year: "numeric" })}</p><div class="summary-stats"><div><strong>${h.exercises.filter((e) => e.done).length}/${h.exercises.length}</strong><p>exercícios concluídos</p></div><div><strong>${duration(h.duration)}</strong><p>duração do treino</p></div></div>${h.notes ? `<p class="helper">${esc(h.notes)}</p>` : ""}<div class="history-detail">${h.exercises.map((e) => `<div class="detail-ex"><div class="row between"><h3>${esc(e.name)}</h3><span class="badge">${e.done ? "Concluído" : "Parcial"}</span></div><div class="detail-sets">${e.actualSets.map((a) => `<span>${a.done ? "✓ " : ""}${display(a.load, s.profile.massUnit)} ${s.profile.massUnit} × ${a.reps} reps</span>`).join("")}</div><p>${e.actualSets.filter((a) => a.done).length} séries realizadas${e.effort ? ` · Esforço: ${e.effort}/10` : ""}</p>${e.actualNotes ? `<p>${esc(e.actualNotes)}</p>` : ""}</div>`).join("")}</div>`;
}
