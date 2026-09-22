/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { Loader2, Search, ShieldCheck, UserRoundCog } from "lucide-react";
import { useAuth } from "../auth";
import api from "../services/api";
import { getApiErrorMessage } from "../services/getApiErrorMessage";

interface Role {
  id: number;
  name: string;
  code: string;
}

interface ManagedUser {
  id: number;
  name: string;
  email: string;
  role_codes: string[];
}

interface UsersResponse {
  data: {
    users: { data: ManagedUser[] };
    available_roles: Role[];
  };
}

function roleLabel(roleCode: string): string {
  return roleCode.split("_").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}

export function UserManagementPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingUserId, setSavingUserId] = useState<number | null>(null);

  const isSystemAdministrator = currentUser?.role_codes?.includes("system_administrator") ?? false;
  const canManageUsers = isSystemAdministrator || (currentUser?.role_codes?.some((role) => ["school_administrator", "administrator"].includes(role)) ?? false);

  const loadUsers = async (searchTerm = "") => {
    const response = await api.get<UsersResponse>("/admin/users", { params: searchTerm ? { search: searchTerm } : undefined });
    setUsers(response.data.data.users.data);
    setRoles(response.data.data.available_roles);
  };

  useEffect(() => {
    if (!canManageUsers) {
      setLoading(false);
      return;
    }

    void loadUsers().catch((loadError: unknown) => setError(getApiErrorMessage(loadError, "User management could not be loaded."))).finally(() => setLoading(false));
  }, [canManageUsers]);

  const submitSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await loadUsers(search.trim());
    } catch (loadError) {
      setError(getApiErrorMessage(loadError, "User management could not be loaded."));
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (managedUser: ManagedUser, roleCode: string) => {
    setSavingUserId(managedUser.id);
    setError("");
    try {
      await api.patch(`/admin/users/${managedUser.id}/role`, { role_code: roleCode });
      await loadUsers(search.trim());
      setNotice(`${managedUser.name}'s role was updated.`);
    } catch (updateError) {
      setError(getApiErrorMessage(updateError, "The user's role could not be updated."));
    } finally {
      setSavingUserId(null);
    }
  };

  const canEditUser = (managedUser: ManagedUser): boolean => managedUser.id !== currentUser?.id && (isSystemAdministrator || !managedUser.role_codes.some((roleCode) => ["school_administrator", "administrator", "system_administrator"].includes(roleCode)));

  if (!canManageUsers) return <section className="mx-auto max-w-2xl rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900 dark:border-amber-900/70 dark:bg-amber-950/40 dark:text-amber-200"><h1 className="text-xl font-semibold">Access denied</h1><p className="mt-2 text-sm">You do not have permission to manage user accounts.</p></section>;
  if (loading && users.length === 0) return <div className="flex min-h-64 items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400"><Loader2 className="size-5 animate-spin" /> Loading users...</div>;

  return <div className="space-y-5"><section className="rounded-2xl bg-slate-950 p-5 text-white shadow-sm sm:p-7"><div className="flex items-start gap-4"><div className="rounded-xl bg-white/10 p-3 text-sky-200"><UserRoundCog className="size-5" /></div><div><p className="text-sm font-medium text-sky-200">Administration</p><h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">User management</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">Review user accounts and assign roles securely. You cannot change your own role.</p></div></div></section>{error ? <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">{error}</p> : null}{notice ? <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">{notice}</p> : null}<section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"><form className="flex flex-col gap-3 sm:flex-row" onSubmit={(event) => void submitSearch(event)}><label className="flex flex-1 items-center gap-2 rounded-xl border border-slate-300 px-3 dark:border-slate-700"><Search className="size-4 text-slate-400" /><input className="w-full bg-transparent py-2.5 text-sm outline-none dark:text-white" onChange={(event) => setSearch(event.target.value)} placeholder="Search name or email" type="search" value={search} /></label><button className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500" type="submit">Search</button></form><div className="mt-5 overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800"><tr><th className="pb-3 font-semibold">User</th><th className="pb-3 font-semibold">Current role</th><th className="pb-3 font-semibold">Assign role</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{users.map((managedUser) => { const editable = canEditUser(managedUser); const currentRole = managedUser.role_codes[0] ?? "teacher"; return <tr key={managedUser.id}><td className="py-4"><p className="font-semibold text-slate-900 dark:text-white">{managedUser.name}</p><p className="mt-1 text-xs text-slate-500">{managedUser.email}</p></td><td className="py-4"><span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200"><ShieldCheck className="size-3.5" />{roleLabel(currentRole)}</span></td><td className="py-4"><select aria-label={`Role for ${managedUser.name}`} className="rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm text-slate-900 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-white" disabled={!editable || savingUserId === managedUser.id} onChange={(event) => void updateRole(managedUser, event.target.value)} value={currentRole}><option value={currentRole}>{roleLabel(currentRole)}</option>{roles.filter((role) => role.code !== currentRole).map((role) => <option key={role.id} value={role.code}>{role.name}</option>)}</select>{!editable ? <p className="mt-1 text-xs text-slate-500">{managedUser.id === currentUser?.id ? "Your role cannot be changed here." : "This account is outside your role scope."}</p> : null}</td></tr>; })}</tbody></table>{users.length === 0 ? <p className="py-10 text-center text-sm text-slate-500">No users found.</p> : null}</div></section></div>;
}
