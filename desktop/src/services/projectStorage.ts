
import type { Presentation } from "../models/presentation";

const STORAGE_KEY = "ai-ppt-studio-project";

export function saveProject(
  project: Presentation
): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(project)
  );
}

export function loadProject(): Presentation | null {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return null;
  }

  try {
    const project: unknown = JSON.parse(saved);

    if (
      typeof project === "object" &&
      project !== null &&
      "schemaVersion" in project &&
      project.schemaVersion === "0.1.0" &&
      "id" in project &&
      typeof project.id === "string" &&
      "title" in project &&
      typeof project.title === "string" &&
      "slides" in project &&
      Array.isArray(project.slides)
    ) {
      return project as Presentation;
    }

    return null;
  } catch {
    return null;
  }
}
