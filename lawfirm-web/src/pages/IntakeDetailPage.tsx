import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import {
  getIntakeById,
  updateIntake,
  getIntakeDocuments,
  uploadIntakeDocument,
  convertIntake,
  type IntakeDetail,
  type IntakeDocument,
  type ConvertIntakeResult,
} from "../services/intakeService";
import { downloadDocument } from "../services/documentDownload";
import practiceAreaService, {
  type PracticeAreaDto,
} from "../services/practiceAreaService";
import { getClients, type ClientListItem } from "../services/clientService";
import matterTypeService, {
  type MatterTypeDto,
} from "../services/matterTypeService";
import IntakeStatusBadge from "@/components/IntakeStatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const INTAKE_STATUSES = [
  "New",
  "Under Review",
  "Awaiting Information",
  "Consultation Scheduled",
  "Approved to Proceed",
  "Declined",
  "Converted",
];

const editIntakeSchema = z.object({
  status: z.string().min(1, "Status is required."),
  assignedReviewer: z.string().optional(),
  practiceAreaId: z.coerce.number().min(1, "Practice area is required."),
  urgency: z.string().optional(),
  consultationDate: z.string().optional(),
  legalIssueSummary: z.string().min(1, "Legal issue summary is required."),
});
type EditIntakeFormValues = z.input<typeof editIntakeSchema>;

const convertSchema = z
  .object({
    clientMode: z.enum(["new", "existing"]),
    existingClientId: z.coerce.number().optional(),
    clientType: z.enum(["Individual", "Corporate"]),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    organizationName: z.string().optional(),
    convertEmail: z.email("Invalid email address.").optional().or(z.literal("")),
    convertPhone: z.string().optional(),
    matterTitle: z.string().min(1, "Matter title is required."),
    matterTypeId: z.coerce.number().min(1, "Matter type is required."),
    responsibleLawyer: z.string().min(1, "Responsible lawyer is required."),
    supportingStaff: z.string().optional(),
    matterStatus: z.string().min(1),
    priority: z.string().optional(),
    openedDate: z.string().min(1, "Opened date is required."),
    targetCloseDate: z.string().optional(),
    isConfidential: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.clientMode === "existing") {
      if (!data.existingClientId) {
        ctx.addIssue({
          code: "custom",
          message: "Please select a client.",
          path: ["existingClientId"],
        });
      }
      return;
    }

    if (data.clientType === "Individual") {
      if (!data.firstName) {
        ctx.addIssue({
          code: "custom",
          message: "First name is required.",
          path: ["firstName"],
        });
      }
      if (!data.lastName) {
        ctx.addIssue({
          code: "custom",
          message: "Last name is required.",
          path: ["lastName"],
        });
      }
    } else if (!data.organizationName) {
      ctx.addIssue({
        code: "custom",
        message: "Organization name is required.",
        path: ["organizationName"],
      });
    }
  });
type ConvertFormValues = z.input<typeof convertSchema>;

