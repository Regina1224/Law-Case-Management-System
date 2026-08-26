import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, Archive, ArchiveRestore, Trash2, AlertTriangle } from "lucide-react";
import {
  getMatterById,
  updateMatter,
  closeMatter,
  archiveMatter,
  unarchiveMatter,
  type MatterDetail,
} from "../services/matterService";
import {
  getMatterNotes,
  createMatterNote,
  deleteMatterNote,
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
import {
  getMatterDeadlines,
  createMatterDeadline,
  updateMatterDeadlineStatus,
  type MatterDeadlineListItem,
} from "../services/matterDeadlineService";
import {
  getMatterDocuments,
  uploadMatterDocument,
  type MatterDocument,
} from "../services/matterDocumentService";
import { downloadDocument } from "../services/documentDownload";
import MatterStatusBadge from "@/components/MatterStatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MATTER_STATUSES = [
  "Draft",
  "Open",
  "Awaiting Client Documents",
  "In Progress",
  "Awaiting External Response",
  "On Hold",
];

const TASK_STATUSES = [
  "Not Started",
  "In Progress",
  "Waiting on Client",
  "Waiting on External Party",
  "Completed",
  "Cancelled",
];

const editAssignmentSchema = z.object({
  responsibleLawyer: z.string().min(1, "Responsible lawyer is required."),
  supportingStaff: z.string().optional(),
  status: z.string().min(1, "Status is required."),
  priority: z.string().optional(),
  targetCloseDate: z.string().optional(),
});
type EditAssignmentFormValues = z.infer<typeof editAssignmentSchema>;

const closeMatterSchema = z.object({
  closureDate: z.string().min(1, "Closure date is required."),
  closureReason: z.string().min(1, "Closure reason is required."),
  closureNotes: z.string().optional(),
});
type CloseMatterFormValues = z.infer<typeof closeMatterSchema>;

const noteSchema = z.object({
  noteTitle: z.string().min(1, "Note title is required."),
  noteType: z.string().optional(),
  noteContent: z.string().min(1, "Note content is required."),
});
type NoteFormValues = z.infer<typeof noteSchema>;

const relatedPartySchema = z.object({
  partyName: z.string().min(1, "Party name is required."),
  partyType: z.string().min(1, "Party type is required."),
  email: z.string().optional(),
  phone: z.string().optional(),
  organization: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});
type RelatedPartyFormValues = z.infer<typeof relatedPartySchema>;

const taskSchema = z.object({
  title: z.string().min(1, "Title is required."),
  description: z.string().optional(),
  assignedTo: z.string().min(1, "Assigned to is required."),
  priority: z.string().min(1, "Priority is required."),
  status: z.string().optional(),
  dueDate: z.string().min(1, "Due date is required."),
});
type TaskFormValues = z.infer<typeof taskSchema>;

const deadlineSchema = z.object({
  title: z.string().min(1, "Title is required."),
  deadlineType: z.string().min(1, "Deadline type is required."),
  dueDateTime: z.string().min(1, "Due date/time is required."),
  responsiblePerson: z.string().min(1, "Responsible person is required."),
  locationOrCourt: z.string().optional(),
  notes: z.string().optional(),
});
type DeadlineFormValues = z.infer<typeof deadlineSchema>;

const uploadDocumentSchema = z.object({
  file: z
    .instanceof(FileList)
    .refine((files) => files.length > 0, "File is required."),
  documentCategory: z.string().min(1, "Category is required."),
  description: z.string().optional(),
});
type UploadDocumentFormValues = z.infer<typeof uploadDocumentSchema>;

const isTaskOverdue = (task: MatterTaskListItem) =>
  task.status !== "Completed" &&
  task.status !== "Cancelled" &&
  new Date(task.dueDate) < new Date();

const isDeadlinePassed = (deadline: MatterDeadlineListItem) =>
  deadline.status === "Scheduled" && new Date(deadline.dueDateTime) < new Date();

const MatterDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const matterId = Number(id);

  const [matter, setMatter] = useState<MatterDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit assignment / status form
  const {
    register: registerAssignment,
    handleSubmit: handleSubmitAssignment,
    control: assignmentControl,
    reset: resetAssignmentForm,
    formState: { errors: assignmentErrors, isSubmitting: savingAssignment },
  } = useForm<EditAssignmentFormValues>({
    resolver: zodResolver(editAssignmentSchema),
    defaultValues: {
      responsibleLawyer: "",
      supportingStaff: "",
      status: "",
      priority: "",
      targetCloseDate: "",
    },
  });

  // Close matter form
  const {
    register: registerClose,
    handleSubmit: handleSubmitClose,
    formState: { errors: closeErrors, isSubmitting: closingMatter },
  } = useForm<CloseMatterFormValues>({
    resolver: zodResolver(closeMatterSchema),
    defaultValues: {
      closureDate: new Date().toISOString().slice(0, 10),
      closureReason: "",
      closureNotes: "",
    },
  });

  // Archive matter
  const [archiving, setArchiving] = useState(false);

  // Notes
  const [notes, setNotes] = useState<MatterNote[]>([]);
  const {
    register: registerNote,
    handleSubmit: handleSubmitNoteForm,
    control: noteControl,
    reset: resetNoteForm,
    formState: { errors: noteErrors, isSubmitting: addingNote },
  } = useForm<NoteFormValues>({
    resolver: zodResolver(noteSchema),
    defaultValues: { noteTitle: "", noteType: "", noteContent: "" },
  });

  // Related parties
  const [relatedParties, setRelatedParties] = useState<MatterRelatedParty[]>([]);
  const [editingPartyId, setEditingPartyId] = useState<number | null>(null);
  const {
    register: registerParty,
    handleSubmit: handleSubmitPartyForm,
    control: partyControl,
    reset: resetPartyFormFields,
    formState: { errors: partyErrors, isSubmitting: savingParty },
  } = useForm<RelatedPartyFormValues>({
    resolver: zodResolver(relatedPartySchema),
    defaultValues: {
      partyName: "",
      partyType: "",
      email: "",
      phone: "",
      organization: "",
      address: "",
      notes: "",
    },
  });

  // Tasks
  const [tasks, setTasks] = useState<MatterTaskListItem[]>([]);
  const [taskStatusFilter, setTaskStatusFilter] = useState("");
  const [taskAssignedToFilter, setTaskAssignedToFilter] = useState("");
  const [taskPriorityFilter, setTaskPriorityFilter] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const {
    register: registerTask,
    handleSubmit: handleSubmitTaskForm,
    control: taskControl,
    reset: resetTaskFormFields,
    formState: { errors: taskErrors, isSubmitting: addingTask },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      assignedTo: "",
      priority: "",
      status: "",
      dueDate: "",
    },
  });

  // Deadlines
  const [deadlines, setDeadlines] = useState<MatterDeadlineListItem[]>([]);
  const {
    register: registerDeadline,
    handleSubmit: handleSubmitDeadlineForm,
    control: deadlineControl,
    reset: resetDeadlineForm,
    formState: { errors: deadlineErrors, isSubmitting: addingDeadline },
  } = useForm<DeadlineFormValues>({
    resolver: zodResolver(deadlineSchema),
    defaultValues: {
      title: "",
      deadlineType: "",
      dueDateTime: "",
      responsiblePerson: "",
      locationOrCourt: "",
      notes: "",
    },
  });

  // Documents
  const [documents, setDocuments] = useState<MatterDocument[]>([]);
  const {
    register: registerUpload,
    handleSubmit: handleSubmitUpload,
    control: uploadControl,
    reset: resetUploadForm,
    formState: { errors: uploadErrors, isSubmitting: uploading },
  } = useForm<UploadDocumentFormValues>({
    resolver: zodResolver(uploadDocumentSchema),
    defaultValues: {
      documentCategory: "Engagement Documents",
      description: "",
    },
  });

  useEffect(() => {
    const fetchMatter = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getMatterById(matterId);
        setMatter(result);
        resetAssignmentForm({
          responsibleLawyer: result.responsibleLawyer ?? "",
          supportingStaff: result.supportingStaff ?? "",
          status: result.status,
          priority: result.priority ?? "",
          targetCloseDate: result.targetCloseDate
            ? result.targetCloseDate.slice(0, 10)
            : "",
        });
      } catch {
        setError(`Failed to load the detail page of matter id:${matterId}.`);
      } finally {
        setLoading(false);
      }
    };
    fetchMatter();
  }, [matterId, resetAssignmentForm]);

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

  useEffect(() => {
    const fetchDeadlines = async () => {
      try {
        const result = await getMatterDeadlines(matterId);
        setDeadlines(result);
      } catch {
        // Failure to load deadlines does not affect the display of the main details page
      }
    };
    fetchDeadlines();
  }, [matterId]);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const result = await getMatterDocuments(matterId);
        setDocuments(result);
      } catch {
        // Failure to load documents does not affect the display of the main details page
      }
    };
    fetchDocuments();
  }, [matterId]);

  const onSubmitUpload = async (values: UploadDocumentFormValues) => {
    try {
      await uploadMatterDocument(
        matterId,
        values.file[0],
        values.documentCategory,
        values.description ?? ""
      );
      const refreshedDocs = await getMatterDocuments(matterId);
      setDocuments(refreshedDocs);
      toast.success("Document uploaded.");
      resetUploadForm({
        documentCategory: "Engagement Documents",
        description: "",
      });
    } catch {
      toast.error("Failed to upload document.");
    }
  };

  const onSubmitClose = async (values: CloseMatterFormValues) => {
    try {
      const updated = await closeMatter(matterId, {
        closureDate: values.closureDate,
        closureReason: values.closureReason,
        closureNotes: values.closureNotes || undefined,
      });
      setMatter(updated);
      toast.success("Matter closed.");
    } catch {
      toast.error("Failed to close matter.");
    }
  };

  const handleArchiveMatter = async () => {
    setArchiving(true);

    try {
      const updated = await archiveMatter(matterId);
      setMatter(updated);
      toast.success("Matter archived.");
    } catch {
      toast.error("Failed to archive matter.");
    } finally {
      setArchiving(false);
    }
  };

  const handleUnarchiveMatter = async () => {
    setArchiving(true);

    try {
      const updated = await unarchiveMatter(matterId);
      setMatter(updated);
      toast.success("Matter unarchived.");
    } catch {
      toast.error("Failed to unarchive matter.");
    } finally {
      setArchiving(false);
    }
  };

  const onSubmitDeadline = async (values: DeadlineFormValues) => {
    try {
      await createMatterDeadline(matterId, {
        title: values.title,
        deadlineType: values.deadlineType,
        dueDateTime: values.dueDateTime,
        responsiblePerson: values.responsiblePerson,
        locationOrCourt: values.locationOrCourt || undefined,
        notes: values.notes || undefined,
      });

      const result = await getMatterDeadlines(matterId);
      setDeadlines(result);
      toast.success("Deadline created.");
      resetDeadlineForm({
        title: "",
        deadlineType: "",
        dueDateTime: "",
        responsiblePerson: "",
        locationOrCourt: "",
        notes: "",
      });
    } catch {
      toast.error("Failed to create deadline.");
    }
  };

  const handleUpdateDeadlineStatus = async (deadlineId: number, status: string) => {
    try {
      await updateMatterDeadlineStatus(matterId, deadlineId, status);
      const result = await getMatterDeadlines(matterId);
      setDeadlines(result);
      toast.success("Deadline status updated.");
    } catch {
      toast.error("Failed to update deadline status.");
    }
  };

  const resetTaskForm = () => {
    setEditingTaskId(null);
    resetTaskFormFields({
      title: "",
      description: "",
      assignedTo: "",
      priority: "",
      status: "",
      dueDate: "",
    });
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
    resetTaskFormFields({
      title: task.title,
      description: task.description ?? "",
      assignedTo: task.assignedTo ?? "",
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate.slice(0, 10),
    });
  };

  const onSubmitTask = async (values: TaskFormValues) => {
    if (editingTaskId && !values.status) {
      toast.error("Please select a status.");
      return;
    }

    try {
      if (editingTaskId) {
        await updateMatterTask(matterId, editingTaskId, {
          title: values.title,
          description: values.description || undefined,
          assignedTo: values.assignedTo,
          priority: values.priority,
          status: values.status ?? "",
          dueDate: values.dueDate,
        });
      } else {
        await createMatterTask(matterId, {
          title: values.title,
          description: values.description || undefined,
          assignedTo: values.assignedTo,
          priority: values.priority,
          dueDate: values.dueDate,
        });
      }

      await refreshTasks();
      toast.success(editingTaskId ? "Task updated." : "Task created.");
      resetTaskForm();
    } catch {
      toast.error(editingTaskId ? "Failed to update task." : "Failed to create task.");
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
      toast.success("Task marked as complete.");
    } catch {
      toast.error("Failed to mark task as complete.");
    }
  };

  const resetPartyForm = () => {
    setEditingPartyId(null);
    resetPartyFormFields({
      partyName: "",
      partyType: "",
      email: "",
      phone: "",
      organization: "",
      address: "",
      notes: "",
    });
  };

  const handleEditParty = (party: MatterRelatedParty) => {
    setEditingPartyId(party.matterRelatedPartyId);
    resetPartyFormFields({
      partyName: party.partyName,
      partyType: party.partyType,
      email: party.email ?? "",
      phone: party.phone ?? "",
      organization: party.organization ?? "",
      address: party.address ?? "",
      notes: party.notes ?? "",
    });
  };

  const onSubmitParty = async (values: RelatedPartyFormValues) => {
    const data = {
      partyName: values.partyName,
      partyType: values.partyType,
      email: values.email || undefined,
      phone: values.phone || undefined,
      organization: values.organization || undefined,
      address: values.address || undefined,
      notes: values.notes || undefined,
    };

    try {
      if (editingPartyId) {
        await updateMatterRelatedParty(matterId, editingPartyId, data);
      } else {
        await createMatterRelatedParty(matterId, data);
      }

      const result = await getMatterRelatedParties(matterId);
      setRelatedParties(result);
      toast.success(editingPartyId ? "Related party updated." : "Related party added.");
      resetPartyForm();
    } catch {
      toast.error("Failed to save related party.");
    }
  };

  const handleDeactivateParty = async (partyId: number) => {
    try {
      await deactivateMatterRelatedParty(matterId, partyId);
      const result = await getMatterRelatedParties(matterId);
      setRelatedParties(result);
      toast.success("Related party deactivated.");
      if (editingPartyId === partyId) {
        resetPartyForm();
      }
    } catch {
      toast.error("Failed to deactivate related party.");
    }
  };

  const onSubmitNote = async (values: NoteFormValues) => {
    try {
      await createMatterNote(matterId, {
        noteTitle: values.noteTitle,
        noteContent: values.noteContent,
        noteType: values.noteType || undefined,
      });

      const result = await getMatterNotes(matterId);
      setNotes(result);
      toast.success("Note added.");
      resetNoteForm({ noteTitle: "", noteType: "", noteContent: "" });
    } catch {
      toast.error("Failed to add note.");
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    try {
      await deleteMatterNote(matterId, noteId);
      const result = await getMatterNotes(matterId);
      setNotes(result);
      toast.success("Note deleted.");
    } catch {
      toast.error("Failed to delete note.");
    }
  };

  const onSubmitAssignment = async (values: EditAssignmentFormValues) => {
    try {
      const updated = await updateMatter(matterId, {
        responsibleLawyer: values.responsibleLawyer,
        supportingStaff: values.supportingStaff || undefined,
        status: values.status,
        priority: values.priority || undefined,
        targetCloseDate: values.targetCloseDate || undefined,
      });
      setMatter(updated);
      toast.success("Matter updated.");
    } catch {
      toast.error("Failed to update matter.");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-16 text-center">
        <AlertTriangle className="size-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button variant="outline" size="sm" render={<Link to="/matters" />}>
          <ArrowLeft />
          Back to Matters
        </Button>
      </div>
    );
  }
  if (!matter) return null;

  const isReadOnly = matter.status === "Closed" || matter.status === "Archived";

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" render={<Link to="/matters" />}>
          <ArrowLeft />
          Back to Matters
        </Button>
        <div className="mt-2 flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">
            {matter.matterTitle}
          </h1>
          <MatterStatusBadge status={matter.status} />
        </div>
        <p className="text-sm text-muted-foreground">
          {matter.matterNumber} · {matter.matterTypeName} ·{" "}
          {matter.practiceAreaName}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Summary
                </p>
                <p className="text-sm">{matter.summary}</p>
              </div>

              <Separator />

              <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                <div>
                  <dt className="text-sm text-muted-foreground">Client</dt>
                  <dd className="text-sm">
                    <Link
                      to={`/clients/${matter.clientId}`}
                      className="text-primary hover:underline"
                    >
                      {matter.clientName} ({matter.clientCode})
                    </Link>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Status</dt>
                  <dd className="text-sm">
                    <MatterStatusBadge status={matter.status} />
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">
                    Responsible Lawyer
                  </dt>
                  <dd className="text-sm">
                    {matter.responsibleLawyer ?? "-"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">
                    Supporting Staff
                  </dt>
                  <dd className="text-sm">
                    {matter.supportingStaff ?? "-"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Priority</dt>
                  <dd className="text-sm">{matter.priority ?? "-"}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">
                    Opened Date
                  </dt>
                  <dd className="text-sm">
                    {new Date(matter.openedDate).toLocaleDateString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">
                    Target Close Date
                  </dt>
                  <dd className="text-sm">
                    {matter.targetCloseDate
                      ? new Date(matter.targetCloseDate).toLocaleDateString()
                      : "-"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">
                    Closed Date
                  </dt>
                  <dd className="text-sm">
                    {matter.closedDate
                      ? new Date(matter.closedDate).toLocaleDateString()
                      : "-"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">
                    Confidential
                  </dt>
                  <dd className="text-sm">
                    {matter.isConfidential ? "Yes" : "No"}
                  </dd>
                </div>
              </dl>

              <p className="text-xs text-muted-foreground">
                Created {new Date(matter.createdAt).toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Edit Assignment / Status</CardTitle>
            </CardHeader>
            <CardContent>
              {isReadOnly ? (
                <p className="text-sm text-muted-foreground">
                  This matter is closed or archived and cannot be edited.
                </p>
              ) : (
                <form onSubmit={handleSubmitAssignment(onSubmitAssignment)}>
                  <FieldGroup>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field>
                        <FieldLabel htmlFor="responsibleLawyer">
                          Responsible Lawyer
                        </FieldLabel>
                        <Input
                          id="responsibleLawyer"
                          aria-invalid={!!assignmentErrors.responsibleLawyer}
                          {...registerAssignment("responsibleLawyer")}
                        />
                        <FieldError
                          errors={
                            assignmentErrors.responsibleLawyer
                              ? [assignmentErrors.responsibleLawyer]
                              : undefined
                          }
                        />
                      </Field>

                      <Field>
                        <FieldLabel htmlFor="supportingStaff">
                          Supporting Staff
                        </FieldLabel>
                        <Input
                          id="supportingStaff"
                          {...registerAssignment("supportingStaff")}
                        />
                      </Field>

                      <Field>
                        <FieldLabel htmlFor="matterStatus">Status</FieldLabel>
                        <Controller
                          control={assignmentControl}
                          name="status"
                          render={({ field }) => (
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger
                                id="matterStatus"
                                className="w-full"
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {MATTER_STATUSES.map((s) => (
                                  <SelectItem key={s} value={s}>
                                    {s}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </Field>

                      <Field>
                        <FieldLabel htmlFor="matterPriority">
                          Priority
                        </FieldLabel>
                        <Controller
                          control={assignmentControl}
                          name="priority"
                          render={({ field }) => (
                            <Select
                              value={field.value ?? ""}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger
                                id="matterPriority"
                                className="w-full"
                              >
                                <SelectValue placeholder="-- None --" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Low">Low</SelectItem>
                                <SelectItem value="Medium">Medium</SelectItem>
                                <SelectItem value="High">High</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </Field>

                      <Field>
                        <FieldLabel htmlFor="matterTargetCloseDate">
                          Target Close Date
                        </FieldLabel>
                        <Input
                          id="matterTargetCloseDate"
                          type="date"
                          {...registerAssignment("targetCloseDate")}
                        />
                      </Field>
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit" disabled={savingAssignment}>
                        {savingAssignment ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </FieldGroup>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>
                {matter.status === "Archived"
                  ? "Archived"
                  : matter.status === "Closed"
                  ? "Closed"
                  : "Close Matter"}
              </CardTitle>
              {matter.status !== "Closed" && matter.status !== "Archived" && (
                <CardDescription>
                  Mark this matter as completed.
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {matter.status === "Archived" ? (
                <div className="space-y-4">
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Closed Date</dt>
                      <dd>
                        {matter.closedDate
                          ? new Date(matter.closedDate).toLocaleDateString()
                          : "-"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">
                        Closure Reason
                      </dt>
                      <dd>{matter.closureReason ?? "-"}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Closure Notes</dt>
                      <dd>{matter.closureNotes ?? "-"}</dd>
                    </div>
                  </dl>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleUnarchiveMatter}
                    disabled={archiving}
                  >
                    <ArchiveRestore />
                    {archiving ? "Unarchiving..." : "Unarchive Matter"}
                  </Button>
                </div>
              ) : matter.status === "Closed" ? (
                <div className="space-y-4">
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Closed Date</dt>
                      <dd>
                        {matter.closedDate
                          ? new Date(matter.closedDate).toLocaleDateString()
                          : "-"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">
                        Closure Reason
                      </dt>
                      <dd>{matter.closureReason ?? "-"}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Closure Notes</dt>
                      <dd>{matter.closureNotes ?? "-"}</dd>
                    </div>
                  </dl>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleArchiveMatter}
                    disabled={archiving}
                  >
                    <Archive />
                    {archiving ? "Archiving..." : "Archive Matter"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {(tasks.some(
                    (t) => t.status !== "Completed" && t.status !== "Cancelled"
                  ) ||
                    deadlines.some((d) => d.status === "Scheduled")) && (
                    <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-400">
                      This matter still has open tasks or scheduled
                      deadlines. You can still close it, but consider
                      reviewing them first.
                    </p>
                  )}

                  <form onSubmit={handleSubmitClose(onSubmitClose)}>
                    <FieldGroup>
                      <Field>
                        <FieldLabel htmlFor="closureDate">
                          Closure Date
                        </FieldLabel>
                        <Input
                          id="closureDate"
                          type="date"
                          aria-invalid={!!closeErrors.closureDate}
                          {...registerClose("closureDate")}
                        />
                        <FieldError
                          errors={
                            closeErrors.closureDate
                              ? [closeErrors.closureDate]
                              : undefined
                          }
                        />
                      </Field>

                      <Field>
                        <FieldLabel htmlFor="closureReason">
                          Closure Reason
                        </FieldLabel>
                        <Input
                          id="closureReason"
                          aria-invalid={!!closeErrors.closureReason}
                          {...registerClose("closureReason")}
                        />
                        <FieldError
                          errors={
                            closeErrors.closureReason
                              ? [closeErrors.closureReason]
                              : undefined
                          }
                        />
                      </Field>

                      <Field>
                        <FieldLabel htmlFor="closureNotes">
                          Closure Notes
                        </FieldLabel>
                        <Textarea
                          id="closureNotes"
                          {...registerClose("closureNotes")}
                        />
                      </Field>

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={closingMatter}
                      >
                        {closingMatter ? "Closing..." : "Close Matter"}
                      </Button>
                    </FieldGroup>
                  </form>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {notes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No notes yet.</p>
          ) : (
            <div className="space-y-4">
              {notes.map((note) => (
                <div key={note.matterNoteId} className="rounded-md border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-medium">{note.noteTitle}</h4>
                    <div className="flex items-center gap-2">
                      {note.noteType && (
                        <Badge variant="outline">{note.noteType}</Badge>
                      )}
                      {!isReadOnly && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon-sm"
                          aria-label="Delete note"
                          onClick={() => handleDeleteNote(note.matterNoteId)}
                        >
                          <Trash2 />
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {note.noteContent}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {new Date(note.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}

          {isReadOnly ? (
            <p className="text-sm text-muted-foreground">
              This matter is closed or archived. Notes cannot be added.
            </p>
          ) : (
            <>
              <Separator />
              <form onSubmit={handleSubmitNoteForm(onSubmitNote)}>
                <FieldGroup>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field>
                      <FieldLabel htmlFor="noteTitle">Note Title</FieldLabel>
                      <Input
                        id="noteTitle"
                        aria-invalid={!!noteErrors.noteTitle}
                        {...registerNote("noteTitle")}
                      />
                      <FieldError
                        errors={
                          noteErrors.noteTitle ? [noteErrors.noteTitle] : undefined
                        }
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="noteType">Note Type</FieldLabel>
                      <Controller
                        control={noteControl}
                        name="noteType"
                        render={({ field }) => (
                          <Select
                            value={field.value ?? ""}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger id="noteType" className="w-full">
                              <SelectValue placeholder="-- None --" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="File Note">File Note</SelectItem>
                              <SelectItem value="Client Call">Client Call</SelectItem>
                              <SelectItem value="Meeting Note">Meeting Note</SelectItem>
                              <SelectItem value="Internal Update">Internal Update</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </Field>
                  </div>
                  <Field>
                    <FieldLabel htmlFor="noteContent">Note Content</FieldLabel>
                    <Textarea
                      id="noteContent"
                      aria-invalid={!!noteErrors.noteContent}
                      {...registerNote("noteContent")}
                    />
                    <FieldError
                      errors={
                        noteErrors.noteContent ? [noteErrors.noteContent] : undefined
                      }
                    />
                  </Field>
                  <div className="flex justify-end">
                    <Button type="submit" disabled={addingNote}>
                      {addingNote ? "Adding..." : "Add Note"}
                    </Button>
                  </div>
                </FieldGroup>
              </form>
            </>
          )}
        </CardContent>
      </Card>

      {/* Related Parties */}
      <Card>
        <CardHeader>
          <CardTitle>Related Parties</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {relatedParties.length === 0 ? (
            <p className="text-sm text-muted-foreground">No related parties yet.</p>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {relatedParties.map((party) => (
                    <TableRow key={party.matterRelatedPartyId}>
                      <TableCell>{party.partyName}</TableCell>
                      <TableCell>{party.partyType}</TableCell>
                      <TableCell>{party.email ?? "-"}</TableCell>
                      <TableCell>{party.phone ?? "-"}</TableCell>
                      <TableCell>{party.organization ?? "-"}</TableCell>
                      <TableCell className="text-right">
                        {!isReadOnly && (
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditParty(party)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() =>
                                handleDeactivateParty(party.matterRelatedPartyId)
                              }
                            >
                              Deactivate
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {isReadOnly ? (
            <p className="text-sm text-muted-foreground">
              This matter is closed or archived. Related parties cannot be
              added or edited.
            </p>
          ) : (
            <>
              <Separator />
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">
                  {editingPartyId ? "Edit Related Party" : "Add Related Party"}
                </h3>
              </div>
              <form onSubmit={handleSubmitPartyForm(onSubmitParty)}>
                <FieldGroup>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field>
                      <FieldLabel htmlFor="partyName">Party Name</FieldLabel>
                      <Input
                        id="partyName"
                        aria-invalid={!!partyErrors.partyName}
                        {...registerParty("partyName")}
                      />
                      <FieldError
                        errors={
                          partyErrors.partyName ? [partyErrors.partyName] : undefined
                        }
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="partyType">Party Type</FieldLabel>
                      <Controller
                        control={partyControl}
                        name="partyType"
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger
                              id="partyType"
                              className="w-full"
                              aria-invalid={!!partyErrors.partyType}
                            >
                              <SelectValue placeholder="-- Select Party Type --" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Opposing Party">Opposing Party</SelectItem>
                              <SelectItem value="Witness">Witness</SelectItem>
                              <SelectItem value="Barrister">Barrister</SelectItem>
                              <SelectItem value="Court Contact">Court Contact</SelectItem>
                              <SelectItem value="Insurer">Insurer</SelectItem>
                              <SelectItem value="Expert">Expert</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      <FieldError
                        errors={
                          partyErrors.partyType ? [partyErrors.partyType] : undefined
                        }
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="partyEmail">Email</FieldLabel>
                      <Input id="partyEmail" {...registerParty("email")} />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="partyPhone">Phone</FieldLabel>
                      <Input id="partyPhone" {...registerParty("phone")} />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="partyOrganization">Organization</FieldLabel>
                      <Input id="partyOrganization" {...registerParty("organization")} />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="partyAddress">Address</FieldLabel>
                      <Input id="partyAddress" {...registerParty("address")} />
                    </Field>
                  </div>
                  <Field>
                    <FieldLabel htmlFor="partyNotes">Notes</FieldLabel>
                    <Textarea id="partyNotes" {...registerParty("notes")} />
                  </Field>
                  <div className="flex justify-end gap-2">
                    {editingPartyId && (
                      <Button type="button" variant="outline" onClick={resetPartyForm}>
                        Cancel
                      </Button>
                    )}
                    <Button type="submit" disabled={savingParty}>
                      {savingParty
                        ? "Saving..."
                        : editingPartyId
                        ? "Save Changes"
                        : "Add Party"}
                    </Button>
                  </div>
                </FieldGroup>
              </form>
            </>
          )}
        </CardContent>
      </Card>

      {/* Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap items-end gap-3">
            <div className="w-48">
              <FieldLabel className="mb-1.5">Status</FieldLabel>
              <Select
                value={taskStatusFilter || "all"}
                onValueChange={(value) =>
                  setTaskStatusFilter(!value || value === "all" ? "" : value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {TASK_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-56">
              <FieldLabel htmlFor="taskAssignedToFilter" className="mb-1.5">
                Assigned To
              </FieldLabel>
              <Input
                id="taskAssignedToFilter"
                value={taskAssignedToFilter}
                onChange={(e) => setTaskAssignedToFilter(e.target.value)}
                placeholder="Filter by assignee"
              />
            </div>
            <div className="w-40">
              <FieldLabel className="mb-1.5">Priority</FieldLabel>
              <Select
                value={taskPriorityFilter || "all"}
                onValueChange={(value) =>
                  setTaskPriorityFilter(!value || value === "all" ? "" : value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {tasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tasks found.</p>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead>Created Date</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map((task) => (
                    <TableRow key={task.matterTaskId}>
                      <TableCell>{task.title}</TableCell>
                      <TableCell>{task.assignedTo ?? "-"}</TableCell>
                      <TableCell>{task.priority}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{task.status}</Badge>
                      </TableCell>
                      <TableCell
                        className={
                          isTaskOverdue(task) ? "text-destructive" : undefined
                        }
                      >
                        {new Date(task.dueDate).toLocaleDateString()}
                        {isTaskOverdue(task) ? " (Overdue)" : ""}
                      </TableCell>
                      <TableCell>{task.createdBy ?? "-"}</TableCell>
                      <TableCell>
                        {new Date(task.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {!isReadOnly && (
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditTask(task)}
                            >
                              Edit
                            </Button>
                            {task.status !== "Completed" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMarkComplete(task)}
                              >
                                Mark Complete
                              </Button>
                            )}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {isReadOnly ? (
            <p className="text-sm text-muted-foreground">
              This matter is closed or archived. Tasks cannot be added or edited.
            </p>
          ) : (
            <>
              <Separator />
              <h3 className="text-sm font-medium">
                {editingTaskId ? "Edit Task" : "Add Task"}
              </h3>
              <form onSubmit={handleSubmitTaskForm(onSubmitTask)}>
                <FieldGroup>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field>
                      <FieldLabel htmlFor="taskTitle">Title</FieldLabel>
                      <Input
                        id="taskTitle"
                        aria-invalid={!!taskErrors.title}
                        {...registerTask("title")}
                      />
                      <FieldError
                        errors={taskErrors.title ? [taskErrors.title] : undefined}
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="taskAssignedTo">Assigned To</FieldLabel>
                      <Input
                        id="taskAssignedTo"
                        aria-invalid={!!taskErrors.assignedTo}
                        {...registerTask("assignedTo")}
                      />
                      <FieldError
                        errors={
                          taskErrors.assignedTo ? [taskErrors.assignedTo] : undefined
                        }
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="taskPriority">Priority</FieldLabel>
                      <Controller
                        control={taskControl}
                        name="priority"
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger
                              id="taskPriority"
                              className="w-full"
                              aria-invalid={!!taskErrors.priority}
                            >
                              <SelectValue placeholder="-- Select Priority --" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Low">Low</SelectItem>
                              <SelectItem value="Medium">Medium</SelectItem>
                              <SelectItem value="High">High</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      <FieldError
                        errors={taskErrors.priority ? [taskErrors.priority] : undefined}
                      />
                    </Field>
                    {editingTaskId && (
                      <Field>
                        <FieldLabel htmlFor="taskStatus">Status</FieldLabel>
                        <Controller
                          control={taskControl}
                          name="status"
                          render={({ field }) => (
                            <Select
                              value={field.value ?? ""}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger id="taskStatus" className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {TASK_STATUSES.map((s) => (
                                  <SelectItem key={s} value={s}>
                                    {s}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </Field>
                    )}
                    <Field>
                      <FieldLabel htmlFor="taskDueDate">Due Date</FieldLabel>
                      <Input
                        id="taskDueDate"
                        type="date"
                        aria-invalid={!!taskErrors.dueDate}
                        {...registerTask("dueDate")}
                      />
                      <FieldError
                        errors={taskErrors.dueDate ? [taskErrors.dueDate] : undefined}
                      />
                    </Field>
                  </div>
                  <Field>
                    <FieldLabel htmlFor="taskDescription">Description</FieldLabel>
                    <Textarea id="taskDescription" {...registerTask("description")} />
                  </Field>
                  <div className="flex justify-end gap-2">
                    {editingTaskId && (
                      <Button type="button" variant="outline" onClick={resetTaskForm}>
                        Cancel
                      </Button>
                    )}
                    <Button type="submit" disabled={addingTask}>
                      {addingTask
                        ? "Saving..."
                        : editingTaskId
                        ? "Save Changes"
                        : "Add Task"}
                    </Button>
                  </div>
                </FieldGroup>
              </form>
            </>
          )}
        </CardContent>
      </Card>

      {/* Deadlines */}
      <Card>
        <CardHeader>
          <CardTitle>Deadlines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {deadlines.length === 0 ? (
            <p className="text-sm text-muted-foreground">No deadlines yet.</p>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Due Date / Time</TableHead>
                    <TableHead>Responsible Person</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Location / Court</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deadlines.map((deadline) => (
                    <TableRow key={deadline.matterDeadlineId}>
                      <TableCell>{deadline.title}</TableCell>
                      <TableCell>{deadline.deadlineType}</TableCell>
                      <TableCell
                        className={
                          isDeadlinePassed(deadline) ? "text-destructive" : undefined
                        }
                      >
                        {new Date(deadline.dueDateTime).toLocaleString()}
                        {isDeadlinePassed(deadline) ? " (Passed)" : ""}
                      </TableCell>
                      <TableCell>{deadline.responsiblePerson ?? "-"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{deadline.status}</Badge>
                      </TableCell>
                      <TableCell>{deadline.locationOrCourt ?? "-"}</TableCell>
                      <TableCell className="text-right">
                        {!isReadOnly && deadline.status === "Scheduled" && (
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleUpdateDeadlineStatus(
                                  deadline.matterDeadlineId,
                                  "Completed"
                                )
                              }
                            >
                              Mark Completed
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleUpdateDeadlineStatus(
                                  deadline.matterDeadlineId,
                                  "Adjourned"
                                )
                              }
                            >
                              Mark Adjourned
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleUpdateDeadlineStatus(
                                  deadline.matterDeadlineId,
                                  "Cancelled"
                                )
                              }
                            >
                              Cancel
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {isReadOnly ? (
            <p className="text-sm text-muted-foreground">
              This matter is closed or archived. Deadlines cannot be added or
              updated.
            </p>
          ) : (
            <>
              <Separator />
              <h3 className="text-sm font-medium">Add Deadline</h3>
              <form onSubmit={handleSubmitDeadlineForm(onSubmitDeadline)}>
                <FieldGroup>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field>
                      <FieldLabel htmlFor="deadlineTitle">Title</FieldLabel>
                      <Input
                        id="deadlineTitle"
                        aria-invalid={!!deadlineErrors.title}
                        {...registerDeadline("title")}
                      />
                      <FieldError
                        errors={
                          deadlineErrors.title ? [deadlineErrors.title] : undefined
                        }
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="deadlineType">Deadline Type</FieldLabel>
                      <Controller
                        control={deadlineControl}
                        name="deadlineType"
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger
                              id="deadlineType"
                              className="w-full"
                              aria-invalid={!!deadlineErrors.deadlineType}
                            >
                              <SelectValue placeholder="-- Select Deadline Type --" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Filing Deadline">Filing Deadline</SelectItem>
                              <SelectItem value="Court Hearing">Court Hearing</SelectItem>
                              <SelectItem value="Review Date">Review Date</SelectItem>
                              <SelectItem value="Consultation">Consultation</SelectItem>
                              <SelectItem value="Settlement Date">Settlement Date</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      <FieldError
                        errors={
                          deadlineErrors.deadlineType
                            ? [deadlineErrors.deadlineType]
                            : undefined
                        }
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="deadlineDueDateTime">
                        Due Date / Time
                      </FieldLabel>
                      <Input
                        id="deadlineDueDateTime"
                        type="datetime-local"
                        aria-invalid={!!deadlineErrors.dueDateTime}
                        {...registerDeadline("dueDateTime")}
                      />
                      <FieldError
                        errors={
                          deadlineErrors.dueDateTime
                            ? [deadlineErrors.dueDateTime]
                            : undefined
                        }
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="deadlineResponsiblePerson">
                        Responsible Person
                      </FieldLabel>
                      <Input
                        id="deadlineResponsiblePerson"
                        aria-invalid={!!deadlineErrors.responsiblePerson}
                        {...registerDeadline("responsiblePerson")}
                      />
                      <FieldError
                        errors={
                          deadlineErrors.responsiblePerson
                            ? [deadlineErrors.responsiblePerson]
                            : undefined
                        }
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="deadlineLocationOrCourt">
                        Location / Court
                      </FieldLabel>
                      <Input
                        id="deadlineLocationOrCourt"
                        {...registerDeadline("locationOrCourt")}
                      />
                    </Field>
                  </div>
                  <Field>
                    <FieldLabel htmlFor="deadlineNotes">Notes</FieldLabel>
                    <Textarea id="deadlineNotes" {...registerDeadline("notes")} />
                  </Field>
                  <div className="flex justify-end">
                    <Button type="submit" disabled={addingDeadline}>
                      {addingDeadline ? "Adding..." : "Add Deadline"}
                    </Button>
                  </div>
                </FieldGroup>
              </form>
            </>
          )}
        </CardContent>
      </Card>

      {/* Documents */}
      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {documents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No documents yet.</p>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Uploaded At</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc.documentId}>
                      <TableCell>{doc.originalFileName}</TableCell>
                      <TableCell>{doc.documentCategory}</TableCell>
                      <TableCell>{doc.description ?? "-"}</TableCell>
                      <TableCell>
                        {(doc.fileSizeBytes / 1024).toFixed(1)} KB
                      </TableCell>
                      <TableCell>
                        {new Date(doc.uploadedAt).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            downloadDocument(doc.documentId, doc.originalFileName)
                          }
                        >
                          Download
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {isReadOnly ? (
            <p className="text-sm text-muted-foreground">
              This matter is closed or archived. Documents cannot be uploaded.
            </p>
          ) : (
            <>
              <Separator />
              <h3 className="text-sm font-medium">Upload Document</h3>
              <form onSubmit={handleSubmitUpload(onSubmitUpload)}>
                <FieldGroup>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field>
                      <FieldLabel htmlFor="uploadFile">File</FieldLabel>
                      <Input
                        id="uploadFile"
                        type="file"
                        aria-invalid={!!uploadErrors.file}
                        {...registerUpload("file")}
                      />
                      <FieldError
                        errors={
                          uploadErrors.file
                            ? [{ message: uploadErrors.file.message }]
                            : undefined
                        }
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="uploadCategory">Category</FieldLabel>
                      <Controller
                        control={uploadControl}
                        name="documentCategory"
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger id="uploadCategory" className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Client ID">Client ID</SelectItem>
                              <SelectItem value="Engagement Documents">Engagement Documents</SelectItem>
                              <SelectItem value="Pleadings">Pleadings</SelectItem>
                              <SelectItem value="Correspondence">Correspondence</SelectItem>
                              <SelectItem value="Court Documents">Court Documents</SelectItem>
                              <SelectItem value="Evidence">Evidence</SelectItem>
                              <SelectItem value="Contracts">Contracts</SelectItem>
                              <SelectItem value="Internal Draft">Internal Draft</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </Field>
                  </div>
                  <Field>
                    <FieldLabel htmlFor="uploadDescription">Description</FieldLabel>
                    <Textarea id="uploadDescription" {...registerUpload("description")} />
                  </Field>
                  <div className="flex justify-end">
                    <Button type="submit" disabled={uploading}>
                      {uploading ? "Uploading..." : "Upload"}
                    </Button>
                  </div>
                </FieldGroup>
              </form>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MatterDetailPage;