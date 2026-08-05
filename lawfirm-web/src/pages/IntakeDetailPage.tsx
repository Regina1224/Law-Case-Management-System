import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  getIntakeById,
  updateIntake,
  getIntakeDocuments,
  uploadIntakeDocument,
  getDocumentDownloadUrl,
  convertIntake,
  type IntakeDetail,
  type IntakeDocument,
  type ConvertIntakeResult,
} from "../services/intakeService";
import practiceAreaService, {
  type PracticeAreaDto,
} from "../services/practiceAreaService";
import { getClients, type ClientListItem } from "../services/clientService";
import matterTypeService, {
  type MatterTypeDto,
} from "../services/matterTypeService";

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

  // Convert to Client and Matter form status
  const [showConvertForm, setShowConvertForm] = useState(false);
  const [converting, setConverting] = useState(false);
  const [convertError, setConvertError] = useState<string | null>(null);
  const [convertResult, setConvertResult] = useState<ConvertIntakeResult | null>(null);

  const [clients, setClients] = useState<ClientListItem[]>([]);
  const [matterTypes, setMatterTypes] = useState<MatterTypeDto[]>([]);
  const [convertOptionsLoaded, setConvertOptionsLoaded] = useState(false);

  const [clientMode, setClientMode] = useState<"new" | "existing">("new");
  const [existingClientId, setExistingClientId] = useState<number | "">("");
  const [clientType, setClientType] = useState("Individual");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [convertEmail, setConvertEmail] = useState("");
  const [convertPhone, setConvertPhone] = useState("");

  const [matterTitle, setMatterTitle] = useState("");
  const [matterTypeId, setMatterTypeId] = useState<number | "">("");
  const [responsibleLawyer, setResponsibleLawyer] = useState("");
  const [supportingStaff, setSupportingStaff] = useState("");
  const [matterStatus, setMatterStatus] = useState("Draft");
  const [priority, setPriority] = useState("Medium");
  const [openedDate, setOpenedDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [targetCloseDate, setTargetCloseDate] = useState("");
  const [isConfidential, setIsConfidential] = useState(false);

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

  const openConvertForm = async () => {
    if (!intake) return;

    // Naive split of "First Last" into first/last name to save typing; user can edit.
    const nameParts = intake.prospectiveClientName.trim().split(/\s+/);
    setFirstName(nameParts.slice(0, -1).join(" ") || nameParts[0] || "");
    setLastName(nameParts.length > 1 ? nameParts[nameParts.length - 1] : "");
    setOrganizationName(intake.prospectiveClientName);
    setClientType(intake.intendedClientType || "Individual");
    setConvertEmail(intake.primaryEmail ?? "");
    setConvertPhone(intake.primaryPhone ?? "");
    setResponsibleLawyer(intake.assignedReviewer ?? "");
    setPriority(intake.urgency ?? "Medium");

    setConvertError(null);
    setShowConvertForm(true);

    if (!convertOptionsLoaded) {
      try {
        const [clientsRes, matterTypesRes] = await Promise.all([
          getClients({ pageSize: 1000 }),
          matterTypeService.getAll(),
        ]);
        setClients(clientsRes.items);
        setMatterTypes(matterTypesRes.data.data);
        setConvertOptionsLoaded(true);
      } catch {
        setConvertError("Failed to load client/matter type options.");
      }
    }
  };

  const handleConvertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setConvertError(null);

    if (!matterTitle || !matterTypeId || !responsibleLawyer || !matterStatus || !openedDate) {
      setConvertError("Please fill in all required matter fields.");
      return;
    }

    if (clientMode === "existing") {
      if (!existingClientId) {
        setConvertError("Please select a client.");
        return;
      }
    } else if (clientType === "Individual") {
      if (!firstName || !lastName) {
        setConvertError("First name and last name are required for individual client.");
        return;
      }
    } else if (!organizationName) {
      setConvertError("Organization name is required for corporate client.");
      return;
    }

    setConverting(true);

    try {
      const result = await convertIntake(intakeId, {
        existingClientId: clientMode === "existing" ? Number(existingClientId) : undefined,
        clientType: clientMode === "new" ? clientType : undefined,
        firstName: clientMode === "new" && clientType === "Individual" ? firstName : undefined,
        lastName: clientMode === "new" && clientType === "Individual" ? lastName : undefined,
        organizationName:
          clientMode === "new" && clientType === "Corporate" ? organizationName : undefined,
        email: clientMode === "new" ? convertEmail || undefined : undefined,
        phone: clientMode === "new" ? convertPhone || undefined : undefined,
        matterTitle,
        matterTypeId: Number(matterTypeId),
        responsibleLawyer,
        supportingStaff: supportingStaff || undefined,
        status: matterStatus,
        priority: priority || undefined,
        openedDate,
        targetCloseDate: targetCloseDate || undefined,
        isConfidential,
      });

      setConvertResult(result);
      setShowConvertForm(false);

      const refreshed = await getIntakeById(intakeId);
      setIntake(refreshed);
      setStatus(refreshed.status);
    } catch {
      setConvertError("Failed to convert intake. Please check your input.");
    } finally {
      setConverting(false);
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
        </form>
      </section>

      {/* Convert to Client and Matter */}
      <section>
        <h2>Convert to Client and Matter</h2>

        {isConverted ? (
          <div>
            <p>This intake has been converted.</p>
            {convertResult ? (
              <p>
                Created client <strong>{convertResult.clientCode}</strong> and matter{" "}
                <strong>{convertResult.matterNumber}</strong>.{" "}
                <Link to={`/clients/${convertResult.clientId}`}>View Client</Link>{" "}
                | <Link to="/matters">View Matters</Link>
              </p>
            ) : (
              intake.convertedClientId && (
                <p>
                  <Link to={`/clients/${intake.convertedClientId}`}>View Client</Link>{" "}
                  | <Link to="/matters">View Matters</Link>
                </p>
              )
            )}
          </div>
        ) : !showConvertForm ? (
          <button type="button" onClick={openConvertForm}>
            Convert to Client and Matter
          </button>
        ) : (
          <form onSubmit={handleConvertSubmit}>
            {convertError && <p style={{ color: "red" }}>{convertError}</p>}

            <div>
              <label>
                <input
                  type="radio"
                  checked={clientMode === "new"}
                  onChange={() => setClientMode("new")}
                />
                New Client
              </label>
              <label>
                <input
                  type="radio"
                  checked={clientMode === "existing"}
                  onChange={() => setClientMode("existing")}
                />
                Existing Client
              </label>
            </div>

            {clientMode === "existing" ? (
              <div>
                <label>Client</label>
                <select
                  value={existingClientId}
                  onChange={(e) =>
                    setExistingClientId(e.target.value ? Number(e.target.value) : "")
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
            ) : (
              <>
                <div>
                  <label>Client Type</label>
                  <select
                    value={clientType}
                    onChange={(e) => setClientType(e.target.value)}
                  >
                    <option value="Individual">Individual</option>
                    <option value="Corporate">Corporate</option>
                  </select>
                </div>

                {clientType === "Individual" ? (
                  <div>
                    <label>First Name</label>
                    <input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                    <label>Last Name</label>
                    <input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                ) : (
                  <div>
                    <label>Organization Name</label>
                    <input
                      value={organizationName}
                      onChange={(e) => setOrganizationName(e.target.value)}
                    />
                  </div>
                )}

                <div>
                  <label>Email</label>
                  <input
                    value={convertEmail}
                    onChange={(e) => setConvertEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label>Phone</label>
                  <input
                    value={convertPhone}
                    onChange={(e) => setConvertPhone(e.target.value)}
                  />
                </div>
              </>
            )}

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
              <select
                value={matterStatus}
                onChange={(e) => setMatterStatus(e.target.value)}
              >
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

            <button type="submit" disabled={converting}>
              {converting ? "Converting..." : "Convert"}
            </button>
            <button type="button" onClick={() => setShowConvertForm(false)}>
              Cancel
            </button>
          </form>
        )}
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