const uploadDocumentSchema = z.object({
  file: z
    .instanceof(FileList)
    .refine((files) => files.length > 0, "File is required."),
  documentCategory: z.string().min(1, "Category is required."),
  description: z.string().optional(),
});
type UploadDocumentFormValues = z.infer<typeof uploadDocumentSchema>;

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
  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    control: editControl,
    reset: resetEditForm,
    getValues: getEditValues,
    formState: { errors: editErrors, isSubmitting: saving },
  } = useForm<EditIntakeFormValues>({
    resolver: zodResolver(editIntakeSchema),
    defaultValues: {
      status: "",
      assignedReviewer: "",
      practiceAreaId: "" as unknown as number,
      urgency: "",
      consultationDate: "",
      legalIssueSummary: "",
    },
  });
  const [declining, setDeclining] = useState(false);

  // Document upload form status
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

  // Convert to Client and Matter form status
  const [showConvertForm, setShowConvertForm] = useState(false);
  const [convertResult, setConvertResult] = useState<ConvertIntakeResult | null>(null);

  const [clients, setClients] = useState<ClientListItem[]>([]);
  const [matterTypes, setMatterTypes] = useState<MatterTypeDto[]>([]);
  const [convertOptionsLoaded, setConvertOptionsLoaded] = useState(false);

  const {
    register: registerConvert,
    handleSubmit: handleSubmitConvert,
    control: convertControl,
    reset: resetConvertForm,
    formState: { errors: convertErrors, isSubmitting: converting },
  } = useForm<ConvertFormValues>({
    resolver: zodResolver(convertSchema),
    defaultValues: {
      clientMode: "new",
      existingClientId: "" as unknown as number,
      clientType: "Individual",
      firstName: "",
      lastName: "",
      organizationName: "",
      convertEmail: "",
      convertPhone: "",
      matterTitle: "",
      matterTypeId: "" as unknown as number,
      responsibleLawyer: "",
      supportingStaff: "",
      matterStatus: "Draft",
      priority: "Medium",
      openedDate: new Date().toISOString().slice(0, 10),
      targetCloseDate: "",
      isConfidential: false,
    },
  });

  const clientMode = useWatch({ control: convertControl, name: "clientMode" });
  const clientType = useWatch({ control: convertControl, name: "clientType" });

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

      resetEditForm({
        status: intakeData.status,
        assignedReviewer: intakeData.assignedReviewer ?? "",
        practiceAreaId: intakeData.practiceAreaId,
        urgency: intakeData.urgency ?? "",
        consultationDate: intakeData.consultationDate
          ? intakeData.consultationDate.slice(0, 10)
          : "",
        legalIssueSummary: intakeData.legalIssueSummary,
      });
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

  const onSubmitEdit = async (values: EditIntakeFormValues) => {
    const parsed = editIntakeSchema.parse(values);

    try {
      const updated = await updateIntake(intakeId, {
        status: parsed.status,
        assignedReviewer: parsed.assignedReviewer || undefined,
        practiceAreaId: parsed.practiceAreaId,
        urgency: parsed.urgency || undefined,
        consultationDate: parsed.consultationDate || undefined,
        legalIssueSummary: parsed.legalIssueSummary,
      });
      setIntake(updated);
      toast.success("Intake updated.");
    } catch {
      toast.error("Failed to update intake.");
    }
  };

  const handleDecline = async () => {
    const values = getEditValues();
    setDeclining(true);

    try {
      const updated = await updateIntake(intakeId, {
        status: "Declined",
        assignedReviewer: values.assignedReviewer || undefined,
        practiceAreaId: Number(values.practiceAreaId),
        urgency: values.urgency || undefined,
        consultationDate: values.consultationDate || undefined,
        legalIssueSummary: values.legalIssueSummary,
      });
      setIntake(updated);
      resetEditForm({ ...values, status: updated.status });
      toast.success("Intake declined.");
    } catch {
      toast.error("Failed to decline intake.");
    } finally {
      setDeclining(false);
    }
  };

  const onSubmitUpload = async (values: UploadDocumentFormValues) => {
    try {
      await uploadIntakeDocument(
        intakeId,
        values.file[0],
        values.documentCategory,
        values.description ?? ""
      );
      const refreshedDocs = await getIntakeDocuments(intakeId);
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

  const openConvertForm = async () => {
    if (!intake) return;

    // Naive split of "First Last" into first/last name to save typing; user can edit.
    const nameParts = intake.prospectiveClientName.trim().split(/\s+/);

    resetConvertForm({
      clientMode: "new",
      existingClientId: "" as unknown as number,
      clientType: (intake.intendedClientType as "Individual" | "Corporate") || "Individual",
      firstName: nameParts.slice(0, -1).join(" ") || nameParts[0] || "",
      lastName: nameParts.length > 1 ? nameParts[nameParts.length - 1] : "",
      organizationName: intake.prospectiveClientName,
      convertEmail: intake.primaryEmail ?? "",
      convertPhone: intake.primaryPhone ?? "",
      matterTitle: "",
      matterTypeId: "" as unknown as number,
      responsibleLawyer: intake.assignedReviewer ?? "",
      supportingStaff: "",
      matterStatus: "Draft",
      priority: intake.urgency ?? "Medium",
      openedDate: new Date().toISOString().slice(0, 10),
      targetCloseDate: "",
      isConfidential: false,
    });

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
        toast.error("Failed to load client/matter type options.");
      }
    }
  };

  const onSubmitConvert = async (values: ConvertFormValues) => {
    const parsed = convertSchema.parse(values);

    try {
      const result = await convertIntake(intakeId, {
        existingClientId:
          parsed.clientMode === "existing" ? parsed.existingClientId : undefined,
        clientType: parsed.clientMode === "new" ? parsed.clientType : undefined,
        firstName:
          parsed.clientMode === "new" && parsed.clientType === "Individual"
            ? parsed.firstName
            : undefined,
        lastName:
          parsed.clientMode === "new" && parsed.clientType === "Individual"
            ? parsed.lastName
            : undefined,
        organizationName:
          parsed.clientMode === "new" && parsed.clientType === "Corporate"
            ? parsed.organizationName
            : undefined,
        email: parsed.clientMode === "new" ? parsed.convertEmail || undefined : undefined,
        phone: parsed.clientMode === "new" ? parsed.convertPhone || undefined : undefined,
        matterTitle: parsed.matterTitle,
        matterTypeId: parsed.matterTypeId,
        responsibleLawyer: parsed.responsibleLawyer,
        supportingStaff: parsed.supportingStaff || undefined,
        status: parsed.matterStatus,
        priority: parsed.priority || undefined,
        openedDate: parsed.openedDate,
        targetCloseDate: parsed.targetCloseDate || undefined,
        isConfidential: parsed.isConfidential,
      });

      setConvertResult(result);
      setShowConvertForm(false);
      toast.success("Intake converted.");

      const refreshed = await getIntakeById(intakeId);
      setIntake(refreshed);
      resetEditForm({
        status: refreshed.status,
        assignedReviewer: refreshed.assignedReviewer ?? "",
        practiceAreaId: refreshed.practiceAreaId,
        urgency: refreshed.urgency ?? "",
        consultationDate: refreshed.consultationDate
          ? refreshed.consultationDate.slice(0, 10)
          : "",
        legalIssueSummary: refreshed.legalIssueSummary,
      });
    } catch {
      toast.error("Failed to convert intake. Please check your input.");
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
  if (error && !intake) return <p className="text-sm text-destructive">{error}</p>;
  if (!intake) return null;

  const isConverted = intake.status === "Converted";
  const currentEditStatus = getEditValues("status");

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" onClick={() => navigate("/intakes")}>
          <ArrowLeft />
          Back to Intakes
        </Button>
        <div className="mt-2 flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">
            Intake {intake.intakeCode}
          </h1>
          <IntakeStatusBadge status={intake.status} />
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                <div>
                  <dt className="text-sm text-muted-foreground">
                    Prospective Client
                  </dt>
                  <dd className="text-sm">{intake.prospectiveClientName}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">
                    Intended Client Type
                  </dt>
                  <dd className="text-sm">{intake.intendedClientType ?? "-"}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Email</dt>
                  <dd className="text-sm">{intake.primaryEmail ?? "-"}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Phone</dt>
                  <dd className="text-sm">{intake.primaryPhone ?? "-"}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">
                    Source of Enquiry
                  </dt>
                  <dd className="text-sm">{intake.sourceOfEnquiry ?? "-"}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Created At</dt>
                  <dd className="text-sm">
                    {new Date(intake.createdAt).toLocaleString()}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Edit</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitEdit(onSubmitEdit)}>
                <FieldGroup>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field>
                      <FieldLabel htmlFor="intakeStatus">Status</FieldLabel>
                      <Controller
                        control={editControl}
                        name="status"
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                            disabled={isConverted}
                          >
                            <SelectTrigger id="intakeStatus" className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {INTAKE_STATUSES.map((s) => (
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
                      <FieldLabel htmlFor="assignedReviewer">
                        Assigned Reviewer
                      </FieldLabel>
                      <Input
                        id="assignedReviewer"
                        disabled={isConverted}
                        {...registerEdit("assignedReviewer")}
                      />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="editPracticeAreaId">
                        Practice Area
                      </FieldLabel>
                      <Controller
                        control={editControl}
                        name="practiceAreaId"
                        render={({ field }) => (
                          <Select
                            value={field.value ? String(field.value) : ""}
                            onValueChange={(value) => field.onChange(value ?? "")}
                            disabled={isConverted}
                          >
                            <SelectTrigger
                              id="editPracticeAreaId"
                              className="w-full"
                              aria-invalid={!!editErrors.practiceAreaId}
                            >
                              <SelectValue placeholder="Select practice area">
                                {(value: string | null) =>
                                  practiceAreas.find((pa) => String(pa.id) === value)
                                    ?.name ?? "Select practice area"
                                }
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {practiceAreas.map((pa) => (
                                <SelectItem key={pa.id} value={String(pa.id)}>
                                  {pa.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      <FieldError
                        errors={
                          editErrors.practiceAreaId ? [editErrors.practiceAreaId] : undefined
                        }
                      />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="editUrgency">Urgency</FieldLabel>
                      <Controller
                        control={editControl}
                        name="urgency"
                        render={({ field }) => (
                          <Select
                            value={field.value ?? ""}
                            onValueChange={field.onChange}
                            disabled={isConverted}
                          >
                            <SelectTrigger id="editUrgency" className="w-full">
                              <SelectValue />
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
                      <FieldLabel htmlFor="editConsultationDate">
                        Consultation Date
                      </FieldLabel>
                      <Input
                        id="editConsultationDate"
                        type="date"
                        disabled={isConverted}
                        {...registerEdit("consultationDate")}
                      />
                    </Field>
                  </div>

                  <Field>
                    <FieldLabel htmlFor="editLegalIssueSummary">
                      Legal Issue Summary
                    </FieldLabel>
                    <Textarea
                      id="editLegalIssueSummary"
                      disabled={isConverted}
                      aria-invalid={!!editErrors.legalIssueSummary}
                      {...registerEdit("legalIssueSummary")}
                    />
                    <FieldError
                      errors={
                        editErrors.legalIssueSummary
                          ? [editErrors.legalIssueSummary]
                          : undefined
                      }
                    />
                  </Field>

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleDecline}
                      disabled={saving || declining || isConverted || currentEditStatus === "Declined"}
                    >
                      {declining ? "Declining..." : "Mark as Declined"}
                    </Button>
                    <Button type="submit" disabled={saving || isConverted}>
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </FieldGroup>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Convert to Client and Matter */}
      <Card>
        <CardHeader>
          <CardTitle>Convert to Client and Matter</CardTitle>
        </CardHeader>
        <CardContent>
          {isConverted ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                This intake has been converted.
              </p>
              {convertResult ? (
                <p className="text-sm">
                  Created client <strong>{convertResult.clientCode}</strong> and
                  matter <strong>{convertResult.matterNumber}</strong>.{" "}
                  <Link
                    to={`/clients/${convertResult.clientId}`}
                    className="text-primary hover:underline"
                  >
                    View Client
                  </Link>{" "}
                  |{" "}
                  <Link to="/matters" className="text-primary hover:underline">
                    View Matters
                  </Link>
                </p>
              ) : (
                intake.convertedClientId && (
                  <p className="text-sm">
                    <Link
                      to={`/clients/${intake.convertedClientId}`}
                      className="text-primary hover:underline"
                    >
                      View Client
                    </Link>{" "}
                    |{" "}
                    <Link to="/matters" className="text-primary hover:underline">
                      View Matters
                    </Link>
                  </p>
                )
              )}
            </div>
          ) : !showConvertForm ? (
            <Button type="button" onClick={openConvertForm}>
              Convert to Client and Matter
            </Button>
          ) : (
            <form onSubmit={handleSubmitConvert(onSubmitConvert)}>
              <FieldGroup>
                <Field>
                  <FieldLabel>Client</FieldLabel>
                  <Controller
                    control={convertControl}
                    name="clientMode"
                    render={({ field }) => (
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="flex gap-6"
                      >
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="new" id="clientModeNew" />
                          <Label htmlFor="clientModeNew" className="font-normal">
                            New Client
                          </Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="existing" id="clientModeExisting" />
                          <Label htmlFor="clientModeExisting" className="font-normal">
                            Existing Client
                          </Label>
                        </div>
                      </RadioGroup>
                    )}
                  />
                </Field>

                {clientMode === "existing" ? (
                  <Field>
                    <FieldLabel htmlFor="existingClientId">Client</FieldLabel>
                    <Controller
                      control={convertControl}
                      name="existingClientId"
                      render={({ field }) => (
                        <Select
                          value={field.value ? String(field.value) : ""}
                          onValueChange={(value) => field.onChange(value ?? "")}
                        >
                          <SelectTrigger
                            id="existingClientId"
                            className="w-full"
                            aria-invalid={!!convertErrors.existingClientId}
                          >
                            <SelectValue placeholder="Select client">
                              {(value: string | null) => {
                                const found = clients.find(
                                  (c) => String(c.clientId) === value
                                );
                                return found
                                  ? `${found.clientName} (${found.clientCode})`
                                  : "Select client";
                              }}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {clients.map((c) => (
                              <SelectItem key={c.clientId} value={String(c.clientId)}>
                                {c.clientName} ({c.clientCode})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <FieldError
                      errors={
                        convertErrors.existingClientId
                          ? [convertErrors.existingClientId]
                          : undefined
                      }
                    />
                  </Field>
                ) : (
                  <>
                    <Field>
                      <FieldLabel htmlFor="convertClientType">
                        Client Type
                      </FieldLabel>
                      <Controller
                        control={convertControl}
                        name="clientType"
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger id="convertClientType" className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Individual">Individual</SelectItem>
                              <SelectItem value="Corporate">Corporate</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </Field>

                    {clientType === "Individual" ? (
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Field>
                          <FieldLabel htmlFor="convertFirstName">
                            First Name
                          </FieldLabel>
                          <Input
                            id="convertFirstName"
                            aria-invalid={!!convertErrors.firstName}
                            {...registerConvert("firstName")}
                          />
                          <FieldError
                            errors={
                              convertErrors.firstName ? [convertErrors.firstName] : undefined
                            }
                          />
                        </Field>
                        <Field>
                          <FieldLabel htmlFor="convertLastName">
                            Last Name
                          </FieldLabel>
                          <Input
                            id="convertLastName"
                            aria-invalid={!!convertErrors.lastName}
                            {...registerConvert("lastName")}
                          />
                          <FieldError
                            errors={
                              convertErrors.lastName ? [convertErrors.lastName] : undefined
                            }
                          />
                        </Field>
                      </div>
                    ) : (
                      <Field>
                        <FieldLabel htmlFor="convertOrganizationName">
                          Organization Name
                        </FieldLabel>
                        <Input
                          id="convertOrganizationName"
                          aria-invalid={!!convertErrors.organizationName}
                          {...registerConvert("organizationName")}
                        />
                        <FieldError
                          errors={
                            convertErrors.organizationName
                              ? [convertErrors.organizationName]
                              : undefined
                          }
                        />
                      </Field>
                    )}

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field>
                        <FieldLabel htmlFor="convertEmail">Email</FieldLabel>
                        <Input
                          id="convertEmail"
                          type="email"
                          aria-invalid={!!convertErrors.convertEmail}
                          {...registerConvert("convertEmail")}
                        />
                        <FieldError
                          errors={
                            convertErrors.convertEmail
                              ? [convertErrors.convertEmail]
                              : undefined
                          }
                        />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="convertPhone">Phone</FieldLabel>
                        <Input id="convertPhone" {...registerConvert("convertPhone")} />
                      </Field>
                    </div>
                  </>
                )}

                <Separator />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="matterTitle">Matter Title</FieldLabel>
                    <Input
                      id="matterTitle"
                      aria-invalid={!!convertErrors.matterTitle}
                      {...registerConvert("matterTitle")}
                    />
                    <FieldError
                      errors={
                        convertErrors.matterTitle ? [convertErrors.matterTitle] : undefined
                      }
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="matterTypeId">Matter Type</FieldLabel>
                    <Controller
                      control={convertControl}
                      name="matterTypeId"
                      render={({ field }) => (
                        <Select
                          value={field.value ? String(field.value) : ""}
                          onValueChange={(value) => field.onChange(value ?? "")}
                        >
                          <SelectTrigger
                            id="matterTypeId"
                            className="w-full"
                            aria-invalid={!!convertErrors.matterTypeId}
                          >
                            <SelectValue placeholder="Select matter type">
                              {(value: string | null) =>
                                matterTypes.find((mt) => String(mt.id) === value)
                                  ?.name ?? "Select matter type"
                              }
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {matterTypes.map((mt) => (
                              <SelectItem key={mt.id} value={String(mt.id)}>
                                {mt.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <FieldError
                      errors={
                        convertErrors.matterTypeId ? [convertErrors.matterTypeId] : undefined
                      }
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="convertResponsibleLawyer">
                      Responsible Lawyer
                    </FieldLabel>
                    <Input
                      id="convertResponsibleLawyer"
                      aria-invalid={!!convertErrors.responsibleLawyer}
                      {...registerConvert("responsibleLawyer")}
                    />
                    <FieldError
                      errors={
                        convertErrors.responsibleLawyer
                          ? [convertErrors.responsibleLawyer]
                          : undefined
                      }
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="convertSupportingStaff">
                      Supporting Staff
                    </FieldLabel>
                    <Input
                      id="convertSupportingStaff"
                      {...registerConvert("supportingStaff")}
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="matterStatus">Status</FieldLabel>
                    <Controller
                      control={convertControl}
                      name="matterStatus"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger id="matterStatus" className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Draft">Draft</SelectItem>
                            <SelectItem value="Open">Open</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="convertPriority">Priority</FieldLabel>
                    <Controller
                      control={convertControl}
                      name="priority"
                      render={({ field }) => (
                        <Select
                          value={field.value ?? ""}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger id="convertPriority" className="w-full">
                            <SelectValue />
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
                    <FieldLabel htmlFor="convertOpenedDate">
                      Opened Date
                    </FieldLabel>
                    <Input
                      id="convertOpenedDate"
                      type="date"
                      aria-invalid={!!convertErrors.openedDate}
                      {...registerConvert("openedDate")}
                    />
                    <FieldError
                      errors={
                        convertErrors.openedDate ? [convertErrors.openedDate] : undefined
                      }
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="convertTargetCloseDate">
                      Target Close Date
                    </FieldLabel>
                    <Input
                      id="convertTargetCloseDate"
                      type="date"
                      {...registerConvert("targetCloseDate")}
                    />
                  </Field>
                </div>

                <Field orientation="horizontal">
                  <Controller
                    control={convertControl}
                    name="isConfidential"
                    render={({ field }) => (
                      <Checkbox
                        id="isConfidential"
                        checked={field.value}
                        onCheckedChange={(checked) => field.onChange(checked === true)}
                      />
                    )}
                  />
                  <FieldLabel htmlFor="isConfidential" className="font-normal">
                    Confidential
                  </FieldLabel>
                </Field>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowConvertForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={converting}>
                    {converting ? "Converting..." : "Convert"}
                  </Button>
                </div>
              </FieldGroup>
            </form>
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
                          <SelectItem value="Engagement Documents">
                            Engagement Documents
                          </SelectItem>
                          <SelectItem value="Correspondence">
                            Correspondence
                          </SelectItem>
                          <SelectItem value="Internal Draft">
                            Internal Draft
                          </SelectItem>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default IntakeDetailPage;