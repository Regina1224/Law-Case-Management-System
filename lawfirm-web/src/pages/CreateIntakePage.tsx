import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createIntake } from "../services/intakeService";
import practiceAreaService, {
  type PracticeAreaDto,
} from "../services/practiceAreaService";

const CreateIntakePage = () => {
  const navigate = useNavigate();

  const [prospectiveClientName, setProspectiveClientName] = useState("");
  const [intendedClientType, setIntendedClientType] = useState("Individual");
  const [primaryEmail, setPrimaryEmail] = useState("");
  const [primaryPhone, setPrimaryPhone] = useState("");
  const [practiceAreaId, setPracticeAreaId] = useState<number | "">("");
  const [legalIssueSummary, setLegalIssueSummary] = useState("");
  const [urgency, setUrgency] = useState("Medium");
  const [assignedReviewer, setAssignedReviewer] = useState("");
  const [sourceOfEnquiry, setSourceOfEnquiry] = useState("");
  const [consultationDate, setConsultationDate] = useState("");

  const [practiceAreas, setPracticeAreas] = useState<PracticeAreaDto[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPracticeAreas = async () => {
      try {
        const response = await practiceAreaService.getAll();
        setPracticeAreas(response.data.data);
      } catch {
        setError("Failed to load practice areas.");
      }
    };
    fetchPracticeAreas();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prospectiveClientName || !legalIssueSummary || !practiceAreaId) {
      setError("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await createIntake({
        prospectiveClientName,
        intendedClientType,
        primaryEmail: primaryEmail || undefined,
        primaryPhone: primaryPhone || undefined,
        practiceAreaId: Number(practiceAreaId),
        legalIssueSummary,
        urgency,
        assignedReviewer: assignedReviewer || undefined,
        sourceOfEnquiry: sourceOfEnquiry || undefined,
        consultationDate: consultationDate || undefined,
      });

      navigate("/intakes");
    } catch {
      setError("Failed to create intake. Please check your input.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1>Create Intake</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Prospective Client Name</label>
          <input
            value={prospectiveClientName}
            onChange={(e) => setProspectiveClientName(e.target.value)}
          />
        </div>

        <div>
          <label>Intended Client Type</label>
          <select
            value={intendedClientType}
            onChange={(e) => setIntendedClientType(e.target.value)}
          >
            <option value="Individual">Individual</option>
            <option value="Corporate">Corporate</option>
          </select>
        </div>

        <div>
          <label>Primary Email</label>
          <input
            value={primaryEmail}
            onChange={(e) => setPrimaryEmail(e.target.value)}
          />
        </div>

        <div>
          <label>Primary Phone</label>
          <input
            value={primaryPhone}
            onChange={(e) => setPrimaryPhone(e.target.value)}
          />
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
          <label>Legal Issue Summary</label>
          <textarea
            value={legalIssueSummary}
            onChange={(e) => setLegalIssueSummary(e.target.value)}
          />
        </div>

        <div>
          <label>Urgency</label>
          <select value={urgency} onChange={(e) => setUrgency(e.target.value)}>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>

        <div>
          <label>Assigned Reviewer</label>
          <input
            value={assignedReviewer}
            onChange={(e) => setAssignedReviewer(e.target.value)}
          />
        </div>

        <div>
          <label>Source of Enquiry</label>
          <input
            value={sourceOfEnquiry}
            onChange={(e) => setSourceOfEnquiry(e.target.value)}
          />
        </div>

        <div>
          <label>Consultation Date</label>
          <input
            type="date"
            value={consultationDate}
            onChange={(e) => setConsultationDate(e.target.value)}
          />
        </div>

        <button type="submit" disabled={submitting}>
          {submitting ? "Creating..." : "Create Intake"}
        </button>
      </form>
    </div>
  );
};

export default CreateIntakePage;