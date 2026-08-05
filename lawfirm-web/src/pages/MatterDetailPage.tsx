import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getMatterById, type MatterDetail } from "../services/matterService";

const MatterDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const matterId = Number(id);

  const [matter, setMatter] = useState<MatterDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMatter = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getMatterById(matterId);
        setMatter(result);
      } catch {
        setError(`Failed to load the detail page of matter id:${matterId}.`);
      } finally {
        setLoading(false);
      }
    };
    fetchMatter();
  }, [matterId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!matter) return null;

  return (
    <div>
      <Link to="/matters">← Back to Matters</Link>
      <h1>{matter.matterTitle}</h1>

      {/* Top summary section */}
      <section>
        <p>Matter Number: {matter.matterNumber}</p>
        <p>
          Client:{" "}
          <Link to={`/clients/${matter.clientId}`}>
            {matter.clientName} ({matter.clientCode})
          </Link>
        </p>
        <p>Status: {matter.status}</p>
        <p>Matter Type: {matter.matterTypeName}</p>
        <p>Practice Area: {matter.practiceAreaName}</p>
        <p>Responsible Lawyer: {matter.responsibleLawyer ?? "-"}</p>
        <p>Priority: {matter.priority ?? "-"}</p>
        <p>Opened Date: {new Date(matter.openedDate).toLocaleDateString()}</p>
        <p>
          Target Close Date:{" "}
          {matter.targetCloseDate
            ? new Date(matter.targetCloseDate).toLocaleDateString()
            : "-"}
        </p>
      </section>

      {/* Overview */}
      <section>
        <h2>Overview</h2>

        <h3>Summary</h3>
        <p>{matter.summary}</p>

        <h3>Client</h3>
        <p>
          {matter.clientName} ({matter.clientCode}){" "}
          <Link to={`/clients/${matter.clientId}`}>View Client</Link>
        </p>

        <h3>Assignment</h3>
        <p>Responsible Lawyer: {matter.responsibleLawyer ?? "-"}</p>
        <p>Supporting Staff: {matter.supportingStaff ?? "-"}</p>

        <h3>Key Dates</h3>
        <p>Opened Date: {new Date(matter.openedDate).toLocaleDateString()}</p>
        <p>
          Target Close Date:{" "}
          {matter.targetCloseDate
            ? new Date(matter.targetCloseDate).toLocaleDateString()
            : "-"}
        </p>
        <p>
          Closed Date:{" "}
          {matter.closedDate
            ? new Date(matter.closedDate).toLocaleDateString()
            : "-"}
        </p>

        <p>Confidential: {matter.isConfidential ? "Yes" : "No"}</p>
        <p>Created At: {new Date(matter.createdAt).toLocaleString()}</p>
      </section>
    </div>
  );
};

export default MatterDetailPage;