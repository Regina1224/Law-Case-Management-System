import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { getClientById, updateClient } from "../services/clientService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
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

const CLIENT_STATUSES = [
  "New Intake",
  "Active Client",
  "Inactive Client",
  "On Hold",
  "Archived",
];

const editClientSchema = z.object({
  status: z.string().min(1, "Status is required."),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  organizationName: z.string().optional(),
  email: z.email("Invalid email address.").optional().or(z.literal("")),
  phone: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postcode: z.string().optional(),
  country: z.string().optional(),
  internalNotesSummary: z.string().optional(),
});
type EditClientFormValues = z.infer<typeof editClientSchema>;

const EditClientPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [clientType, setClientType] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditClientFormValues>({
    resolver: zodResolver(editClientSchema),
    defaultValues: {
      status: "",
      firstName: "",
      lastName: "",
      organizationName: "",
      email: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postcode: "",
      country: "",
      internalNotesSummary: "",
    },
  });

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const result = await getClientById(Number(id));
        setClientType(result.clientType);
        reset({
          status: result.status,
          firstName: result.firstName ?? "",
          lastName: result.lastName ?? "",
          organizationName: result.organizationName ?? "",
          email: result.email ?? "",
          phone: result.phone ?? "",
          addressLine1: result.addressLine1 ?? "",
          addressLine2: result.addressLine2 ?? "",
          city: result.city ?? "",
          state: result.state ?? "",
          postcode: result.postcode ?? "",
          country: result.country ?? "",
          internalNotesSummary: result.internalNotesSummary ?? "",
        });
      } catch {
        setError("Failed to load client details.");
      } finally {
        setLoading(false);
      }
    };
    fetchClient();
  }, [id, reset]);

  const onSubmit = async (values: EditClientFormValues) => {
    try {
      await updateClient(Number(id), {
        status: values.status,
        firstName: clientType === "Individual" ? values.firstName : undefined,
        lastName: clientType === "Individual" ? values.lastName : undefined,
        organizationName:
          clientType === "Corporate" ? values.organizationName : undefined,
        email: values.email || undefined,
        phone: values.phone || undefined,
        addressLine1: values.addressLine1 || undefined,
        addressLine2: values.addressLine2 || undefined,
        city: values.city || undefined,
        state: values.state || undefined,
        postcode: values.postcode || undefined,
        country: values.country || undefined,
        internalNotesSummary: values.internalNotesSummary || undefined,
      });
      toast.success("Client updated.");
      navigate(`/clients/${id}`);
    } catch {
      toast.error("Failed to update client.");
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }
  if (error) return <p className="text-sm text-destructive">{error}</p>;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Button
          variant="ghost"
          size="sm"
          render={<Link to={`/clients/${id}`} />}
        >
          <ArrowLeft />
          Back to Client
        </Button>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Edit Client
        </h1>
      </div>

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="clientType">
                  Client Type (cannot be changed)
                </FieldLabel>
                <Input id="clientType" value={clientType} disabled />
              </Field>

              <Field>
                <FieldLabel htmlFor="status">Status</FieldLabel>
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        id="status"
                        className="w-full"
                        aria-invalid={!!errors.status}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CLIENT_STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={errors.status ? [errors.status] : undefined} />
              </Field>

              {clientType === "Individual" ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="firstName">First Name</FieldLabel>
                    <Input id="firstName" {...register("firstName")} />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
                    <Input id="lastName" {...register("lastName")} />
                  </Field>
                </div>
              ) : (
                <Field>
                  <FieldLabel htmlFor="organizationName">
                    Organization Name
                  </FieldLabel>
                  <Input id="organizationName" {...register("organizationName")} />
                </Field>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    aria-invalid={!!errors.email}
                    {...register("email")}
                  />
                  <FieldError errors={errors.email ? [errors.email] : undefined} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="phone">Phone</FieldLabel>
                  <Input id="phone" {...register("phone")} />
                </Field>
              </div>

              <Separator />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="addressLine1">Address Line 1</FieldLabel>
                  <Input id="addressLine1" {...register("addressLine1")} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="addressLine2">Address Line 2</FieldLabel>
                  <Input id="addressLine2" {...register("addressLine2")} />
                </Field>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Field>
                  <FieldLabel htmlFor="city">City</FieldLabel>
                  <Input id="city" {...register("city")} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="state">State</FieldLabel>
                  <Input id="state" {...register("state")} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="postcode">Postcode</FieldLabel>
                  <Input id="postcode" {...register("postcode")} />
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="country">Country</FieldLabel>
                <Input id="country" {...register("country")} />
              </Field>

              <Field>
                <FieldLabel htmlFor="internalNotesSummary">
                  Internal Notes Summary
                </FieldLabel>
                <Textarea
                  id="internalNotesSummary"
                  {...register("internalNotesSummary")}
                />
              </Field>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  render={<Link to={`/clients/${id}`} />}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditClientPage;