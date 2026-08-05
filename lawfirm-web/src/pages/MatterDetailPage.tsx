import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getMatterById,
  updateMatter,
  type MatterDetail,
} from "../services/matterService";

const MATTER_STATUSES = [
  "Draft",
  "Open",
  "Awaiting Client Documents",
  "In Progress",
  "Awaiting External Response",
  "On Hold",
  "Closed",
  "Archived",
];

const MatterDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const matterId = Number(id);

  const [matter, setMatter] = useState<MatterDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit form state
  const [responsibleLawyer, setResponsibleLawyer] = useState("");
  const [supportingStaff, setSupportingStaff] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [targetCloseDate, setTargetCloseDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMatter = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getMatterById(matterId);
        setMatter(result);
        setResponsibleLawyer(result.responsibleLawyer ?? "");
        setSupportingStaff(result.supportingStaff ?? "");
        setStatus(result.status);
        setPriority(result.priority ?? "");
        setTargetCloseDate(
          result.targetCloseDate ? result.targetCloseDate.slice(0, 10) : ""
        );
      } catch {
        setError(`Failed to load the detail page of matter id:${matterId}.`);
      } finally {
        setLoading(false);
      }
    };
    fetchMatter();
  }, [matterId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!responsibleLawyer || !status) {
      setSaveError("Please fill in all required fields.");
      return;
    }

    setSaving(true);
    setSaveError(null);

    try {
      const updated = await updateMatter(matterId, {
        responsibleLawyer,
        supportingStaff: supportingStaff || undefined,
        status,
        priority: priority || undefined,
        targetCloseDate: targetCloseDate || undefined,
      });
      setMatter(updated);
    } catch {
      setSaveError("Failed to update matter.");
    } finally {
      setSaving(false);
    }
  };

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

      {/* Assignment and status update */}
      <section>
        <h2>Edit Assignment / Status</h2>
        {saveError && <p style={{ color: "red" }}>{saveError}</p>}

        <form onSubmit={handleSave}>
          <div>
            <label>Responsible Lawyer</label>
            <input
              value={responsibleLawyer}
              onChange={(e) => setResponsibleLawyer(e.target.value)}
            />
          </div>

          <div>
            <label>Supporting Staff</label>
            <input
              value={supportingStaff}
              onChange={(e) => setSupportingStaff(e.target.value)}
            />
          </div>

          <div>
            <label>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              {MATTER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Priority</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="">-- None --</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div>
            <label>Target Close Date</label>
            <input
              type="date"
              value={targetCloseDate}
              onChange={(e) => setTargetCloseDate(e.target.value)}
            />
          </div>

          <button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </section>
    </div>
  );
};

export default MatterDetailPage;