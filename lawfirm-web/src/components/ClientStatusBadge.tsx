import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const STATUS_STYLES: Record<string, string> = {
  "New Intake": "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400",
  "Active Client": "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  "Inactive Client": "bg-muted text-muted-foreground",
  "On Hold": "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  Archived: "border border-border bg-transparent text-muted-foreground",
};

const ClientStatusBadge = ({ status }: { status: string }) => {
  return (
    <Badge className={cn("font-normal", STATUS_STYLES[status])}>
      {status}
    </Badge>
  );
};

export default ClientStatusBadge;