import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ArrowRight, Check, GraduationCap } from "lucide-react";
import { useAuth } from "./auth";
import { getApiErrorMessage } from "./services/getApiErrorMessage";

export function RegisterPage() {
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const name = [firstName, middleName, lastName]
      .map((part) => part.trim())
      .filter(Boolean)
      .join(" ");

    if (!firstName.trim()) {
      setError("Enter your first name.");
      return;
    }

    if (password !== passwordConfirmation) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        name,
        first_name: firstName.trim(),
        middle_name: middleName.trim() || undefined,
        last_name: lastName.trim() || undefined,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      navigate("/", { replace: true });
    } catch (submissionError) {
      setError(getApiErrorMessage(submissionError, "Unable to create your account. Check the information and try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 p-4 sm:p-8">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl shadow-slate-900/10 lg:grid-cols-[.9fr_1.1fr]">
        <section className="relative hidden overflow-hidden bg-slate-950 p-10 text-white lg:block">
          <div className="absolute -left-20 top-1/3 size-80 rounded-full bg-sky-500/20 blur-3xl" />
          <div className="relative flex h-full flex-col justify-between">
            <div><div className="inline-flex rounded-2xl bg-white/10 p-3 text-sky-200"><GraduationCap className="size-7" /></div><p className="mt-8 text-sm font-medium tracking-[0.2em] text-sky-200">NEXORA</p><h1 className="mt-3 text-4xl font-semibold leading-tight tracking-tight">Plan with clarity.<br />Teach with purpose.</h1><p className="mt-5 max-w-sm leading-7 text-slate-300">One connected workspace for planning, teaching, evidence, and growth.</p></div>
            <ul className="space-y-3 text-sm text-slate-300"><li className="flex items-center gap-3"><Check className="size-4 text-sky-300" /> Organize lesson plans</li><li className="flex items-center gap-3"><Check className="size-4 text-sky-300" /> Track curriculum coverage</li><li className="flex items-center gap-3"><Check className="size-4 text-sky-300" /> Stay on pace</li></ul>
          </div>
        </section>
        <section className="flex items-center p-5 sm:p-10 lg:p-14">
          <div className="mx-auto w-full max-w-md"><div className="lg:hidden"><p className="text-sm font-semibold tracking-[0.2em] text-sky-700">NEXORA</p><p className="mt-2 text-sm text-slate-500">Plan. Align. Teach.</p></div><p className="mt-7 text-sm font-medium text-slate-500 lg:mt-0">Create your teacher workspace</p><h2 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">Create an account</h2><p className="mt-3 leading-6 text-slate-600">Start planning with a workspace that keeps every lesson connected.</p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-5 sm:grid-cols-3"><label className="block text-sm font-medium text-slate-700">First name<input autoComplete="given-name" className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-600 focus:ring-4 focus:ring-sky-100" onChange={(event) => setFirstName(event.target.value)} required type="text" value={firstName} /></label><label className="block text-sm font-medium text-slate-700">Middle name <span className="font-normal text-slate-400">(optional)</span><input autoComplete="additional-name" className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-600 focus:ring-4 focus:ring-sky-100" onChange={(event) => setMiddleName(event.target.value)} type="text" value={middleName} /></label><label className="block text-sm font-medium text-slate-700">Last name <span className="font-normal text-slate-400">(optional)</span><input autoComplete="family-name" className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-600 focus:ring-4 focus:ring-sky-100" onChange={(event) => setLastName(event.target.value)} type="text" value={lastName} /></label></div>

          <label className="block text-sm font-medium text-slate-700">
            Email
            <input
              autoComplete="email"
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-600 focus:ring-4 focus:ring-sky-100"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Password
            <input
              autoComplete="new-password"
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-600 focus:ring-4 focus:ring-sky-100"
              minLength={8}
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Confirm password
            <input
              autoComplete="new-password"
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-600 focus:ring-4 focus:ring-sky-100"
              minLength={8}
              onChange={(event) => setPasswordConfirmation(event.target.value)}
              required
              type="password"
              value={passwordConfirmation}
            />
          </label>

          {error ? <p className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700">{error}</p> : null}

          <button
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 font-medium text-white transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Creating account..." : <>Create account <ArrowRight className="size-4" /></>}
          </button>

          <p className="text-center text-sm text-slate-600">
            Already have an account?{" "}
              <Link className="font-medium text-sky-700 hover:text-sky-800" to="/login">
              Sign in
            </Link>
          </p>
        </form>
          </div></section>
      </div>
    </main>
  );
}
