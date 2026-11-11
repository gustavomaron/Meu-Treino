import * as C from "./core.js";
import * as U from "./ui.js";
const $ = (s, r = document) => r.querySelector(s),
  modal = $("#modal");
let state,
  corrupt = false,
  blocked = false,
  page = "home",
  restSeconds = 60,
  timer,
  installPrompt = null,
  audio,
  filters = {},
  period = 90,
  metric = "weight",
  focusReturn;
try {
  const raw = localStorage.getItem(C.STORAGE_KEY);
  state = raw
    ? C.parseBackup(
        JSON.stringify({
          app: "meu-treino",
          version: 1,
          data: JSON.parse(raw),
        }),
      )
    : C.createState();
} catch {
  corrupt = true;
  blocked = true;
  state = C.createState();
}
if (state.active) page = "session";
function toast(text, error = false) {
  clearTimeout(timer);
  $("#toast").textContent = text;
  $("#toast").className = "show" + (error ? " error" : "");
  timer = setTimeout(() => ($("#toast").className = ""), 5000);
}
function save(next) {
  if (corrupt) {
    toast(
      "Dados locais ilegíveis. Exporte o arquivo original no Perfil antes de redefinir.",
      true,
    );
    return false;
  }
  try {
    localStorage.setItem(C.STORAGE_KEY, JSON.stringify(next));
    state = next;
    blocked = false;
    return true;
  } catch {
    blocked = true;
    toast("Não foi possível salvar. Exporte um backup antes de sair.", true);
    return false;
  }
}
function commit(fn, redraw = true) {
  const next = structuredClone(state);
  fn(next);
  if (!save(next)) return false;
  if (redraw) render();
  return true;
}
function render() {
  document.body.classList.toggle("dark", state.profile.dark);
  const screens = {
    home: () => U.home(state),
    workouts: () => U.workouts(state),
    history: () => U.history(state, filters),
    session: () => U.session(state, restSeconds),
    evolution: () => U.evolution(state, period, metric),
    goals: () => U.goals(state),
    profile: () => U.profile(state, !!installPrompt, corrupt),
  };
  $("#app").innerHTML = U.shell(state, page, screens[page]());
  if (blocked) {
    const p = document.createElement("p");
    p.className = "pause-banner";
    p.textContent =
      "Armazenamento indisponível. Exporte seus dados no Perfil antes de sair.";
    $("#main").prepend(p);
  }
  tick();
}
function go(p) {
  page = p;
  render();
  window.scrollTo(0, 0);
  $("#main").focus({ preventScroll: true });
}
function show(title, html, wide = false) {
  focusReturn = document.activeElement;
  modal.className = wide ? "wide-modal" : "";
  modal.innerHTML = `<header class="modal-head"><h2 id="modal-title">${U.esc(title)}</h2><button type="button" class="icon-btn" data-action="close" aria-label="Fechar janela">${U.icon("close")}</button></header>${html}`;
  if (!modal.open) modal.showModal();
  modal.scrollTop = 0;
}
modal.addEventListener("close", () => {
  if (focusReturn?.isConnected) focusReturn.focus({ preventScroll: true });
});
function confirm(title, text, label, fn) {
  show(
    title,
    `<p class="modal-description">${U.esc(text)}</p><div class="form-actions">${U.btn("Cancelar", "close")}${U.btn(label, "confirm", "", "danger")}</div>`,
  );
  $('[data-action="confirm"]', modal).onclick = () => {
    if (fn() !== false) modal.close();
  };
}
const txt = (n, l, v = "", required = true, max = 120) =>
  `<label class="field">${l}<input name="${n}" value="${U.esc(v)}" maxlength="${max}" ${required ? "required" : ""}></label>`;
const num = (n, l, v, min = 0, max = 10000, step = ".1") =>
  `<label class="field">${l}<input type="number" name="${n}" inputmode="${step === "1" ? "numeric" : "decimal"}" min="${min}" max="${max}" step="${step}" value="${U.esc(v)}" required></label>`;
const bottom = (label) =>
  `<p class="form-error" role="alert"></p><div class="form-actions">${U.btn("Cancelar", "close")}<button class="btn primary" type="submit">${label}</button></div>`;
