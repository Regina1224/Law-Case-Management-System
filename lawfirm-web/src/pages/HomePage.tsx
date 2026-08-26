import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Briefcase,
  FolderOpen,
  Users,
  Inbox,
  ArrowRight,
  UserPlus,
  FilePlus2,
} from "lucide-react";
import { getMatters, type MatterListItem } from "../services/matterService";
import { getClients } from "../services/clientService";
import { getIntakes, type IntakeListItem } from "../services/intakeService";
import { useCurrentUser } from "../features/auth/useCurrentUser";
import MatterStatusBadge from "@/components/MatterStatusBadge";
import IntakeStatusBadge from "@/components/IntakeStatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const PENDING_INTAKE_STATUSES = [
  "New",
  "Under Review",
  "Awaiting Information",
];

const MATTER_STATUS_ORDER = [
  "Draft",
  "Open",
  "Awaiting Client Documents",
  "In Progress",
  "Awaiting External Response",
  "On Hold",
  "Closed",
  "Archived",
];

const INTAKE_STATUS_ORDER = [
  "New",
  "Under Review",
  "Awaiting Information",
  "Consultation Scheduled",
  "Approved to Proceed",
  "Declined",
  "Converted",
];

interface DashboardStats {
  totalMatters: number;
  openMatters: number;
  totalClients: number;
  pendingIntakes: number;
  newClientsThisMonth: number;
  newMattersThisMonth: number;
}

interface StatusCount {
  status: string;
  count: number;
}

const isThisMonth = (dateStr: string, startOfMonth: Date) =>
  new Date(dateStr) >= startOfMonth;

const countByStatus = (
  items: { status: string }[],
  order: string[]
): StatusCount[] =>
  order
    .map((status) => ({
      status,
      count: items.filter((item) => item.status === status).length,
    }))
    .filter((entry) => entry.count > 0);

