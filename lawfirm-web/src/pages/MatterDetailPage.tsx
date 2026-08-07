import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getMatterById,
  updateMatter,
  type MatterDetail,
} from "../services/matterService";
import {
  getMatterNotes,
  createMatterNote,
  type MatterNote,
} from "../services/matterNoteService";
import {
  getMatterRelatedParties,
  createMatterRelatedParty,
  updateMatterRelatedParty,
  deactivateMatterRelatedParty,
  type MatterRelatedParty,
} from "../services/matterRelatedPartyService";
import {
  getMatterTasks,
  createMatterTask,
  updateMatterTask,
  type MatterTaskListItem,
} from "../services/matterTaskService";

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

const TASK_STATUSES = [
  "Not Started",
  "In Progress",
  "Waiting on Client",
  "Waiting on External Party",
  "Completed",
  "Cancelled",
];

const isTaskOverdue = (task: MatterTaskListItem) =>
  task.status !== "Completed" &&
  task.status !== "Cancelled" &&
  new Date(task.dueDate) < new Date();

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

  // Notes
  const [notes, setNotes] = useState<MatterNote[]>([]);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteType, setNoteType] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  // Related parties
  const [relatedParties, setRelatedParties] = useState<MatterRelatedParty[]>([]);
  const [editingPartyId, setEditingPartyId] = useState<number | null>(null);
  const [partyName, setPartyName] = useState("");
  const [partyType, setPartyType] = useState("");
  const [partyEmail, setPartyEmail] = useState("");
  const [partyPhone, setPartyPhone] = useState("");
  const [partyOrganization, setPartyOrganization] = useState("");
  const [partyAddress, setPartyAddress] = useState("");
  const [partyNotes, setPartyNotes] = useState("");
  const [savingParty, setSavingParty] = useState(false);
  const [partyError, setPartyError] = useState<string | null>(null);

  // Tasks
  const [tasks, setTasks] = useState<MatterTaskListItem[]>([]);
  const [taskStatusFilter, setTaskStatusFilter] = useState("");
  const [taskAssignedToFilter, setTaskAssignedToFilter] = useState("");
  const [taskPriorityFilter, setTaskPriorityFilter] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskAssignedTo, setTaskAssignedTo] = useState("");
  const [taskPriority, setTaskPriority] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskStatus, setTaskStatus] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [addingTask, setAddingTask] = useState(false);
  const [taskError, setTaskError] = useState<string | null>(null);

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

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const result = await getMatterNotes(matterId);
        setNotes(result);
      } catch {
        // Failure to load notes does not affect the display of the main details page
      }
    };
    fetchNotes();
  }, [matterId]);

  useEffect(() => {
    const fetchParties = async () => {
      try {
        const result = await getMatterRelatedParties(matterId);
        setRelatedParties(result);
      } catch {
        // Failure to load related parties does not affect the display of the main details page
      }
    };
    fetchParties();
  }, [matterId]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const result = await getMatterTasks(matterId, {
          status: taskStatusFilter || undefined,
          assignedTo: taskAssignedToFilter || undefined,
          priority: taskPriorityFilter || undefined,
        });
        setTasks(result);
      } catch {
        // Failure to load tasks does not affect the display of the main details page
      }
    };
    fetchTasks();
  }, [matterId, taskStatusFilter, taskAssignedToFilter, taskPriorityFilter]);

  const resetTaskForm = () => {
    setEditingTaskId(null);
    setTaskTitle("");
    setTaskDescription("");
    setTaskAssignedTo("");
    setTaskPriority("");
    setTaskDueDate("");
    setTaskStatus("");
  };

  const refreshTasks = async () => {
    const result = await getMatterTasks(matterId, {
      status: taskStatusFilter || undefined,
      assignedTo: taskAssignedToFilter || undefined,
      priority: taskPriorityFilter || undefined,
    });
    setTasks(result);
  };

  const handleEditTask = (task: MatterTaskListItem) => {
    setEditingTaskId(task.matterTaskId);
    setTaskTitle(task.title);
    setTaskDescription(task.description ?? "");
    setTaskAssignedTo(task.assignedTo ?? "");
    setTaskPriority(task.priority);
    setTaskDueDate(task.dueDate.slice(0, 10));
    setTaskStatus(task.status);
    setTaskError(null);
  };

  const handleSubmitTask = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !taskTitle ||
      !taskAssignedTo ||
      !taskPriority ||
      !taskDueDate ||
      (editingTaskId && !taskStatus)
    ) {
      setTaskError("Please fill in all required fields.");
      return;
    }

    setAddingTask(true);
    setTaskError(null);

    try {
      if (editingTaskId) {
        await updateMatterTask(matterId, editingTaskId, {
          title: taskTitle,
          description: taskDescription || undefined,
          assignedTo: taskAssignedTo,
          priority: taskPriority,
          status: taskStatus,
          dueDate: taskDueDate,
        });
      } else {
        await createMatterTask(matterId, {
          title: taskTitle,
          description: taskDescription || undefined,
          assignedTo: taskAssignedTo,
          priority: taskPriority,
          dueDate: taskDueDate,
        });
      }

      await refreshTasks();
      resetTaskForm();
    } catch {
      setTaskError(editingTaskId ? "Failed to update task." : "Failed to create task.");
    } finally {
      setAddingTask(false);
    }
  };

  const handleMarkComplete = async (task: MatterTaskListItem) => {
    try {
      await updateMatterTask(matterId, task.matterTaskId, {
        title: task.title,
        description: task.description || undefined,
        assignedTo: task.assignedTo ?? "",
        priority: task.priority,
        status: "Completed",
        dueDate: task.dueDate.slice(0, 10),
      });
      await refreshTasks();
    } catch {
      setTaskError("Failed to mark task as complete.");
    }
  };

  const resetPartyForm = () => {
    setEditingPartyId(null);
    setPartyName("");
    setPartyType("");
    setPartyEmail("");
    setPartyPhone("");
    setPartyOrganization("");
    setPartyAddress("");
    setPartyNotes("");
  };

  const handleEditParty = (party: MatterRelatedParty) => {
    setEditingPartyId(party.matterRelatedPartyId);
    setPartyName(party.partyName);
    setPartyType(party.partyType);
    setPartyEmail(party.email ?? "");
    setPartyPhone(party.phone ?? "");
    setPartyOrganization(party.organization ?? "");
    setPartyAddress(party.address ?? "");
    setPartyNotes(party.notes ?? "");
    setPartyError(null);
  };

  const handleSubmitParty = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!partyName || !partyType) {
      setPartyError("Please fill in all required fields.");
      return;
    }

    setSavingParty(true);
    setPartyError(null);

    const data = {
      partyName,
      partyType,
      email: partyEmail || undefined,
      phone: partyPhone || undefined,
      organization: partyOrganization || undefined,
      address: partyAddress || undefined,
      notes: partyNotes || undefined,
    };

    try {
      if (editingPartyId) {
        await updateMatterRelatedParty(matterId, editingPartyId, data);
      } else {
        await createMatterRelatedParty(matterId, data);
      }

      const result = await getMatterRelatedParties(matterId);
      setRelatedParties(result);
      resetPartyForm();
    } catch {
      setPartyError("Failed to save related party.");
    } finally {
      setSavingParty(false);
    }
  };

  const handleDeactivateParty = async (partyId: number) => {
    try {
      await deactivateMatterRelatedParty(matterId, partyId);
      const result = await getMatterRelatedParties(matterId);
      setRelatedParties(result);
      if (editingPartyId === partyId) {
        resetPartyForm();
      }
    } catch {
      setPartyError("Failed to deactivate related party.");
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingNote(true);

    try {
      await createMatterNote(matterId, {
        noteTitle,
        noteContent,
        noteType: noteType || undefined,
      });

      const result = await getMatterNotes(matterId);
      setNotes(result);

      setNoteTitle("");
      setNoteContent("");
      setNoteType("");
    } catch {
      // A dedicated noteError state could be added to display the error; keeping it simple for now.
    } finally {
      setAddingNote(false);
    }
  };

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

      {/* Notes */}
      <section>
        <h2>Notes</h2>

        {notes.length === 0 ? (
          <p>No notes yet.</p>
        ) : (
          <div>
            {notes.map((note) => (
              <div key={note.matterNoteId}>
                <h4>{note.noteTitle}</h4>
                <p>{note.noteContent}</p>
                <small>
                  {note.noteType} — {new Date(note.createdAt).toLocaleString()}
                </small>
              </div>
            ))}
          </div>
        )}

        <h3>Add Note</h3>
        <form onSubmit={handleAddNote}>
          <div>
            <label>Note Title</label>
            <input
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
            />
          </div>
          <div>
            <label>Note Type</label>
            <select value={noteType} onChange={(e) => setNoteType(e.target.value)}>
              <option value="">-- None --</option>
              <option value="File Note">File Note</option>
              <option value="Client Call">Client Call</option>
              <option value="Meeting Note">Meeting Note</option>
              <option value="Internal Update">Internal Update</option>
            </select>
          </div>
          <div>
            <label>Note Content</label>
            <input
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
            />
          </div>
          <button type="submit" disabled={addingNote}>
            {addingNote ? "Adding..." : "Add Note"}
          </button>
        </form>
      </section>

      {/* Related Parties */}
      <section>
        <h2>Related Parties</h2>

        {relatedParties.length === 0 ? (
          <p>No related parties yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Organization</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {relatedParties.map((party) => (
                <tr key={party.matterRelatedPartyId}>
                  <td>{party.partyName}</td>
                  <td>{party.partyType}</td>
                  <td>{party.email ?? "-"}</td>
                  <td>{party.phone ?? "-"}</td>
                  <td>{party.organization ?? "-"}</td>
                  <td>
                    <button type="button" onClick={() => handleEditParty(party)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleDeactivateParty(party.matterRelatedPartyId)
                      }
                    >
                      Deactivate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <h3>{editingPartyId ? "Edit Related Party" : "Add Related Party"}</h3>
        {partyError && <p style={{ color: "red" }}>{partyError}</p>}

        <form onSubmit={handleSubmitParty}>
          <div>
            <label>Party Name</label>
            <input value={partyName} onChange={(e) => setPartyName(e.target.value)} />
          </div>

          <div>
            <label>Party Type</label>
            <select value={partyType} onChange={(e) => setPartyType(e.target.value)}>
              <option value="">-- Select Party Type --</option>
              <option value="Opposing Party">Opposing Party</option>
              <option value="Witness">Witness</option>
              <option value="Barrister">Barrister</option>
              <option value="Court Contact">Court Contact</option>
              <option value="Insurer">Insurer</option>
              <option value="Expert">Expert</option>
            </select>
          </div>

          <div>
            <label>Email</label>
            <input value={partyEmail} onChange={(e) => setPartyEmail(e.target.value)} />
          </div>

          <div>
            <label>Phone</label>
            <input value={partyPhone} onChange={(e) => setPartyPhone(e.target.value)} />
          </div>

          <div>
            <label>Organization</label>
            <input
              value={partyOrganization}
              onChange={(e) => setPartyOrganization(e.target.value)}
            />
          </div>

          <div>
            <label>Address</label>
            <input
              value={partyAddress}
              onChange={(e) => setPartyAddress(e.target.value)}
            />
          </div>

          <div>
            <label>Notes</label>
            <input value={partyNotes} onChange={(e) => setPartyNotes(e.target.value)} />
          </div>

          <button type="submit" disabled={savingParty}>
            {savingParty ? "Saving..." : editingPartyId ? "Save Changes" : "Add Party"}
          </button>
          {editingPartyId && (
            <button type="button" onClick={resetPartyForm}>
              Cancel
            </button>
          )}
        </form>
      </section>

      {/* Tasks */}
      <section>
        <h2>Tasks</h2>

        <div>
          <label>Status</label>
          <select
            value={taskStatusFilter}
            onChange={(e) => setTaskStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            {TASK_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <label>Assigned To</label>
          <input
            value={taskAssignedToFilter}
            onChange={(e) => setTaskAssignedToFilter(e.target.value)}
            placeholder="Filter by assignee"
          />

          <label>Priority</label>
          <select
            value={taskPriorityFilter}
            onChange={(e) => setTaskPriorityFilter(e.target.value)}
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>

        {tasks.length === 0 ? (
          <p>No tasks found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Assigned To</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Due Date</th>
                <th>Created By</th>
                <th>Created Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.matterTaskId}>
                  <td>{task.title}</td>
                  <td>{task.assignedTo ?? "-"}</td>
                  <td>{task.priority}</td>
                  <td>{task.status}</td>
                  <td style={{ color: isTaskOverdue(task) ? "red" : undefined }}>
                    {new Date(task.dueDate).toLocaleDateString()}
                    {isTaskOverdue(task) ? " (Overdue)" : ""}
                  </td>
                  <td>{task.createdBy ?? "-"}</td>
                  <td>{new Date(task.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button type="button" onClick={() => handleEditTask(task)}>
                      Edit
                    </button>
                    {task.status !== "Completed" && (
                      <button type="button" onClick={() => handleMarkComplete(task)}>
                        Mark Complete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <h3>{editingTaskId ? "Edit Task" : "Add Task"}</h3>
        {taskError && <p style={{ color: "red" }}>{taskError}</p>}

        <form onSubmit={handleSubmitTask}>
          <div>
            <label>Title</label>
            <input value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} />
          </div>

          <div>
            <label>Description</label>
            <input
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
            />
          </div>

          <div>
            <label>Assigned To</label>
            <input
              value={taskAssignedTo}
              onChange={(e) => setTaskAssignedTo(e.target.value)}
            />
          </div>

          <div>
            <label>Priority</label>
            <select
              value={taskPriority}
              onChange={(e) => setTaskPriority(e.target.value)}
            >
              <option value="">-- Select Priority --</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          {editingTaskId && (
            <div>
              <label>Status</label>
              <select
                value={taskStatus}
                onChange={(e) => setTaskStatus(e.target.value)}
              >
                {TASK_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label>Due Date</label>
            <input
              type="date"
              value={taskDueDate}
              onChange={(e) => setTaskDueDate(e.target.value)}
            />
          </div>

          <button type="submit" disabled={addingTask}>
            {addingTask
              ? "Saving..."
              : editingTaskId
              ? "Save Changes"
              : "Add Task"}
          </button>
          {editingTaskId && (
            <button type="button" onClick={resetTaskForm}>
              Cancel
            </button>
          )}
        </form>
      </section>
    </div>
  );
};

export default MatterDetailPage;