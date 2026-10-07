import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { useAuth } from "../contexts/useAuth";
import { listUsers, setUserRole } from "../services/usersService";
import { errorMessage, formatDate } from "../lib/format";
import { ROLES, ROLE_LABELS, type Role, type UserAccount } from "../types";

export default function AdminUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    listUsers()
      .then((data) => {
        if (!cancelled) setUsers(data);
      })
      .catch((e) => {
        console.error("Erreur chargement des utilisateurs :", e);
        if (!cancelled)
          setError(errorMessage(e, "Impossible de charger les utilisateurs."));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function changeRole(account: UserAccount, role: Role) {
    setSavingId(account.id);
    try {
      await setUserRole(account.id, role);
      setUsers((list) =>
        list.map((u) => (u.id === account.id ? { ...u, role } : u)),
      );
    } catch (e) {
      alert(errorMessage(e, "Impossible de changer le rôle."));
    } finally {
      setSavingId(null);
    }
  }

  return (
    <MainLayout>
      <section className="max-w-4xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Utilisateurs</h1>
        <p className="mb-6 text-sm text-gray-600">
          Visiteur → Contributeur → Modérateur → Administrateur : chaque rôle a
          aussi les droits des rôles précédents.
        </p>

        {loading ? (
          <p className="text-gray-600">Chargement…</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-gray-100 text-left text-gray-600">
                <tr>
                  <th className="px-4 py-2">Nom</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Inscrit le</th>
                  <th className="px-4 py-2">Rôle</th>
                </tr>
              </thead>
              <tbody>
                {users.map((account) => {
                  const isMe = account.id === user?.id;
                  return (
                    <tr
                      key={account.id}
                      className="odd:bg-white even:bg-gray-50"
                    >
                      <td className="px-4 py-2 font-medium">
                        {account.display_name}
                        {isMe && <span className="text-gray-500"> (toi)</span>}
                      </td>
                      <td className="px-4 py-2">{account.email}</td>
                      <td className="px-4 py-2">
                        {formatDate(account.created_at)}
                      </td>
                      <td className="px-4 py-2">
                        {/* Son propre rôle n'est pas modifiable (refusé par la base) */}
                        <select
                          aria-label={`Rôle de ${account.display_name}`}
                          className="border border-gray-300 rounded-md p-1 bg-white disabled:opacity-60"
                          value={account.role}
                          disabled={isMe || savingId === account.id}
                          onChange={(e) =>
                            changeRole(account, e.target.value as Role)
                          }
                        >
                          {ROLES.map((role) => (
                            <option key={role} value={role}>
                              {ROLE_LABELS[role]}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </MainLayout>
  );
}