const HomePage = () => {
  const { user } = useCurrentUser();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [matterStatusCounts, setMatterStatusCounts] = useState<StatusCount[]>([]);
  const [intakeStatusCounts, setIntakeStatusCounts] = useState<StatusCount[]>([]);
  const [recentMatters, setRecentMatters] = useState<MatterListItem[]>([]);
  const [attentionIntakes, setAttentionIntakes] = useState<IntakeListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const [mattersResult, clientsResult, intakesResult] = await Promise.all([
          getMatters({ page: 1, pageSize: 200 }),
          getClients({ page: 1, pageSize: 200 }),
          getIntakes({ page: 1, pageSize: 200 }),
        ]);

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const openMatters = mattersResult.items.filter(
          (m) => !["Closed", "Archived"].includes(m.status)
        ).length;
        const pendingIntakes = intakesResult.items.filter((i) =>
          PENDING_INTAKE_STATUSES.includes(i.status)
        ).length;
        const newClientsThisMonth = clientsResult.items.filter((c) =>
          isThisMonth(c.createdAt, startOfMonth)
        ).length;
        const newMattersThisMonth = mattersResult.items.filter((m) =>
          isThisMonth(m.openedDate, startOfMonth)
        ).length;

        setStats({
          totalMatters: mattersResult.totalCount,
          openMatters,
          totalClients: clientsResult.totalCount,
          pendingIntakes,
          newClientsThisMonth,
          newMattersThisMonth,
        });

        setMatterStatusCounts(
          countByStatus(mattersResult.items, MATTER_STATUS_ORDER)
        );
        setIntakeStatusCounts(
          countByStatus(intakesResult.items, INTAKE_STATUS_ORDER)
        );

        setRecentMatters(
          [...mattersResult.items]
            .sort(
              (a, b) =>
                new Date(b.openedDate).getTime() - new Date(a.openedDate).getTime()
            )
            .slice(0, 5)
        );

        setAttentionIntakes(
          intakesResult.items
            .filter((i) => PENDING_INTAKE_STATUSES.includes(i.status))
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )
            .slice(0, 5)
        );
      } catch {
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const statCards = [
    {
      label: "Total Matters",
      value: stats?.totalMatters,
      icon: Briefcase,
      to: "/matters",
    },
    {
      label: "Open Matters",
      value: stats?.openMatters,
      icon: FolderOpen,
      to: "/matters",
    },
    {
      label: "Total Clients",
      value: stats?.totalClients,
      icon: Users,
      to: "/clients",
    },
    {
      label: "Pending Intakes",
      value: stats?.pendingIntakes,
      icon: Inbox,
      to: "/intakes",
    },
    {
      label: "New Clients This Month",
      value: stats?.newClientsThisMonth,
      icon: UserPlus,
      to: "/clients",
    },
    {
      label: "New Matters This Month",
      value: stats?.newMattersThisMonth,
      icon: FilePlus2,
      to: "/matters",
    },
  ];

  const matterStatusTotal = matterStatusCounts.reduce((sum, s) => sum + s.count, 0);
  const intakeStatusTotal = intakeStatusCounts.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {user?.displayName ? `Welcome back, ${user.displayName}` : "Dashboard"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Here's what's happening across your matters, clients, and intakes.
        </p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card) => (
          <Card key={card.label} className="py-0">
            <CardContent className="px-0">
              <Link
                to={card.to}
                className="flex items-center gap-4 px-6 py-5 transition-colors hover:bg-muted/50"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <card.icon className="size-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                  {loading ? (
                    <Skeleton className="mt-1 h-7 w-12" />
                  ) : (
                    <p className="text-2xl font-semibold tracking-tight">
                      {card.value ?? 0}
                    </p>
                  )}
                </div>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Matters by Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-6 w-full" />
                ))}
              </div>
            ) : matterStatusCounts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No matters yet.</p>
            ) : (
              matterStatusCounts.map(({ status, count }) => (
                <div key={status} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>{status}</span>
                    <span className="text-muted-foreground">{count}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{
                        width: `${(count / matterStatusTotal) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Intake Pipeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-6 w-full" />
                ))}
              </div>
            ) : intakeStatusCounts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No intakes yet.</p>
            ) : (
              intakeStatusCounts.map(({ status, count }) => (
                <div key={status} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>{status}</span>
                    <span className="text-muted-foreground">{count}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{
                        width: `${(count / intakeStatusTotal) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Matters</CardTitle>
            <Button variant="ghost" size="sm" render={<Link to="/matters" />}>
              View all
              <ArrowRight />
            </Button>
          </CardHeader>
          <CardContent className="space-y-1">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : recentMatters.length === 0 ? (
              <p className="text-sm text-muted-foreground">No matters yet.</p>
            ) : (
              recentMatters.map((matter) => (
                <Link
                  key={matter.matterId}
                  to={`/matters/${matter.matterId}`}
                  className="flex items-center justify-between gap-3 rounded-md px-2 py-2.5 transition-colors hover:bg-muted/50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {matter.matterTitle}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {matter.clientName} · {matter.matterNumber}
                    </p>
                  </div>
                  <MatterStatusBadge status={matter.status} />
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Intakes Needing Attention</CardTitle>
            <Button variant="ghost" size="sm" render={<Link to="/intakes" />}>
              View all
              <ArrowRight />
            </Button>
          </CardHeader>
          <CardContent className="space-y-1">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : attentionIntakes.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No intakes need attention right now.
              </p>
            ) : (
              attentionIntakes.map((intake) => (
                <Link
                  key={intake.intakeId}
                  to={`/intakes/${intake.intakeId}`}
                  className="flex items-center justify-between gap-3 rounded-md px-2 py-2.5 transition-colors hover:bg-muted/50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {intake.prospectiveClientName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {intake.practiceAreaName} · {intake.intakeCode}
                    </p>
                  </div>
                  <IntakeStatusBadge status={intake.status} />
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HomePage;