import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { createIntake } from "../services/intakeService";
import practiceAreaService, {
  type PracticeAreaDto,
} from "../services/practiceAreaService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

const createIntakeSchema = z.object({
  prospectiveClientName: z.string().min(1, "Prospective client name is required."),
  intendedClientType: z.string().min(1),
  primaryEmail: z.email("Invalid email address.").optional().or(z.literal("")),
  primaryPhone: z.string().optional(),
  practiceAreaId: z.coerce.number().min(1, "Practice area is required."),
  legalIssueSummary: z.string().min(1, "Legal issue summary is required."),
  urgency: z.string().min(1),
  assignedReviewer: z.string().optional(),
  sourceOfEnquiry: z.string().optional(),
  consultationDate: z.string().optional(),
});

type CreateIntakeFormValues = z.input<typeof createIntakeSchema>;

const CreateIntakePage = () => {
  const navigate = useNavigate();

  const [practiceAreas, setPracticeAreas] = useState<PracticeAreaDto[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateIntakeFormValues>({
    resolver: zodResolver(createIntakeSchema),
    defaultValues: {
      prospectiveClientName: "",
      intendedClientType: "Individual",
      primaryEmail: "",
      primaryPhone: "",
      practiceAreaId: "" as unknown as number,
      legalIssueSummary: "",
      urgency: "Medium",
      assignedReviewer: "",
      sourceOfEnquiry: "",
      consultationDate: "",
    },
  });

  useEffect(() => {
    const fetchPracticeAreas = async () => {
      try {
        const response = await practiceAreaService.getAll();
        setPracticeAreas(response.data.data);
      } catch {
        setLoadError("Failed to load practice areas.");
      }
    };
    fetchPracticeAreas();
  }, []);

  const onSubmit = async (values: CreateIntakeFormValues) => {
    const parsed = createIntakeSchema.parse(values);

    try {
      await createIntake({
        prospectiveClientName: parsed.prospectiveClientName,
        intendedClientType: parsed.intendedClientType,
        primaryEmail: parsed.primaryEmail || undefined,
        primaryPhone: parsed.primaryPhone || undefined,
        practiceAreaId: parsed.practiceAreaId,
        legalIssueSummary: parsed.legalIssueSummary,
        urgency: parsed.urgency,
        assignedReviewer: parsed.assignedReviewer || undefined,
        sourceOfEnquiry: parsed.sourceOfEnquiry || undefined,
        consultationDate: parsed.consultationDate || undefined,
      });

      toast.success("Intake created.");
      navigate("/intakes");
    } catch {
      toast.error("Failed to create intake. Please check your input.");
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Button variant="ghost" size="sm" render={<Link to="/intakes" />}>
          <ArrowLeft />
          Back to Intakes
        </Button>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Create Intake
        </h1>
      </div>

      {loadError && <p className="text-sm text-destructive">{loadError}</p>}

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="prospectiveClientName">
                    Prospective Client Name
                  </FieldLabel>
                  <Input
                    id="prospectiveClientName"
                    aria-invalid={!!errors.prospectiveClientName}
                    {...register("prospectiveClientName")}
                  />
                  <FieldError
                    errors={
                      errors.prospectiveClientName
                        ? [errors.prospectiveClientName]
                        : undefined
                    }
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="intendedClientType">
                    Intended Client Type
                  </FieldLabel>
                  <Controller
                    control={control}
                    name="intendedClientType"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id="intendedClientType" className="w-full">
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

                <Field>
                  <FieldLabel htmlFor="primaryEmail">Primary Email</FieldLabel>
                  <Input
                    id="primaryEmail"
                    type="email"
                    aria-invalid={!!errors.primaryEmail}
                    {...register("primaryEmail")}
                  />
                  <FieldError
                    errors={errors.primaryEmail ? [errors.primaryEmail] : undefined}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="primaryPhone">Primary Phone</FieldLabel>
                  <Input id="primaryPhone" {...register("primaryPhone")} />
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
                  <FieldError
                    errors={errors.practiceAreaId ? [errors.practiceAreaId] : undefined}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="urgency">Urgency</FieldLabel>
                  <Controller
                    control={control}
                    name="urgency"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id="urgency" className="w-full">
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
                  <FieldLabel htmlFor="assignedReviewer">
                    Assigned Reviewer
                  </FieldLabel>
                  <Input id="assignedReviewer" {...register("assignedReviewer")} />
                </Field>

                <Field>
                  <FieldLabel htmlFor="sourceOfEnquiry">
                    Source of Enquiry
                  </FieldLabel>
                  <Input id="sourceOfEnquiry" {...register("sourceOfEnquiry")} />
                </Field>

                <Field>
                  <FieldLabel htmlFor="consultationDate">
                    Consultation Date
                  </FieldLabel>
                  <Input
                    id="consultationDate"
                    type="date"
                    {...register("consultationDate")}
                  />
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="legalIssueSummary">
                  Legal Issue Summary
                </FieldLabel>
                <Textarea
                  id="legalIssueSummary"
                  aria-invalid={!!errors.legalIssueSummary}
                  {...register("legalIssueSummary")}
                />
                <FieldError
                  errors={
                    errors.legalIssueSummary ? [errors.legalIssueSummary] : undefined
                  }
                />
              </Field>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" render={<Link to="/intakes" />}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Intake"}
                </Button>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateIntakePage;