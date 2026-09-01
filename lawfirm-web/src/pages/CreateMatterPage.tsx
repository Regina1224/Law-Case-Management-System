import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { createMatter } from "../services/matterService";
import { getClients, type ClientListItem } from "../services/clientService";
import practiceAreaService, {
  type PracticeAreaDto,
} from "../services/practiceAreaService";
import matterTypeService, {
  type MatterTypeDto,
} from "../services/matterTypeService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
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

const createMatterSchema = z.object({
  clientId: z.coerce.number().min(1, "Client is required."),
  matterTitle: z.string().min(1, "Matter title is required."),
  matterTypeId: z.coerce.number().min(1, "Matter type is required."),
  practiceAreaId: z.coerce.number().min(1, "Practice area is required."),
  responsibleLawyer: z.string().min(1, "Responsible lawyer is required."),
  supportingStaff: z.string().optional(),
  status: z.string().min(1, "Status is required."),
  priority: z.string().optional(),
  summary: z.string().min(1, "Matter summary is required."),
  openedDate: z.string().min(1, "Opened date is required."),
  targetCloseDate: z.string().optional(),
  isConfidential: z.boolean(),
});

type CreateMatterFormValues = z.input<typeof createMatterSchema>;

const CreateMatterPage = () => {
  const navigate = useNavigate();

  const [clients, setClients] = useState<ClientListItem[]>([]);
  const [practiceAreas, setPracticeAreas] = useState<PracticeAreaDto[]>([]);
  const [matterTypes, setMatterTypes] = useState<MatterTypeDto[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateMatterFormValues>({
    resolver: zodResolver(createMatterSchema),
    defaultValues: {
      clientId: "" as unknown as number,
      matterTitle: "",
      matterTypeId: "" as unknown as number,
      practiceAreaId: "" as unknown as number,
      responsibleLawyer: "",
      supportingStaff: "",
      status: "Draft",
      priority: "Medium",
      summary: "",
      openedDate: new Date().toISOString().slice(0, 10),
      targetCloseDate: "",
      isConfidential: false,
    },
  });

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
        setLoadError("Failed to load form options.");
      }
    };
    fetchOptions();
  }, []);

  const onSubmit = async (values: CreateMatterFormValues) => {
    const parsed = createMatterSchema.parse(values);

    try {
      await createMatter({
        clientId: parsed.clientId,
        matterTitle: parsed.matterTitle,
        matterTypeId: parsed.matterTypeId,
        practiceAreaId: parsed.practiceAreaId,
        responsibleLawyer: parsed.responsibleLawyer,
        supportingStaff: parsed.supportingStaff || undefined,
        status: parsed.status,
        priority: parsed.priority || undefined,
        summary: parsed.summary,
        openedDate: parsed.openedDate,
        targetCloseDate: parsed.targetCloseDate || undefined,
        isConfidential: parsed.isConfidential,
      });

      toast.success("Matter created.");
      navigate("/matters");
    } catch {
      toast.error("Failed to create matter. Please check your input.");
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Button variant="ghost" size="sm" render={<Link to="/matters" />}>
          <ArrowLeft />
          Back to Matters
        </Button>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Create Matter
        </h1>
      </div>

      {loadError && <p className="text-sm text-destructive">{loadError}</p>}

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="clientId">Client</FieldLabel>
                  <Controller
                    control={control}
                    name="clientId"
                    render={({ field }) => (
                      <Select
                        value={field.value ? String(field.value) : ""}
                        onValueChange={(value) => field.onChange(value ?? "")}
                      >
                        <SelectTrigger
                          id="clientId"
                          className="w-full"
                          aria-invalid={!!errors.clientId}
                        >
                          <SelectValue placeholder="Select client">
                            {(value: string | null) => {
                              const client = clients.find(
                                (c) => String(c.clientId) === value
                              );
                              return client
                                ? `${client.clientName} (${client.clientCode})`
                                : "Select client";
                            }}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {clients.map((c) => (
                            <SelectItem
                              key={c.clientId}
                              value={String(c.clientId)}
                            >
                              {c.clientName} ({c.clientCode})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FieldError errors={errors.clientId ? [errors.clientId] : undefined} />
                </Field>

                <Field>
                  <FieldLabel htmlFor="matterTitle">Matter Title</FieldLabel>
                  <Input
                    id="matterTitle"
                    aria-invalid={!!errors.matterTitle}
                    {...register("matterTitle")}
                  />
                  <FieldError errors={errors.matterTitle ? [errors.matterTitle] : undefined} />
                </Field>

                <Field>
                  <FieldLabel htmlFor="matterTypeId">Matter Type</FieldLabel>
                  <Controller
                    control={control}
                    name="matterTypeId"
                    render={({ field }) => (
                      <Select
                        value={field.value ? String(field.value) : ""}
                        onValueChange={(value) => field.onChange(value ?? "")}
                      >
                        <SelectTrigger
                          id="matterTypeId"
                          className="w-full"
                          aria-invalid={!!errors.matterTypeId}
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
                  <FieldError errors={errors.matterTypeId ? [errors.matterTypeId] : undefined} />
                </Field>

                <Field>
                  <FieldLabel htmlFor="practiceAreaId">Practice Area</FieldLabel>
                  <Controller
                    control={control}
                    name="practiceAreaId"
                    render={({ field }) => (
                      <Select
                        value={field.value ? String(field.value) : ""}
                        onValueChange={(value) => field.onChange(value ?? "")}
                      >
                        <SelectTrigger
                          id="practiceAreaId"
                          className="w-full"
                          aria-invalid={!!errors.practiceAreaId}
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
                  <FieldError errors={errors.practiceAreaId ? [errors.practiceAreaId] : undefined} />
                </Field>

                <Field>
                  <FieldLabel htmlFor="responsibleLawyer">Responsible Lawyer</FieldLabel>
                  <Input
                    id="responsibleLawyer"
                    aria-invalid={!!errors.responsibleLawyer}
                    {...register("responsibleLawyer")}
                  />
                  <FieldError errors={errors.responsibleLawyer ? [errors.responsibleLawyer] : undefined} />
                </Field>

                <Field>
                  <FieldLabel htmlFor="supportingStaff">Supporting Staff</FieldLabel>
                  <Input id="supportingStaff" {...register("supportingStaff")} />
                </Field>

                <Field>
                  <FieldLabel htmlFor="status">Status</FieldLabel>
                  <Controller
                    control={control}
                    name="status"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id="status" className="w-full">
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
                  <FieldLabel htmlFor="priority">Priority</FieldLabel>
                  <Controller
                    control={control}
                    name="priority"
                    render={({ field }) => (
                      <Select
                        value={field.value ?? ""}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger id="priority" className="w-full">
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
                  <FieldLabel htmlFor="openedDate">Opened Date</FieldLabel>
                  <Input
                    id="openedDate"
                    type="date"
                    aria-invalid={!!errors.openedDate}
                    {...register("openedDate")}
                  />
                  <FieldError errors={errors.openedDate ? [errors.openedDate] : undefined} />
                </Field>

                <Field>
                  <FieldLabel htmlFor="targetCloseDate">Target Close Date</FieldLabel>
                  <Input id="targetCloseDate" type="date" {...register("targetCloseDate")} />
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="summary">Matter Summary</FieldLabel>
                <Textarea
                  id="summary"
                  aria-invalid={!!errors.summary}
                  {...register("summary")}
                />
                <FieldError errors={errors.summary ? [errors.summary] : undefined} />
              </Field>

              <Field orientation="horizontal">
                <Controller
                  control={control}
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
                <Button type="button" variant="outline" render={<Link to="/matters" />}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Matter"}
                </Button>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateMatterPage;