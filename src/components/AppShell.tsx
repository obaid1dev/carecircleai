import { Link, useRouter } from "@tanstack/react-router";
import { MessageCircle, Pill, Calendar, LayoutDashboard, User, Users, LogOut, Sun, Moon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getProfile, setActiveRole } from "@/lib/data.functions";
import type { ReactNode } from "react";
import { useTheme } from "@/lib/theme-provider";

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const qc = useQueryClient();
  const { theme, toggleTheme } = useTheme();
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: () => getProfile(),
  });
  const role = profile?.active_role ?? "senior";

  const toggleRole = useMutation({
    mutationFn: () => setActiveRole({ data: { role: role === "senior" ? "caregiver" : "senior" } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      router.navigate({ to: role === "senior" ? "/family" : "/dashboard" });
    },
  });

  const signOut = async () => {
    await supabase.auth.signOut();
    router.navigate({ to: "/auth" });
  };

  const seniorNav = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Home" },
    { to: "/chat", icon: MessageCircle, label: "Check-in" },
    { to: "/medications", icon: Pill, label: "Meds" },
    { to: "/appointments", icon: Calendar, label: "Appointments" },
    { to: "/profile", icon: User, label: "Profile" },
  ] as const;

  const caregiverNav = [
    { to: "/family", icon: LayoutDashboard, label: "Overview" },
    { to: "/medications", icon: Pill, label: "Meds" },
    { to: "/appointments", icon: Calendar, label: "Appointments" },
    { to: "/profile", icon: User, label: "Profile" },
  ] as const;

  const nav = role === "senior" ? seniorNav : caregiverNav;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link
            to={role === "senior" ? "/dashboard" : "/family"}
            className="flex items-center gap-2 font-semibold text-lg"
          >
            <img src="/logo.png" alt="CareCircle" className="w-6 h-6" />
            <span>CareCircle</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1 ml-4 flex-1 justify-center">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition"
                activeProps={{
                  className:
                    "px-3 py-2 rounded-lg text-sm font-medium bg-secondary text-foreground",
                }}
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              className="transition-colors"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleRole.mutate()}
              disabled={toggleRole.isPending}
              className="gap-2"
            >
              <Users className="w-4 h-4" />
              {role === "senior" ? "Family view" : "Senior view"}
            </Button>
            <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sign out">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <nav className="md:hidden border-t px-2 py-2 flex justify-center gap-1 overflow-x-auto">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg text-xs text-muted-foreground min-w-[70px]"
              activeProps={{
                className:
                  "flex flex-col items-center gap-1 px-4 py-2 rounded-lg text-xs text-foreground bg-secondary min-w-[70px]",
              }}
            >
              <n.icon className="w-4 h-4" />
              {n.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
