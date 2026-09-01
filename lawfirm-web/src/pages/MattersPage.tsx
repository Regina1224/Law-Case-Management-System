import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { getMatters, type MatterListItem } from "../services/matterService";
import MatterStatusBadge from "@/components/MatterStatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const STATUS_OPTIONS = [
  "Draft",
  "Open",
  "Awaiting Client Documents",
  "In Progress",
  "Awaiting External Response",
  "On Hold",
  "Closed",
  "Archived",
];

const ALL_STATUSES = "all";

const MattersPage = () => {
  const [matters, setMatters] = useState<MatterListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const fetchMatters = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getMatters({
        keyword: keyword || undefined,
        status: status || undefined,
        page,
        pageSize,
      });
      setMatters(result.items);
      setTotalCount(result.totalCount);
    } catch {
      setError("Failed to load matters.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMatters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchMatters();
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Matters</h1>
          <p className="text-sm text-muted-foreground">
            {totalCount} matter{totalCount === 1 ? "" : "s"}
          </p>
        </div>
        <Button render={<Link to="/matters/create" />}>
          <Plus />
          Create Matter
        </Button>
      </div>

      <Card>
        <CardContent>
          <form
            onSubmit={handleSearch}
            className="flex flex-wrap items-end gap-3"
          >
            <div className="relative min-w-60 flex-1">
              <Search className="absolute top-2.5 left-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, number, or client"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select
              value={status || ALL_STATUSES}
              onValueChange={(value) =>
                setStatus(!value || value === ALL_STATUSES ? "" : value)
              }
            >
              <SelectTrigger className="w-56">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_STATUSES}>All Statuses</SelectItem>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit" variant="secondary">
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="py-0">
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Matter Number</TableHead>
                <TableHead>Matter Title</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Matter Type</TableHead>
                <TableHead>Practice Area</TableHead>
                <TableHead>Responsible Lawyer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Opened Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={9}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : error ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="py-10 text-center text-destructive"
                  >
                    {error}
                  </TableCell>
                </TableRow>
              ) : matters.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="py-10 text-center text-muted-foreground"
                  >
                    No matters found.
                  </TableCell>
                </TableRow>
              ) : (
                matters.map((m) => (
                  <TableRow key={m.matterId}>
                    <TableCell>
                      <Link
                        to={`/matters/${m.matterId}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {m.matterNumber}
                      </Link>
                    </TableCell>
                    <TableCell>{m.matterTitle}</TableCell>
                    <TableCell>{m.clientName}</TableCell>
                    <TableCell>{m.matterTypeName}</TableCell>
                    <TableCell>{m.practiceAreaName}</TableCell>
                    <TableCell>{m.responsibleLawyer ?? "-"}</TableCell>
                    <TableCell>
                      <MatterStatusBadge status={m.status} />
                    </TableCell>
                    <TableCell>{m.priority ?? "-"}</TableCell>
                    <TableCell>
                      {new Date(m.openedDate).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Page {page} of {totalPages || 1}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MattersPage;