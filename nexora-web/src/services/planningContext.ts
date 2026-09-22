import api from "./api";

export interface PlanningOption {
  id: number;
  name: string;
}

export interface PlanningTerm extends PlanningOption {
  school_year_id: number;
}

export interface PlanningContext {
  school_years: PlanningOption[];
  terms: PlanningTerm[];
  grades: PlanningOption[];
  subjects: PlanningOption[];
}

interface ApiResponse<T> {
  data: T;
}

const cacheDurationMs = 5 * 60 * 1000;
let cachedContext: PlanningContext | null = null;
let cachedAt = 0;
let pendingRequest: Promise<PlanningContext> | null = null;

export async function getPlanningContext(): Promise<PlanningContext> {
  if (cachedContext && Date.now() - cachedAt < cacheDurationMs) {
    return cachedContext;
  }

  pendingRequest ??= api.get<ApiResponse<PlanningContext>>("/planning-context")
    .then((response) => {
      cachedContext = response.data.data;
      cachedAt = Date.now();

      return cachedContext;
    })
    .finally(() => {
      pendingRequest = null;
    });

  return pendingRequest;
}

export function invalidatePlanningContext(): void {
  cachedContext = null;
  cachedAt = 0;
}
