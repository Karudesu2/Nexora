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
let cacheRevision = 0;

export async function getPlanningContext(): Promise<PlanningContext> {
  if (cachedContext && Date.now() - cachedAt < cacheDurationMs) {
    return cachedContext;
  }

  if (!pendingRequest) {
    const revision = cacheRevision;
    const request = api.get<ApiResponse<PlanningContext>>("/planning-context")
      .then((response) => {
        if (revision === cacheRevision) {
          cachedContext = response.data.data;
          cachedAt = Date.now();
        }

        return response.data.data;
      })
      .finally(() => {
        if (pendingRequest === request) {
          pendingRequest = null;
        }
      });

    pendingRequest = request;
  }

  return pendingRequest;
}

export function invalidatePlanningContext(): void {
  cacheRevision += 1;
  cachedContext = null;
  cachedAt = 0;
  pendingRequest = null;
}
