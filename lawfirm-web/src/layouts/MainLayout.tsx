import { Outlet, Link, useLocation } from "react-router-dom";
import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { Scale, LayoutDashboard, Users, Inbox, Briefcase, ShieldCheck } from "lucide-react";
import AuthButton from "../components/AuthButton";
import { useCurrentUser } from "../features/auth/useCurrentUser";
import { loginRequest } from "../app/msalConfig";
import { Button } from "@/components/ui/button";
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
  const { instance } = useMsal();
  const { user } = useCurrentUser();
  const location = useLocation();

  const handleLogin = async () => {
    await instance.loginRedirect(loginRequest);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-muted/40">
        <div className="flex items-center gap-2 text-xl font-semibold">
          <Scale className="size-6 text-primary" />
          LCMS
        </div>
        <p className="text-muted-foreground">Please sign in to continue.</p>
        <Button onClick={handleLogin}>Sign in</Button>
      </div>
    );
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
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default MainLayout;