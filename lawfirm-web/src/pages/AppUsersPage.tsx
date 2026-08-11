import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAppUsers, type AppUser } from "../services/appUserService";

const AppUsersPage = () => {
  const [appUsers, setAppUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppUsers = async () => {
      try {
        const result = await getAppUsers();
        setAppUsers(result);
      } catch {
        setError("Failed to load application users.");
      } finally {
        setLoading(false);
      }
    };
    fetchAppUsers();
  }, []);

  return (
    <div>
      <Link to="/admin">← Back to Admin</Link>
      <h1>Application Users</h1>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && (
        <table>
          <thead>
            <tr>
              <th>Display Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Active</th>
              <th>Last Login At</th>
            </tr>
          </thead>
          <tbody>
            {appUsers.length === 0 ? (
              <tr>
                <td colSpan={5}>No application users found.</td>
              </tr>
            ) : (
              appUsers.map((u) => (
                <tr key={u.appUserId}>
                  <td>{u.displayName}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>{u.isActive ? "Yes" : "No"}</td>
                  <td>{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : "-"}</td>
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