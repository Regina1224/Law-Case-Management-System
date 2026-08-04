import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getIntakeById,
  updateIntake,
  getIntakeDocuments,
  uploadIntakeDocument,
  getDocumentDownloadUrl,
  type IntakeDetail,
  type IntakeDocument,
} from "../services/intakeService";
import practiceAreaService, {
  type PracticeAreaDto,
} from "../services/practiceAreaService";

const IntakeDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const intakeId = Number(id);

  const [intake, setIntake] = useState<IntakeDetail | null>(null);
  const [practiceAreas, setPracticeAreas] = useState<PracticeAreaDto[]>([]);
  const [documents, setDocuments] = useState<IntakeDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit form status
  const [status, setStatus] = useState("");
  const [assignedReviewer, setAssignedReviewer] = useState("");
  const [practiceAreaId, setPracticeAreaId] = useState<number | "">("");
  const [urgency, setUrgency] = useState("");
  const [consultationDate, setConsultationDate] = useState("");
  const [legalIssueSummary, setLegalIssueSummary] = useState("");
  const [saving, setSaving] = useState(false);

  // Document upload form status
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadCategory, setUploadCategory] = useState("Engagement Documents");
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploading, setUploading] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [intakeData, practiceAreaRes, documentsData] = await Promise.all([
        getIntakeById(intakeId),
        practiceAreaService.getAll(),
        getIntakeDocuments(intakeId),
      ]);

      setIntake(intakeData);
      setPracticeAreas(practiceAreaRes.data.data);
      setDocuments(documentsData);

      setStatus(intakeData.status);
      setAssignedReviewer(intakeData.assignedReviewer ?? "");
      setPracticeAreaId(intakeData.practiceAreaId);
      setUrgency(intakeData.urgency ?? "");
      setConsultationDate(
        intakeData.consultationDate ? intakeData.consultationDate.slice(0, 10) : ""
      );
      setLegalIssueSummary(intakeData.legalIssueSummary);
    } catch {
      setError("Failed to load intake detail.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intakeId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!status || !practiceAreaId || !legalIssueSummary) {
      setError("Please fill in all required fields.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const updated = await updateIntake(intakeId, {
        status,
        assignedReviewer: assignedReviewer || undefined,
        practiceAreaId: Number(practiceAreaId),
        urgency: urgency || undefined,
        consultationDate: consultationDate || undefined,
        legalIssueSummary,
      });
      setIntake(updated);
    } catch {
      setError("Failed to update intake.");
    } finally {
      setSaving(false);
    }
  };

  const handleDecline = async () => {
    setSaving(true);
    setError(null);
    try {
      const updated = await updateIntake(intakeId, {
        status: "Declined",
        assignedReviewer: assignedReviewer || undefined,
        practiceAreaId: Number(practiceAreaId),
        urgency: urgency || undefined,
        consultationDate: consultationDate || undefined,
        legalIssueSummary,
      });
      setIntake(updated);
      setStatus(updated.status);
    } catch {
      setError("Failed to decline intake.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!uploadFile || !uploadCategory) {
      setError("Please select a file and category.");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      await uploadIntakeDocument(
        intakeId,
        uploadFile,
        uploadCategory,
        uploadDescription
      );
      const refreshedDocs = await getIntakeDocuments(intakeId);
      setDocuments(refreshedDocs);
      setUploadFile(null);
      setUploadDescription("");
    } catch {
      setError("Failed to upload document.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error && !intake) return <div style={{ color: "red" }}>{error}</div>;
  if (!intake) return null;

  const isConverted = intake.status === "Converted";

  return (
    <div>
      <button onClick={() => navigate("/intakes")}>← Back to Intakes</button>
      <h1>Intake Detail — {intake.intakeCode}</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Read-only summary area */}
      <section>
        <h2>Summary</h2>
        <p>Prospective Client: {intake.prospectiveClientName}</p>
        <p>Intended Client Type: {intake.intendedClientType ?? "-"}</p>
        <p>Email: {intake.primaryEmail ?? "-"}</p>
        <p>Phone: {intake.primaryPhone ?? "-"}</p>
        <p>Source of Enquiry: {intake.sourceOfEnquiry ?? "-"}</p>
        <p>Created At: {new Date(intake.createdAt).toLocaleString()}</p>
      </section>

      {/* Editable area */}
      <section>
        <h2>Edit</h2>
        <form onSubmit={handleSave}>
          <div>
            <label>Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              disabled={isConverted}
            >
              <option value="New">New</option>
              <option value="Under Review">Under Review</option>
              <option value="Awaiting Information">Awaiting Information</option>
              <option value="Consultation Scheduled">Consultation Scheduled</option>
              <option value="Approved to Proceed">Approved to Proceed</option>
              <option value="Declined">Declined</option>
              <option value="Converted">Converted</option>
            </select>
          </div>

          <div>
            <label>Assigned Reviewer</label>
            <input
              value={assignedReviewer}
              onChange={(e) => setAssignedReviewer(e.target.value)}
              disabled={isConverted}
            />
          </div>

          <div>
            <label>Practice Area</label>
            <select
              value={practiceAreaId}
              onChange={(e) =>
                setPracticeAreaId(e.target.value ? Number(e.target.value) : "")
              }
              disabled={isConverted}
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
            <label>Urgency</label>
            <select
              value={urgency}
              onChange={(e) => setUrgency(e.target.value)}
              disabled={isConverted}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div>
            <label>Consultation Date</label>
            <input
              type="date"
              value={consultationDate}
              onChange={(e) => setConsultationDate(e.target.value)}
              disabled={isConverted}
            />
          </div>

          <div>
            <label>Legal Issue Summary</label>
            <textarea
              value={legalIssueSummary}
              onChange={(e) => setLegalIssueSummary(e.target.value)}
              disabled={isConverted}
            />
          </div>

          <button type="submit" disabled={saving || isConverted}>
            {saving ? "Saving..." : "Save Changes"}
          </button>

          <button
            type="button"
            onClick={handleDecline}
            disabled={saving || isConverted || status === "Declined"}
          >
            Mark as Declined
          </button>

          <button type="button" disabled title="Requires Matter module (INT-04)">
            Convert to Client and Matter
          </button>
        </form>
      </section>

      {/* Doclument Area */}
      <section>
        <h2>Documents</h2>

        <table>
          <thead>
            <tr>
              <th>File Name</th>
              <th>Category</th>
              <th>Description</th>
              <th>Size</th>
              <th>Uploaded At</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr key={doc.documentId}>
                <td>{doc.originalFileName}</td>
                <td>{doc.documentCategory}</td>
                <td>{doc.description ?? "-"}</td>
                <td>{(doc.fileSizeBytes / 1024).toFixed(1)} KB</td>
                <td>{new Date(doc.uploadedAt).toLocaleString()}</td>
                <td>
                  
                    <a href={getDocumentDownloadUrl(doc.documentId)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Download
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3>Upload Document</h3>
        <form onSubmit={handleUpload}>
          <div>
            <label>File</label>
            <input
              type="file"
              onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
            />
          </div>

          <div>
            <label>Category</label>
            <select
              value={uploadCategory}
              onChange={(e) => setUploadCategory(e.target.value)}
            >
              <option value="Client ID">Client ID</option>
              <option value="Engagement Documents">Engagement Documents</option>
              <option value="Correspondence">Correspondence</option>
              <option value="Internal Draft">Internal Draft</option>
            </select>
          </div>

          <div>
            <label>Description</label>
            <input
              value={uploadDescription}
              onChange={(e) => setUploadDescription(e.target.value)}
            />
          </div>

          <button type="submit" disabled={uploading}>
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </form>
      </section>
    </div>
  );
};

export default IntakeDetailPage;