function exerciseForm(e, i) {
  const unit = state.profile.massUnit;
  return `<section class="exercise-editor" data-id="${U.esc(e.id)}"><header><h3>Exercício ${i + 1}</h3><button type="button" class="icon-btn" data-action="remove-exercise" aria-label="Remover exercício ${i + 1}">${U.icon("trash")}</button></header><div class="form-grid"><div class="wide">${txt("exerciseName", "Nome do exercício", e.name)}</div>${num("sets", "Séries", e.sets, 1, 30, "1")}${num("reps", "Repetições planejadas", e.reps, 1, 1000, "1")}${num("load", `Carga planejada (${unit})`, Math.round(C.toDisplay(e.load, unit) * 10) / 10, 0, C.toDisplay(2000, unit))}${num("rest", "Descanso (segundos)", e.rest, 0, 3600, "1")}<label class="field wide">Observações do exercício<textarea name="exerciseNotes" maxlength="2000">${U.esc(e.notes)}</textarea></label></div></section>`;
}
const newExercise = () => ({
  id: C.uid(),
  name: "",
  sets: 3,
  reps: 12,
  load: 0,
  rest: 60,
  notes: "",
});
function workoutForm(id) {
  const w = state.workouts.find((w) => w.id === id) || {
    id: C.uid(),
    name: "",
    group: "",
    days: [],
    notes: "",
    exercises: [newExercise()],
  };
  show(
    id ? "Editar treino" : "Novo treino",
    `<form id="workout-form"><div class="form-grid">${txt("name", "Nome do treino", w.name)}${txt("group", "Grupo muscular", w.group, false)}<div class="wide"><p class="small mb">Dias da semana</p><div class="day-picker">${U.days.map((d, i) => `<label><input type="checkbox" name="day" value="${i}" ${w.days.includes(i) ? "checked" : ""}><span>${d}</span></label>`).join("")}</div><p class="helper">Não marcar dias = frequência livre.</p></div><label class="field wide">Observações do treino<textarea name="notes" maxlength="2000">${U.esc(w.notes)}</textarea></label></div><div class="form-section-title"><h3>Exercícios</h3><span class="small muted">Na ordem do treino</span></div><div id="exercise-editors">${w.exercises.map(exerciseForm).join("")}</div>${U.btn("Adicionar exercício", "add-exercise", "plus", "full mt")}${bottom("Salvar treino")}</form>`,
    true,
  );
  $("#workout-form").onsubmit = (e) => {
    e.preventDefault();
    const f = e.currentTarget;
    try {
      const d = new FormData(f),
        name = d.get("name").trim();
      if (!name) throw Error("Informe o nome do treino.");
      const exercises = [...f.querySelectorAll(".exercise-editor")].map(
        (el) => {
          const val = (n) => $(`[name="${n}"]`, el).value;
          const name = val("exerciseName").trim();
          if (!name) throw Error("Informe o nome de todos os exercícios.");
          return {
            id: el.dataset.id,
            name,
            sets: C.numeric(val("sets"), 1, 30, true),
            reps: C.numeric(val("reps"), 1, 1000, true),
            load: C.numeric(
              C.toCanonical(
                C.numeric(
                  val("load"),
                  0,
                  C.toDisplay(2000, state.profile.massUnit),
                ),
                state.profile.massUnit,
              ),
              0,
              2000,
            ),
            rest: C.numeric(val("rest"), 0, 3600, true),
            notes: val("exerciseNotes"),
          };
        },
      );
      const next = {
        id: w.id,
        name,
        group: d.get("group").trim(),
        days: d.getAll("day").map(Number),
        notes: d.get("notes"),
        exercises,
      };
      if (
        commit((s) => {
          const i = s.workouts.findIndex((x) => x.id === w.id);
          if (i >= 0) s.workouts[i] = next;
          else s.workouts.push(next);
        })
      ) {
        modal.close();
        toast("Treino salvo. Seu próximo passo está pronto.");
      }
    } catch (err) {
      $(".form-error", f).textContent = err.message;
    }
  };
}
function start(id) {
  if (state.active) {
    if (state.active.workoutId !== id)
      toast(
        "Já existe um treino em andamento. Finalize ou descarte antes de trocar.",
      );
    go("session");
    return;
  }
  const w = state.workouts.find((w) => w.id === id);
  if (!w?.exercises.length)
    return toast("Adicione ao menos um exercício ao treino.", true);
  if (commit((s) => (s.active = C.startSession(w)), false)) go("session");
}
function unlockAudio() {
  try {
    audio ||= new (window.AudioContext || window.webkitAudioContext)();
    audio.resume().catch(() => {});
  } catch {}
}
function rest(seconds = restSeconds) {
  if (!state.active || state.active.paused) return;
  unlockAudio();
  restSeconds = seconds || 60;
  commit(
    (s) =>
      (s.active.rest = {
        seconds: restSeconds,
        endAt: Date.now() + restSeconds * 1000,
        remaining: null,
      }),
  );
}
function beep() {
  try {
    if (!audio) return;
    for (let i = 0; i < 3; i++) {
      const o = audio.createOscillator(),
        g = audio.createGain(),
        t = audio.currentTime + i * 0.25;
      o.frequency.value = 740;
      g.gain.setValueAtTime(0.15, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      o.connect(g);
      g.connect(audio.destination);
      o.start(t);
      o.stop(t + 0.22);
    }
  } catch {}
}
function tick() {
  const a = state.active;
  if (!a) return;
  if ($("#session-clock"))
    $("#session-clock").textContent = U.clock(C.elapsed(a));
  const r = a.rest;
  if (!r) return;
  const remain = Math.max(
    0,
    Math.ceil((r.endAt ? r.endAt - Date.now() : r.remaining || 0) / 1000),
  );
  if ($("#rest-clock")) $("#rest-clock").textContent = U.clock(remain);
  if ($("#rest-status"))
    $("#rest-status").textContent = a.paused
      ? "Descanso pausado"
      : "Respire. Você está no caminho.";
  if (r.endAt && remain === 0) {
    if (!commit((s) => (s.active.rest = null), false)) return;
    if (page === "session") render();
    $("#rest-alert").hidden = false;
    $("#rest-alert").innerHTML =
      `${U.icon("timer")} Descanso concluído. Próxima série! ${U.btn("Entendi", "dismiss-rest", "check")}`;
    beep();
    navigator.vibrate?.([180, 100, 180]);
  }
}
setInterval(tick, 250);
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) tick();
});
function finishPrompt() {
  const a = state.active,
    n = a.exercises.filter((e) => e.done).length;
  show(
    "Finalizar este treino?",
    `<p class="modal-description">${n} de ${a.exercises.length} exercícios concluídos. ${n < a.exercises.length ? "O treino parcial também pode ser salvo." : "Cada repetição fez a diferença."}</p><label class="field">Observações finais<textarea id="finish-notes" maxlength="2000">${U.esc(a.notes)}</textarea></label><div class="form-actions">${U.btn("Voltar ao treino", "close")}${U.btn("Salvar no histórico", "save-session", "check", "primary")}</div>`,
  );
}
function finish() {
  const h = C.finishSession({
    ...state.active,
    notes: $("#finish-notes").value,
  });
  if (
    !commit((s) => {
      s.history.push(h);
      s.active = null;
    }, false)
  )
    return;
  page = "history";
  render();
  show(
    "Treino concluído!",
    `<p class="modal-description">Você apareceu por você. Isso já é uma conquista.</p>${U.historyDetail(h, state)}<div class="form-actions">${U.btn("Ver histórico", "summary-history", "arrow", "primary")}</div>`,
  );
}
function sessionInput(el) {
  const kind = el.dataset.sessionInput;
  if (!kind || !state.active) return;
  try {
    let v;
    if (kind === "setdone") v = el.checked;
    else if (kind === "load")
      v = C.numeric(
        C.toCanonical(
          C.numeric(el.value, 0, C.toDisplay(2000, state.profile.massUnit)),
          state.profile.massUnit,
        ),
        0,
        2000,
      );
    else if (kind === "reps") v = C.numeric(el.value, 0, 1000, true);
    else if (kind === "effort")
      v = el.value === "" ? "" : C.numeric(el.value, 1, 10, true);
    else v = el.value.slice(0, 2000);
    el.setCustomValidity("");
    commit((s) => {
      if (kind === "session-notes") s.active.notes = v;
      else {
        const e = s.active.exercises[Number(el.dataset.ex)];
        if (["load", "reps", "setdone"].includes(kind)) {
          e.actualSets[Number(el.dataset.set)][
            kind === "setdone" ? "done" : kind
          ] = v;
          if (kind === "setdone") e.done = e.actualSets.every((x) => x.done);
        } else e[kind] = v;
      }
    }, kind === "setdone");
  } catch (err) {
    el.setCustomValidity(err.message);
    el.reportValidity();
  }
}
document.addEventListener("input", (e) => {
  if (
    e.target.matches("[data-session-input]") &&
    !["checkbox", "select-one"].includes(e.target.type)
  )
    sessionInput(e.target);
});
document.addEventListener("change", (e) => {
  const t = e.target;
  if (t.matches("[data-session-input]")) sessionInput(t);
  if (t.dataset.filter) {
    filters[t.dataset.filter] = t.value;
    render();
  }
  if (t.dataset.evolution) {
    if (t.dataset.evolution === "period") period = Number(t.value);
    else metric = t.value;
    render();
  }
});
document.addEventListener("click", async (e) => {
  const el = e.target.closest("[data-action],[data-page]");
  if (!el || el.disabled) return;
  const a = el.dataset.action || el.dataset.page,
    id = el.dataset.id,
    i = Number(el.dataset.index);
  try {
    if (a === "close") {
      modal.close();
      return;
    }
    if (a === "confirm") return;
    if (a === "theme") {
      commit((s) => (s.profile.dark = !s.profile.dark));
      return;
    }
    if (U.names[a]) {
      go(a);
      return;
    }
    switch (a) {
      case "new-workout":
        workoutForm();
        break;
      case "edit-workout":
        workoutForm(id);
        break;
      case "add-exercise": {
        const r = $("#exercise-editors");
        if (r.children.length >= 100)
          return toast("Limite de 100 exercícios.", true);
        r.insertAdjacentHTML(
          "beforeend",
          exerciseForm(newExercise(), r.children.length),
        );
        r.lastElementChild.querySelector("input").focus();
        break;
      }
      case "remove-exercise":
        el.closest(".exercise-editor").remove();
        break;
      case "delete-workout":
        confirm(
          "Excluir treino?",
          "Seu plano será removido. As sessões já realizadas continuam no histórico.",
          "Excluir treino",
          () =>
            commit((s) => (s.workouts = s.workouts.filter((w) => w.id !== id))),
        );
        break;
      case "start":
        start(id);
        break;
      case "pause":
        commit((s) =>
          s.active.paused
            ? C.resumeSession(s.active)
            : C.pauseSession(s.active),
        );
        break;
      case "restart":
        confirm(
          "Reiniciar treino?",
          "O tempo e os registros desta sessão serão zerados. Seu plano não será alterado.",
          "Reiniciar",
          () => commit((s) => C.restartSession(s.active)),
        );
        break;
      case "discard":
        confirm(
          "Descartar treino?",
          "Esta sessão não será salva. Seu plano continuará disponível.",
          "Descartar treino",
          () => {
            if (!commit((s) => (s.active = null), false)) return false;
            go("workouts");
          },
        );
        break;
      case "toggle-ex":
        commit((s) => {
          const e = s.active.exercises[i];
          e.done = !e.done;
          e.actualSets.forEach((a) => (a.done = e.done));
        });
        break;
      case "add-set":
        commit((s) => {
          const e = s.active.exercises[i];
          if (e.actualSets.length < 30) {
            e.actualSets.push({ load: e.load, reps: e.reps, done: false });
            e.done = false;
          }
        });
        break;
      case "choose-rest":
        restSeconds = Number(el.dataset.seconds);
        render();
        break;
      case "rest":
        rest();
        break;
      case "rest-for":
        rest(state.active.exercises[i].rest || 60);
        break;
      case "cancel-rest":
        commit((s) => (s.active.rest = null));
        break;
      case "dismiss-rest":
        $("#rest-alert").hidden = true;
        break;
      case "finish":
        finishPrompt();
        break;
      case "save-session":
        finish();
        break;
      case "summary-history":
        modal.close();
        go("history");
        break;
      case "history-detail": {
        const h = state.history.find((h) => h.id === id);
        if (h) show(h.name, U.historyDetail(h, state));
        break;
      }
      case "clear-filters":
        filters = {};
        render();
        break;
      default:
        await extra(a, id, el);
    }
  } catch (err) {
    toast(err.message || "Não foi possível realizar esta ação.", true);
  }
});
function measureForm(id) {
  const m = state.measurements.find((m) => m.id === id) || {
    id: C.uid(),
    date: C.localDate(),
  };
  show(
    id ? "Editar registro" : "Novo registro",
    `<form id="measure-form"><label class="field mb">Data do registro<input type="date" name="date" required max="${C.localDate()}" value="${U.esc(m.date)}"></label><p class="helper mb">Preencha pelo menos uma medida. Deixe em branco o que não quiser registrar.</p><div class="form-grid">${Object.entries(
      U.measures,
    )
      .map(([k, n]) => {
        const unit =
          k === "weight" ? state.profile.massUnit : state.profile.lengthUnit;
        return `<label class="field">${n} (${unit})<input type="number" name="${k}" min="0.1" max="${C.toDisplay(1000, unit)}" step="0.1" inputmode="decimal" value="${m[k] != null ? Math.round(C.toDisplay(m[k], unit) * 10) / 10 : ""}" placeholder="Não informado"></label>`;
      })
      .join("")}</div>${bottom("Salvar registro")}</form>`,
  );
  $("#measure-form").onsubmit = (e) => {
    e.preventDefault();
    const f = e.currentTarget;
    try {
      const d = new FormData(f),
        date = d.get("date");
      if (!C.validDate(date) || date > C.localDate())
        throw Error("Informe uma data válida, até hoje.");
      const next = { id: m.id, date };
      let count = 0;
      for (const k of Object.keys(U.measures)) {
        const val = d.get(k);
        if (val !== "") {
          const unit =
            k === "weight" ? state.profile.massUnit : state.profile.lengthUnit;
          next[k] = C.numeric(
            C.toCanonical(C.numeric(val, 0.1, C.toDisplay(1000, unit)), unit),
            0.01,
            1000,
          );
          count++;
        } else next[k] = null;
      }
      if (!count)
        throw Error("Preencha pelo menos o peso ou uma medida corporal.");
      if (
        commit((s) => {
          const i = s.measurements.findIndex((x) => x.id === m.id);
          if (i < 0) s.measurements.push(next);
          else s.measurements[i] = next;
        })
      ) {
        modal.close();
        toast("Registro salvo. Cada passo conta.");
      }
    } catch (err) {
      $(".form-error", f).textContent = err.message;
    }
  };
}
function goalUnit(category) {
  return ["weight", "load"].includes(category)
    ? state.profile.massUnit
    : category === "measure"
      ? state.profile.lengthUnit
      : "treinos";
}
function goalFields(g) {
  const u = goalUnit(g.category),
    value = (v) =>
      u === "treinos" ? v : Math.round(C.toDisplay(v, u) * 100) / 100;
  return `<div class="form-grid">${num("initial", `Valor inicial (${u})`, value(g.initial), 0, C.toDisplay(10000, u), u === "treinos" ? "1" : ".01")}${num("target", `Valor desejado (${u})`, value(g.target), 0, C.toDisplay(10000, u), u === "treinos" ? "1" : ".01")}${num("current", `Valor atual (${u})`, value(g.current), 0, C.toDisplay(10000, u), u === "treinos" ? "1" : ".01")}<label class="field">Prazo (opcional)<input type="date" name="deadline" value="${U.esc(g.deadline)}"></label></div>`;
}
function goalForm(id) {
  const g = state.goals.find((g) => g.id === id) || {
    id: C.uid(),
    title: "",
    category: "total",
    initial: 0,
    target: 20,
    current: 0,
    deadline: "",
    done: false,
  };
  show(
    id ? "Editar meta" : "Nova meta",
    `<form id="goal-form"><div class="stack mb">${txt("title", "Título da meta", g.title)}<label class="field">Categoria<select name="category">${Object.entries(
      U.catNames,
    )
      .map(
        ([k, n]) =>
          `<option value="${k}" ${k === g.category ? "selected" : ""}>${n}</option>`,
      )
      .join(
        "",
      )}</select></label></div><div id="goal-values">${goalFields(g)}</div><p class="helper">Atualize o valor atual para acompanhar seu progresso. Para medidas e cargas, especifique no título (ex.: cintura ou supino).</p>${bottom("Salvar meta")}</form>`,
  );
  $('[name="category"]', modal).onchange = (e) => {
    $("#goal-values").innerHTML = goalFields({
      initial: 0,
      target: ["weight", "load", "measure"].includes(e.target.value) ? 80 : 3,
      current: 0,
      deadline: $('[name="deadline"]', modal)?.value || "",
      category: e.target.value,
    });
  };
  $("#goal-form").onsubmit = (e) => {
    e.preventDefault();
    const f = e.currentTarget;
    try {
      const d = new FormData(f),
        category = d.get("category"),
        u = goalUnit(category),
        read = (n) => {
          const v = C.numeric(
            d.get(n),
            0,
            C.toDisplay(10000, u),
            u === "treinos",
          );
          return C.numeric(u === "treinos" ? v : C.toCanonical(v, u), 0, 10000);
        };
      const initial = read("initial"),
        target = read("target"),
        current = read("current"),
        title = d.get("title").trim(),
        deadline = d.get("deadline");
      if (!title) throw Error("Informe um título para a meta.");
      if (initial === target)
        throw Error("O valor desejado deve ser diferente do valor inicial.");
      if (deadline && !C.validDate(deadline))
        throw Error("Informe um prazo válido.");
      const next = {
        id: g.id,
        title,
        category,
        initial,
        target,
        current,
        deadline,
        done: g.done,
      };
      if (
        commit((s) => {
          const i = s.goals.findIndex((x) => x.id === g.id);
          if (i < 0) s.goals.push(next);
          else s.goals[i] = next;
        })
      ) {
        modal.close();
        toast("Meta salva. Um objetivo de cada vez.");
      }
    } catch (err) {
      $(".form-error", f).textContent = err.message;
    }
  };
}
function download(content, name) {
  const url = URL.createObjectURL(
    new Blob([content], { type: "application/json" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
async function extra(a, id) {
  switch (a) {
    case "new-measure":
      measureForm();
      break;
    case "edit-measure":
      measureForm(id);
      break;
    case "delete-measure":
      confirm(
        "Excluir registro?",
        "Esta medida será removida da sua evolução.",
        "Excluir registro",
        () =>
          commit(
            (s) => (s.measurements = s.measurements.filter((m) => m.id !== id)),
          ),
      );
      break;
    case "new-goal":
      goalForm();
      break;
    case "edit-goal":
      goalForm(id);
      break;
    case "complete-goal":
      commit((s) => {
        const g = s.goals.find((g) => g.id === id);
        g.done = !g.done;
      });
      toast("Meta atualizada. Reconheça suas conquistas.");
      break;
    case "delete-goal":
      confirm(
        "Excluir meta?",
        "A meta será removida. Seus treinos e medidas não serão alterados.",
        "Excluir meta",
        () => commit((s) => (s.goals = s.goals.filter((g) => g.id !== id))),
      );
      break;
    case "export":
      download(
        JSON.stringify(
          {
            app: "meu-treino",
            version: 1,
            exportedAt: new Date().toISOString(),
            data: state,
          },
          null,
          2,
        ),
        `meu-treino-backup-${C.localDate()}.json`,
      );
      toast("Backup preparado. Guarde o arquivo em um lugar seguro.");
      break;
    case "export-raw":
      download(
        localStorage.getItem(C.STORAGE_KEY) || "",
        `meu-treino-original-${C.localDate()}.json`,
      );
      break;
    case "import":
      $("#import-file").click();
      break;
    case "clear-demo":
      confirm(
        "Remover dados de exemplo?",
        "Somente o histórico, medidas e metas demonstrativos serão removidos. Seus registros pessoais e os planos de treino serão mantidos.",
        "Remover exemplos",
        () => {
          const ok = commit((s) => {
            s.history = s.history.filter((x) => !x.demo);
            s.measurements = s.measurements.filter((x) => !x.demo);
            s.goals = s.goals.filter((x) => !x.demo);
            s.demo = false;
          });
          if (ok) toast("Exemplos removidos. Agora é com você.");
          return ok;
        },
      );
      break;
    case "reset":
      show(
        "Apagar todos os dados?",
        `<p class="modal-description">Essa ação é definitiva. Exporte um backup antes de continuar. Todos os treinos, registros, metas, perfil e sessão em andamento serão apagados.</p><form id="reset-form"><label class="field">Digite APAGAR para confirmar<input name="confirmation" required pattern="APAGAR" autocomplete="off"></label>${bottom("Apagar definitivamente")}</form>`,
      );
      $("#reset-form").onsubmit = (e) => {
        e.preventDefault();
        const empty = C.createState();
        empty.workouts = [];
        empty.history = [];
        empty.measurements = [];
        empty.goals = [];
        empty.demo = false;
        const was = corrupt;
        corrupt = false;
        if (save(empty)) {
          modal.close();
          go("home");
          toast("Todos os dados foram apagados deste navegador.");
        } else corrupt = was;
      };
      break;
    case "install":
      if (installPrompt) {
        await installPrompt.prompt();
        await installPrompt.userChoice;
        installPrompt = null;
        render();
      } else
        show(
          "Seu treino na tela inicial",
          `<div class="stack"><p class="modal-description">Abra o aplicativo por HTTPS para instalar no celular. No computador, localhost também funciona.</p><div><h3>iPhone ou iPad</h3><p class="helper">No Safari, toque em Compartilhar e depois em Adicionar à Tela de Início.</p></div><div><h3>Android</h3><p class="helper">No Chrome, abra o menu ⋮ e escolha Instalar aplicativo ou Adicionar à tela inicial.</p></div><div><h3>No computador</h3><p class="helper">Use a opção de instalação na barra de endereço do Chrome ou Edge. Se já estiver instalado, abra pelo atalho.</p></div><p class="helper">Depois do primeiro acesso completo, seus treinos ficam disponíveis offline. Não abra o index.html diretamente.</p>${U.btn("Entendi", "close", "", "primary full")}</div>`,
        );
      break;
  }
}
document.addEventListener("submit", (e) => {
  if (e.target.id === "profile-form") {
    e.preventDefault();
    const d = new FormData(e.target);
    if (
      commit((s) => {
        s.profile.name = d.get("name").trim().slice(0, 80);
        s.profile.massUnit = d.get("massUnit");
        s.profile.lengthUnit = d.get("lengthUnit");
      })
    )
      toast("Perfil salvo. Do seu jeito.");
  }
});
$("#import-file").onchange = async (e) => {
  const input = e.target,
    file = input.files[0];
  if (!file) return;
  try {
    if (file.size > 5000000) throw Error("O backup deve ter no máximo 5 MB.");
    const imported = C.parseBackup(await file.text());
    confirm(
      "Restaurar backup?",
      `Este arquivo contém ${imported.workouts.length} treinos, ${imported.history.length} sessões e ${imported.measurements.length} registros de medidas. Todos os dados atuais serão substituídos, inclusive o treino em andamento. Exporte um backup antes de continuar.`,
      "Substituir e importar",
      () => {
        const was = corrupt;
        corrupt = false;
        if (save(imported)) {
          render();
          toast("Backup importado com sucesso.");
          return true;
        }
        corrupt = was;
        return false;
      },
    );
  } catch (err) {
    toast(err.message, true);
  } finally {
    input.value = "";
  }
};

render();
if (corrupt)
  toast("Dados locais ilegíveis. Preserve o arquivo original no Perfil.", true);
else save(state);
if ("serviceWorker" in navigator && location.protocol !== "file:")
  navigator.serviceWorker
    .register("./sw.js")
    .catch(() =>
      toast("Modo offline indisponível. Use HTTPS ou localhost.", true),
    );
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  installPrompt = e;
  if (page === "profile") render();
});
window.addEventListener("appinstalled", () => {
  installPrompt = null;
  toast("Meu Treino instalado. Vamos nessa!");
  if (page === "profile") render();
});
window.addEventListener("online", () => render());
window.addEventListener("offline", () => render());
