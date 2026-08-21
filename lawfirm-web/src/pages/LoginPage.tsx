import { useMsal } from "@azure/msal-react";
import { Scale, LogIn, Briefcase, Users, Inbox } from "lucide-react";
import { loginRequest } from "../app/msalConfig";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ModeToggle } from "@/components/mode-toggle";

const FEATURES = [
  { icon: Briefcase, label: "Track matters end to end" },
  { icon: Users, label: "Manage client records securely" },
  { icon: Inbox, label: "Triage new intakes faster" },
];

const LoginPage = () => {
  const { instance } = useMsal();

  const handleLogin = async () => {
    await instance.loginRedirect(loginRequest);
  };

  return (
    <div className="grid min-h-svh grid-cols-1 lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-primary p-10 text-primary-foreground lg:flex">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <Scale className="size-6" />
          LCMS
        </div>
        <div className="space-y-6">
          <h2 className="text-3xl font-semibold tracking-tight">
            Law Case Management System
          </h2>
          <p className="text-primary-foreground/80">
            One workspace for your firm's matters, clients, and intakes.
          </p>
          <ul className="space-y-3">
            {FEATURES.map((feature) => (
              <li key={feature.label} className="flex items-center gap-3 text-sm">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/10">
                  <feature.icon className="size-4" />
                </span>
                {feature.label}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-primary-foreground/60">
          &copy; {new Date().getFullYear()} LCMS. All rights reserved.
        </p>
      </div>

      <div className="relative flex items-center justify-center bg-muted/40 p-6">
        <div className="absolute top-4 right-4">
          <ModeToggle />
        </div>
        <Card className="w-full max-w-sm">
          <CardContent className="flex flex-col items-center gap-6 py-4 text-center">
            <div className="flex items-center gap-2 text-xl font-semibold lg:hidden">
              <Scale className="size-6 text-primary" />
              LCMS
            </div>
            <div className="space-y-1.5">
              <h1 className="text-xl font-semibold tracking-tight">
                Welcome back
              </h1>
              <p className="text-sm text-muted-foreground">
                Sign in with your organization account to continue.
              </p>
            </div>
            <Button className="w-full" onClick={handleLogin}>
              <LogIn />
              Sign in
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;