import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const STATUS_STYLES: Record<string, string> = {
  New: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400",
  "Under Review": "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400",
  "Awaiting Information": "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  "Consultation Scheduled": "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  "Approved to Proceed": "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  Declined: "bg-destructive/10 text-destructive",
  Converted: "bg-muted text-muted-foreground",
};

const IntakeStatusBadge = ({ status }: { status: string }) => {
  return (
    <Badge className={cn("font-normal", STATUS_STYLES[status])}>
      {status}
    </Badge>
  );
};

export default IntakeStatusBadge;