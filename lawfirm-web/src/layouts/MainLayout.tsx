import { Suspense } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { InteractionStatus } from "@azure/msal-browser";
import { Scale, LayoutDashboard, Users, Inbox, Briefcase, ShieldCheck, Loader2 } from "lucide-react";
import AuthButton from "../components/AuthButton";
import { useCurrentUser } from "../features/auth/useCurrentUser";
import LoginPage from "../pages/LoginPage";
import { ModeToggle } from "@/components/mode-toggle";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/clients", label: "Clients", icon: Users },
  { to: "/intakes", label: "Intakes", icon: Inbox },
  { to: "/matters", label: "Matters", icon: Briefcase },
];

const MainLayout = () => {
  const isAuthenticated = useIsAuthenticated();
  const { inProgress } = useMsal();
  const { user } = useCurrentUser();
  const location = useLocation();

  if (inProgress !== InteractionStatus.None) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-muted/40">
        <div className="flex items-center gap-2 text-xl font-semibold">
          <Scale className="size-6 text-primary" />
          LCMS
        </div>
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const isActive = (to: string) =>
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-1.5">
            <Scale className="size-5 text-primary" />
            <span className="font-semibold">LCMS</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {NAV_ITEMS.map((item) => (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton
                      isActive={isActive(item.to)}
                      render={<Link to={item.to} />}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                {user?.role === "SystemAdmin" && (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={isActive("/admin")}
                      render={<Link to="/admin" />}
                    >
                      <ShieldCheck />
                      <span>Admin</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <AuthButton />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-4" />
          <span className="text-sm text-muted-foreground">
            {NAV_ITEMS.find((item) => isActive(item.to))?.label ?? "Admin"}
          </span>
          <div className="ml-auto">
            <ModeToggle />
          </div>
        </header>
        <main className="flex-1 p-6">
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-24">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default MainLayout;