import { useSyncExternalStore } from "react";
import { getApiDiagnostics, subscribeToApiDiagnostics } from "./services/apiDiagnostics";

export function ApiDebugPanel() {
  const diagnostics = useSyncExternalStore(
    subscribeToApiDiagnostics,
    getApiDiagnostics,
    getApiDiagnostics,
  );

  if (!import.meta.env.DEV) {
    return null;
  }

  return (
    <details className="fixed bottom-3 right-3 z-[100] max-w-[min(24rem,calc(100vw-1.5rem))] rounded-xl border border-slate-700 bg-slate-950/95 p-3 text-xs text-slate-100 shadow-xl">
      <summary className="cursor-pointer font-semibold">API debug</summary>
      <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 break-words">
        <dt className="text-slate-400">API URL</dt>
        <dd>{diagnostics.apiUrl}</dd>
        <dt className="text-slate-400">Auth</dt>
        <dd>{diagnostics.authenticationStatus}</dd>
        <dt className="text-slate-400">Token</dt>
        <dd>{diagnostics.tokenExists ? "Present" : "Not found"}</dd>
        <dt className="text-slate-400">Last error</dt>
        <dd>{diagnostics.lastApiError || "None"}</dd>
        <dt className="text-slate-400">Failed endpoint</dt>
        <dd>{diagnostics.failedEndpoint || "None"}</dd>
      </dl>
    </details>
  );
}
