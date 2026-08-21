import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { getAppUsers, updateAppUserRole, type AppUser } from "../services/appUserService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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

const APP_ROLES = ["SystemAdmin", "Partner", "Lawyer", "Paralegal", "AdminStaff"];

const AppUsersPage = () => {
  const [appUsers, setAppUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedRoles, setSelectedRoles] = useState<Record<number, string>>({});
  const [savingId, setSavingId] = useState<number | null>(null);

  useEffect(() => {
    const fetchAppUsers = async () => {
      try {
        const result = await getAppUsers();
        setAppUsers(result);
        setSelectedRoles(
          Object.fromEntries(result.map((u) => [u.appUserId, u.role]))
        );
      } catch {
        setError("Failed to load application users.");
      } finally {
        setLoading(false);
      }
    };
    fetchAppUsers();
  }, []);

  const handleSaveRole = async (appUserId: number) => {
    const role = selectedRoles[appUserId];
    setSavingId(appUserId);

    try {
      const updated = await updateAppUserRole(appUserId, role);
      setAppUsers((prev) =>
        prev.map((u) => (u.appUserId === appUserId ? updated : u))
      );
      toast.success("Role updated.");
    } catch {
      toast.error("Failed to update role.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" render={<Link to="/admin" />}>
          <ArrowLeft />
          Back to Admin
        </Button>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Application Users
        </h1>
      </div>

      <Card className="py-0">
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Display Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Last Login At</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : error ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-10 text-center text-destructive"
                  >
                    {error}
                  </TableCell>
                </TableRow>
              ) : appUsers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-10 text-center text-muted-foreground"
                  >
                    No application users found.
                  </TableCell>
                </TableRow>
              ) : (
                appUsers.map((u) => (
                  <TableRow key={u.appUserId}>
                    <TableCell>{u.displayName}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <Select
                        value={selectedRoles[u.appUserId] ?? u.role}
                        onValueChange={(value) =>
                          setSelectedRoles((prev) => ({
                            ...prev,
                            [u.appUserId]: value ?? u.role,
                          }))
                        }
                      >
                        <SelectTrigger className="w-44">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {APP_ROLES.map((role) => (
                            <SelectItem key={role} value={role}>
                              {role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={u.isActive ? "default" : "secondary"}
                        className="font-normal"
                      >
                        {u.isActive ? "Yes" : "No"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {u.lastLoginAt
                        ? new Date(u.lastLoginAt).toLocaleString()
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={
                          savingId === u.appUserId ||
                          (selectedRoles[u.appUserId] ?? u.role) === u.role
                        }
                        onClick={() => handleSaveRole(u.appUserId)}
                      >
                        {savingId === u.appUserId ? "Saving..." : "Save"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppUsersPage;