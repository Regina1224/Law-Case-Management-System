import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getMatters, type MatterListItem } from "../services/matterService";

const MattersPage = () => {
  const [matters, setMatters] = useState<MatterListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const fetchMatters = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getMatters({
        keyword: keyword || undefined,
        status: status || undefined,
        page,
        pageSize,
      });
      setMatters(result.items);
      setTotalCount(result.totalCount);
    } catch {
      setError("Failed to load matters.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMatters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchMatters();
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div>
      <h1>Matters</h1>
      <Link to="/matters/create">Create Matter</Link>

      <form onSubmit={handleSearch}>
        <input
          placeholder="Search by title, number, or client"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="Draft">Draft</option>
          <option value="Open">Open</option>
          <option value="Awaiting Client Documents">Awaiting Client Documents</option>
          <option value="In Progress">In Progress</option>
          <option value="Awaiting External Response">Awaiting External Response</option>
          <option value="On Hold">On Hold</option>
          <option value="Closed">Closed</option>
          <option value="Archived">Archived</option>
        </select>
        <button type="submit">Search</button>
      </form>

      <p>Total: {totalCount}</p>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && (
        <>
          <table>
            <thead>
              <tr>
                <th>Matter Number</th>
                <th>Matter Title</th>
                <th>Client</th>
                <th>Matter Type</th>
                <th>Practice Area</th>
                <th>Responsible Lawyer</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Opened Date</th>
              </tr>
            </thead>
            <tbody>
              {matters.length === 0 ? (
                <tr>
                  <td colSpan={9}>No matters found.</td>
                </tr>
              ) : (
                matters.map((m) => (
                  <tr key={m.matterId}>
                    <td>
                      <Link to={`/matters/${m.matterId}`}>{m.matterNumber}</Link>
                    </td>
                    <td>{m.matterTitle}</td>
                    <td>{m.clientName}</td>
                    <td>{m.matterTypeName}</td>
                    <td>{m.practiceAreaName}</td>
                    <td>{m.responsibleLawyer ?? "-"}</td>
                    <td>{m.status}</td>
                    <td>{m.priority ?? "-"}</td>
                    <td>{new Date(m.openedDate).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div>
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </button>
            <span>
              {" "}Page {page} of {totalPages || 1}{" "}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default MattersPage;