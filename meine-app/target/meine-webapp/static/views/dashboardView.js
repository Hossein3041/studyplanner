import { fetchDashboardStats } from "../api.js";

export function initDashboardView() {
  loadDashboardStats();
}

async function loadDashboardStats() {
  const openTasksEl = document.getElementById("stat-open-tasks");
  const nextExamEl = document.getElementById("stat-next-exam");
  const studyTimeEl = document.getElementById("stat-study-time");

  if (!openTasksEl || !nextExamEl || !studyTimeEl) {
    console.warn("DashboardView: Statistik-Elemente nicht gefunden.");
    return;
  }

  openTasksEl.textContent = "-";
  nextExamEl.textContent = "–";
  studyTimeEl.textContent = "–";

  try {
    const stats = await fetchDashboardStats();
    if (!stats) return;

    openTasksEl.textContent =
      stats.openTasks ?? stats.open_tasks ?? stats.todoCount ?? "-";

    nextExamEl.textContent =
      stats.nextExam ??
      stats.next_exam ??
      stats.nextDeadline ??
      "Keine Prüfung geplant";

    studyTimeEl.textContent =
      stats.studyTimeThisWeek ??
      stats.studyMinutesThisWeek ??
      "-";
  } catch (e) {
    console.error("Fehler beim Laden der Dashboard-Statistiken:", e);
  }
}
