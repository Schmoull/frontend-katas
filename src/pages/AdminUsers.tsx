import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import MainLayout from "../layouts/MainLayout";
import { useAuth } from "../contexts/useAuth";
import { listUsers, setUserRole } from "../services/usersService";
import { errorMessage, formatDate } from "../lib/format";
import { ROLES, type Role, type UserAccount } from "../types";

export default function AdminUsers() {
  const { t } = useTranslation();
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
        if (!cancelled) setError(errorMessage(e, t("adminUsers.loadError")));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [t]);

  async function changeRole(account: UserAccount, role: Role) {
    setSavingId(account.id);
    try {
      await setUserRole(account.id, role);
      setUsers((list) =>
        list.map((u) => (u.id === account.id ? { ...u, role } : u)),
      );
    } catch (e) {
      alert(errorMessage(e, t("adminUsers.roleError")));
    } finally {
      setSavingId(null);
    }
  }

  return (
    <MainLayout>
      <section className="max-w-4xl">
        <h1 className="titre-1 mb-2">{t("adminUsers.title")}</h1>
        <p className="corps mb-6 text-encre-douce">{t("adminUsers.help")}</p>

        {loading ? (
          <p className="corps text-encre-douce">{t("common.loading")}</p>
        ) : error ? (
          <p role="alert" className="corps-fort text-danger">
            {error}
          </p>
        ) : (
          <div className="overflow-x-auto shadow-posee">
            <table className="tableau">
              <thead>
                <tr>
                  <th>{t("adminUsers.name")}</th>
                  <th>{t("adminUsers.email")}</th>
                  <th>{t("adminUsers.registered")}</th>
                  <th>{t("adminUsers.role")}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((account) => {
                  const isMe = account.id === user?.id;
                  return (
                    <tr key={account.id}>
                      <td className="font-semibold">
                        {account.display_name}
                        {isMe && (
                          <span className="font-normal text-encre-discrete">
                            {t("adminUsers.you")}
                          </span>
                        )}
                      </td>
                      <td>{account.email}</td>
                      <td className="donnee">
                        {formatDate(account.created_at)}
                      </td>
                      <td>
                        {/* Son propre rôle n'est pas modifiable (refusé par la base) */}
                        <select
                          aria-label={t("adminUsers.roleOf", {
                            name: account.display_name,
                          })}
                          className="champ disabled:opacity-60"
                          value={account.role}
                          disabled={isMe || savingId === account.id}
                          onChange={(e) =>
                            changeRole(account, e.target.value as Role)
                          }
                        >
                          {ROLES.map((role) => (
                            <option key={role} value={role}>
                              {t(`roles.${role}`)}
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
