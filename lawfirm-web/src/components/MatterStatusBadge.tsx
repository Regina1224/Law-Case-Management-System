import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const STATUS_STYLES: Record<string, string> = {
  Draft: "bg-secondary text-secondary-foreground",
  Open: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400",
  "In Progress": "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400",
  "Awaiting Client Documents": "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  "Awaiting External Response": "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  "On Hold": "bg-muted text-muted-foreground",
  Closed: "bg-slate-200 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300",
  Archived: "border border-border bg-transparent text-muted-foreground",
};

const MatterStatusBadge = ({ status }: { status: string }) => {
  return (
    <Badge className={cn("font-normal", STATUS_STYLES[status])}>
      {status}
    </Badge>
  );
};

export default MatterStatusBadge;