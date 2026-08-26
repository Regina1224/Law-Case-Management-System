import { useState } from "react";
import { useMsal } from "@azure/msal-react";
import {
  Scale,
  LogIn,
  Briefcase,
  Users,
  Inbox,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { loginRequest } from "../app/msalConfig";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { ModeToggle } from "@/components/mode-toggle";

const FEATURES = [
  { icon: Briefcase, label: "Matters", detail: "End-to-end tracking" },
  { icon: Users, label: "Clients", detail: "Unified records" },
  { icon: Inbox, label: "Intakes", detail: "Faster triage" },
  { icon: ShieldCheck, label: "Secure", detail: "Role-based access" },
];

const LoginPage = () => {
  const { instance } = useMsal();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await instance.loginRedirect({
        ...loginRequest,
        loginHint: email || undefined,
      });
    } catch {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-svh grid-cols-1 lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-linear-to-br from-emerald-500 via-emerald-700 to-teal-950 p-10 text-white lg:flex">
        <div aria-hidden className="bg-grid-pattern absolute inset-0 opacity-40" />
        <div
          aria-hidden
          className="animate-float absolute -top-24 -left-16 size-80 rounded-full bg-emerald-300/25 blur-3xl"
        />
        <div
          aria-hidden
          className="animate-float-slow absolute top-1/3 -right-20 size-96 rounded-full bg-teal-300/20 blur-3xl"
        />
        <div
          aria-hidden
          className="animate-float absolute -bottom-24 left-1/4 size-72 rounded-full bg-amber-300/15 blur-3xl [animation-delay:3s]"
        />
        <Scale
          aria-hidden
          className="pointer-events-none absolute -right-14 -bottom-16 size-72 rotate-12 text-white/6"
        />

        <div className="animate-in fade-in slide-in-from-bottom-2 relative z-10 flex items-center justify-between duration-700">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <span className="flex size-9 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/15">
              <Scale className="size-5" />
            </span>
            LCMS
          </div>
          <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium ring-1 ring-white/15">
            <Sparkles className="size-3.5" />
            Enterprise Case Management
          </span>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-4 relative z-10 space-y-8 duration-700">
          <div className="space-y-3">
            <h2 className="text-3xl font-semibold tracking-tight">
              Law Case Management System
            </h2>
            <p className="max-w-sm text-white/80">
              One workspace for your firm's matters, clients, and intakes —
              built for the way legal teams actually work.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.label}
                className="rounded-xl bg-white/10 p-4 ring-1 ring-white/15 backdrop-blur-sm"
              >
                <feature.icon className="size-5" />
                <p className="mt-3 text-sm font-medium">{feature.label}</p>
                <p className="text-xs text-white/70">{feature.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-white/60">
          &copy; {new Date().getFullYear()} LCMS. All rights reserved.
        </p>
      </div>

      <div className="relative flex items-center justify-center bg-muted/40 p-6">
        <div className="absolute top-4 right-4">
          <ModeToggle />
        </div>
        <Card className="animate-in fade-in slide-in-from-bottom-4 w-full max-w-sm duration-500">
          <CardContent className="flex flex-col items-center gap-6 py-4">
            <div className="flex items-center gap-2 text-xl font-semibold lg:hidden">
              <Scale className="size-6 text-primary" />
              LCMS
            </div>
            <div className="space-y-1.5 text-center">
              <h1 className="text-xl font-semibold tracking-tight">
                Welcome back
              </h1>
              <p className="text-sm text-muted-foreground">
                Sign in with your organization account to continue.
              </p>
            </div>
            <form onSubmit={handleLogin} className="w-full">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="loginEmail">Work email</FieldLabel>
                  <Input
                    id="loginEmail"
                    type="email"
                    autoComplete="username"
                    placeholder="you@yourfirm.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Field>
                <Button type="submit" className="w-full" disabled={submitting}>
                  <LogIn />
                  {submitting ? "Redirecting..." : "Continue with Microsoft"}
                </Button>
              </FieldGroup>
            </form>
            <p className="text-xs text-muted-foreground">
              You'll be redirected to your organization's sign-in page.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;