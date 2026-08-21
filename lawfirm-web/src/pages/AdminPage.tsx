import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Users } from "lucide-react";
import type { PracticeAreaDto } from "../services/practiceAreaService";
import practiceAreaService from "../services/practiceAreaService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const practiceAreaSchema = z.object({
  name: z.string().min(1, "Name is required."),
  code: z.string().optional(),
  displayOrder: z.coerce.number().min(0, "Display order must be 0 or greater."),
});
type PracticeAreaFormValues = z.input<typeof practiceAreaSchema>;

const AdminPage = () => {
  const [practiceAreas, setPracticeAreas] = useState<PracticeAreaDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const {
    register,
    handleSubmit,
    reset: resetFormFields,
    formState: { errors, isSubmitting: saving },
  } = useForm<PracticeAreaFormValues>({
    resolver: zodResolver(practiceAreaSchema),
    defaultValues: { name: "", code: "", displayOrder: 0 },
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await practiceAreaService.getAll();
      setPracticeAreas(response.data.data);
    } catch {
      setError("Failed to load practice areas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    resetFormFields({ name: "", code: "", displayOrder: 0 });
  };

  const handleEdit = (pa: PracticeAreaDto) => {
    setEditingId(pa.id);
    resetFormFields({
      name: pa.name,
      code: pa.code ?? "",
      displayOrder: pa.displayOrder,
    });
  };

  const handleDelete = async (id: number) => {
    try {
      await practiceAreaService.delete(id);
      setPracticeAreas((prev) => prev.filter((pa) => pa.id !== id));
      toast.success("Practice area deleted.");
      if (editingId === id) {
        resetForm();
      }
    } catch {
      toast.error("Failed to delete practice area.");
    }
  };

  const onSubmit = async (values: PracticeAreaFormValues) => {
    const parsed = practiceAreaSchema.parse(values);
    const data = {
      name: parsed.name,
      code: parsed.code || undefined,
      displayOrder: parsed.displayOrder,
    };

    try {
      if (editingId) {
        await practiceAreaService.update(editingId, data);
      } else {
        await practiceAreaService.create(data);
      }
      await fetchData();
      toast.success(editingId ? "Practice area updated." : "Practice area added.");
      resetForm();
    } catch {
      toast.error("Failed to save practice area.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Reference Data
          </h1>
          <p className="text-sm text-muted-foreground">Practice Areas</p>
        </div>
        <Button variant="outline" render={<Link to="/admin/users" />}>
          <Users />
          Application Users
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Practice Areas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-full" />
              ))}
            </div>
          ) : error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : practiceAreas.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No practice areas yet.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Display Order</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {practiceAreas.map((pa) => (
                    <TableRow key={pa.id}>
                      <TableCell>{pa.name}</TableCell>
                      <TableCell>{pa.code ?? "-"}</TableCell>
                      <TableCell>{pa.displayOrder}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(pa)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(pa.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <Separator />
          <h3 className="text-sm font-medium">
            {editingId ? "Edit Practice Area" : "Add Practice Area"}
          </h3>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Field>
                  <FieldLabel htmlFor="paName">Name</FieldLabel>
                  <Input
                    id="paName"
                    aria-invalid={!!errors.name}
                    {...register("name")}
                  />
                  <FieldError errors={errors.name ? [errors.name] : undefined} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="paCode">Code</FieldLabel>
                  <Input id="paCode" {...register("code")} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="paDisplayOrder">Display Order</FieldLabel>
                  <Input
                    id="paDisplayOrder"
                    type="number"
                    aria-invalid={!!errors.displayOrder}
                    {...register("displayOrder")}
                  />
                  <FieldError
                    errors={errors.displayOrder ? [errors.displayOrder] : undefined}
                  />
                </Field>
              </div>
              <div className="flex justify-end gap-2">
                {editingId && (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                )}
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : editingId ? "Save Changes" : "Add Practice Area"}
                </Button>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPage;