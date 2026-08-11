import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAppUsers, updateAppUserRole, type AppUser } from "../services/appUserService";

const APP_ROLES = ["SystemAdmin", "Partner", "Lawyer", "Paralegal", "AdminStaff"];

const AppUsersPage = () => {
  const [appUsers, setAppUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedRoles, setSelectedRoles] = useState<Record<number, string>>({});
  const [savingId, setSavingId] = useState<number | null>(null);
  const [roleError, setRoleError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppUsers = async () => {
      try {
        const result = await getAppUsers();
        setAppUsers(result);
        setSelectedRoles(
          Object.fromEntries(result.map((u) => [u.appUserId, u.role]))
        );
      } catch {
        setError("Failed to load application users.");
      } finally {
        setLoading(false);
      }
    };
    fetchAppUsers();
  }, []);

  const handleSaveRole = async (appUserId: number) => {
    const role = selectedRoles[appUserId];
    setSavingId(appUserId);
    setRoleError(null);

    try {
      const updated = await updateAppUserRole(appUserId, role);
      setAppUsers((prev) =>
        prev.map((u) => (u.appUserId === appUserId ? updated : u))
      );
    } catch {
      setRoleError("Failed to update role.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div>
      <Link to="/admin">← Back to Admin</Link>
      <h1>Application Users</h1>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {roleError && <p style={{ color: "red" }}>{roleError}</p>}

      {!loading && !error && (
        <table>
          <thead>
            <tr>
              <th>Display Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Active</th>
              <th>Last Login At</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {appUsers.length === 0 ? (
              <tr>
                <td colSpan={6}>No application users found.</td>
              </tr>
            ) : (
              appUsers.map((u) => (
                <tr key={u.appUserId}>
                  <td>{u.displayName}</td>
                  <td>{u.email}</td>
                  <td>
                    <select
                      value={selectedRoles[u.appUserId] ?? u.role}
                      onChange={(e) =>
                        setSelectedRoles((prev) => ({
                          ...prev,
                          [u.appUserId]: e.target.value,
                        }))
                      }
                    >
                      {APP_ROLES.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>{u.isActive ? "Yes" : "No"}</td>
                  <td>{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : "-"}</td>
                  <td>
                    <button
                      type="button"
                      disabled={
                        savingId === u.appUserId ||
                        (selectedRoles[u.appUserId] ?? u.role) === u.role
                      }
                      onClick={() => handleSaveRole(u.appUserId)}
                    >
                      {savingId === u.appUserId ? "Saving..." : "Save"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AppUsersPage;