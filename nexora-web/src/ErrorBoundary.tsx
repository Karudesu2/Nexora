import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = { hasError: false };

  public static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("NEXORA page render failure", error, errorInfo);
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <main className="grid min-h-screen place-items-center bg-slate-100 p-5 dark:bg-slate-950">
          <section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm font-semibold text-sky-700 dark:text-sky-300">NEXORA</p>
            <h1 className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">Something went wrong</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">Unable to load this page. Your saved work has not been deleted.</p>
            <button className="mt-5 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500" onClick={() => window.location.reload()} type="button">Try again</button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
