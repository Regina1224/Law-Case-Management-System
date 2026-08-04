import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createMatter } from "../services/matterService";
import { getClients, type ClientListItem } from "../services/clientService";
import practiceAreaService, {
  type PracticeAreaDto,
} from "../services/practiceAreaService";
import matterTypeService, {
  type MatterTypeDto,
} from "../services/matterTypeService";

const CreateMatterPage = () => {
  const navigate = useNavigate();

  const [clients, setClients] = useState<ClientListItem[]>([]);
  const [practiceAreas, setPracticeAreas] = useState<PracticeAreaDto[]>([]);
  const [matterTypes, setMatterTypes] = useState<MatterTypeDto[]>([]);

  const [clientId, setClientId] = useState<number | "">("");
  const [matterTitle, setMatterTitle] = useState("");
  const [matterTypeId, setMatterTypeId] = useState<number | "">("");
  const [practiceAreaId, setPracticeAreaId] = useState<number | "">("");
  const [responsibleLawyer, setResponsibleLawyer] = useState("");
  const [supportingStaff, setSupportingStaff] = useState("");
  const [status, setStatus] = useState("Draft");
  const [priority, setPriority] = useState("Medium");
  const [summary, setSummary] = useState("");
  const [openedDate, setOpenedDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [targetCloseDate, setTargetCloseDate] = useState("");
  const [isConfidential, setIsConfidential] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [clientsRes, practiceAreasRes, matterTypesRes] = await Promise.all([
          getClients({ pageSize: 1000 }),
          practiceAreaService.getAll(),
          matterTypeService.getAll(),
        ]);
        setClients(clientsRes.items);
        setPracticeAreas(practiceAreasRes.data.data);
        setMatterTypes(matterTypesRes.data.data);
      } catch {
        setError("Failed to load form options.");
      }
    };
    fetchOptions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !clientId ||
      !matterTitle ||
      !matterTypeId ||
      !practiceAreaId ||
      !responsibleLawyer ||
      !summary ||
      !openedDate
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await createMatter({
        clientId: Number(clientId),
        matterTitle,
        matterTypeId: Number(matterTypeId),
        practiceAreaId: Number(practiceAreaId),
        responsibleLawyer,
        supportingStaff: supportingStaff || undefined,
        status,
        priority: priority || undefined,
        summary,
        openedDate,
        targetCloseDate: targetCloseDate || undefined,
        isConfidential,
      });

      navigate("/matters");
    } catch {
      setError("Failed to create matter. Please check your input.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1>Create Matter</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Client</label>
          <select
            value={clientId}
            onChange={(e) =>
              setClientId(e.target.value ? Number(e.target.value) : "")
            }
          >
            <option value="">-- Select Client --</option>
            {clients.map((c) => (
              <option key={c.clientId} value={c.clientId}>
                {c.clientName} ({c.clientCode})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Matter Title</label>
          <input
            value={matterTitle}
            onChange={(e) => setMatterTitle(e.target.value)}
          />
        </div>

        <div>
          <label>Matter Type</label>
          <select
            value={matterTypeId}
            onChange={(e) =>
              setMatterTypeId(e.target.value ? Number(e.target.value) : "")
            }
          >
            <option value="">-- Select Matter Type --</option>
            {matterTypes.map((mt) => (
              <option key={mt.id} value={mt.id}>
                {mt.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Practice Area</label>
          <select
            value={practiceAreaId}
            onChange={(e) =>
              setPracticeAreaId(e.target.value ? Number(e.target.value) : "")
            }
          >
            <option value="">-- Select Practice Area --</option>
            {practiceAreas.map((pa) => (
              <option key={pa.id} value={pa.id}>
                {pa.name}
              </option>
            ))}
          </select>
        </div>

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
            <option value="Draft">Draft</option>
            <option value="Open">Open</option>
          </select>
        </div>

        <div>
          <label>Priority</label>
          <select value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>

        <div>
          <label>Matter Summary</label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
          />
        </div>

        <div>
          <label>Opened Date</label>
          <input
            type="date"
            value={openedDate}
            onChange={(e) => setOpenedDate(e.target.value)}
          />
        </div>

        <div>
          <label>Target Close Date</label>
          <input
            type="date"
            value={targetCloseDate}
            onChange={(e) => setTargetCloseDate(e.target.value)}
          />
        </div>

        <div>
          <label>
            <input
              type="checkbox"
              checked={isConfidential}
              onChange={(e) => setIsConfidential(e.target.checked)}
            />
            Confidential
          </label>
        </div>

        <button type="submit" disabled={submitting}>
          {submitting ? "Creating..." : "Create Matter"}
        </button>
      </form>
    </div>
  );
};

export default CreateMatterPage;