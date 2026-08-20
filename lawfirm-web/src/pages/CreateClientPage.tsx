import { useNavigate, Link } from "react-router-dom";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { createClient } from "../services/clientService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const createClientSchema = z
  .object({
    clientType: z.enum(["Individual", "Corporate"]),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    organizationName: z.string().optional(),
    email: z.email("Invalid email address.").optional().or(z.literal("")),
    phone: z.string().optional(),
  })
  .refine((data) => data.clientType !== "Individual" || !!data.firstName, {
    message: "First name is required.",
    path: ["firstName"],
  })
  .refine((data) => data.clientType !== "Individual" || !!data.lastName, {
    message: "Last name is required.",
    path: ["lastName"],
  })
  .refine((data) => data.clientType !== "Corporate" || !!data.organizationName, {
    message: "Organization name is required.",
    path: ["organizationName"],
  });

type CreateClientFormValues = z.infer<typeof createClientSchema>;

const CLIENT_STATUS_FOR_NEW_CLIENT = "Active Client";

const CreateClientPage = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateClientFormValues>({
    resolver: zodResolver(createClientSchema),
    defaultValues: {
      clientType: "Individual",
      firstName: "",
      lastName: "",
      organizationName: "",
      email: "",
      phone: "",
    },
  });

  const clientType = useWatch({ control, name: "clientType" });

  const onSubmit = async (values: CreateClientFormValues) => {
    try {
      await createClient({
        clientType: values.clientType,
        status: CLIENT_STATUS_FOR_NEW_CLIENT,
        firstName: values.clientType === "Individual" ? values.firstName : undefined,
        lastName: values.clientType === "Individual" ? values.lastName : undefined,
        organizationName:
          values.clientType === "Corporate" ? values.organizationName : undefined,
        email: values.email || undefined,
        phone: values.phone || undefined,
      });

      toast.success("Client created.");
      navigate("/clients");
    } catch {
      toast.error("Failed to create client. Please check your input.");
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Button variant="ghost" size="sm" render={<Link to="/clients" />}>
          <ArrowLeft />
          Back to Clients
        </Button>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Create Client
        </h1>
      </div>

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="clientType">Client Type</FieldLabel>
                <Controller
                  control={control}
                  name="clientType"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="clientType" className="w-full">
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
                    <FieldLabel htmlFor="firstName">First Name</FieldLabel>
                    <Input
                      id="firstName"
                      aria-invalid={!!errors.firstName}
                      {...register("firstName")}
                    />
                    <FieldError
                      errors={errors.firstName ? [errors.firstName] : undefined}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
                    <Input
                      id="lastName"
                      aria-invalid={!!errors.lastName}
                      {...register("lastName")}
                    />
                    <FieldError
                      errors={errors.lastName ? [errors.lastName] : undefined}
                    />
                  </Field>
                </div>
              ) : (
                <Field>
                  <FieldLabel htmlFor="organizationName">
                    Organization Name
                  </FieldLabel>
                  <Input
                    id="organizationName"
                    aria-invalid={!!errors.organizationName}
                    {...register("organizationName")}
                  />
                  <FieldError
                    errors={
                      errors.organizationName ? [errors.organizationName] : undefined
                    }
                  />
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

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" render={<Link to="/clients" />}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Client"}
                </Button>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateClientPage;