import { Link, useRouter } from "@tanstack/react-router";
import {
  MessageCircle,
  Pill,
  Calendar,
  LayoutDashboard,
  User,
  Users,
  LogOut,
  Sun,
  Moon,
  Crown,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getProfile, setActiveRole } from "@/lib/data.functions";
import type { ReactNode } from "react";
import { useTheme } from "@/lib/theme-provider";
import { useSubscriptionContext } from "@/lib/subscription/subscription-provider";
import { DevSubscriptionToggle } from "@/components/subscription/DevSubscriptionToggle";

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const qc = useQueryClient();
  const { theme, toggleTheme } = useTheme();
  const { isPro, openPaywall } = useSubscriptionContext();
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
    <div className="min-h-screen bg-background relative">
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-24 w-[36rem] h-[36rem] rounded-full bg-primary/10 blur-3xl animate-blob" />
        <div className="absolute top-1/3 -left-32 w-[28rem] h-[28rem] rounded-full bg-emerald-400/10 blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 right-1/4 w-[24rem] h-[24rem] rounded-full bg-accent/20 blur-3xl animate-blob animation-delay-4000" />
      </div>

      <header className="sticky top-0 z-40 glass border-b border-border/60">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link
            to={role === "senior" ? "/dashboard" : "/family"}
            className="flex items-center gap-2 font-semibold text-lg"
          >
            <span className="gradient-primary flex h-8 w-8 items-center justify-center rounded-xl shadow-md shadow-emerald-700/25">
              <img src="/logo.png" alt="CareCircle" className="w-5 h-5" />
            </span>
            <span className="tracking-tight hidden sm:inline">CareCircle</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1 mx-auto rounded-full bg-background/60 p-1 border border-border/50">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="px-4 py-1.5 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground transition"
                activeProps={{
                  className:
                    "px-4 py-1.5 rounded-full text-sm font-semibold bg-gradient-to-br from-primary to-emerald-600 text-white shadow-md shadow-emerald-700/25",
                }}
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            {isPro ? (
              <Badge className="gap-1 border-transparent bg-gradient-to-br from-primary to-emerald-600 text-white shadow-md shadow-emerald-700/25">
                <Crown className="w-3.5 h-3.5" fill="currentColor" />
                Pro
              </Badge>
            ) : (
              <Button size="sm" onClick={() => openPaywall()}>
                <Crown className="w-4 h-4" />
                Upgrade
              </Button>
            )}
            <DevSubscriptionToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              className="transition-colors rounded-full"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleRole.mutate()}
              disabled={toggleRole.isPending}
              className="gap-2 rounded-full px-2.5 sm:px-3"
            >
              <Users className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">
                {role === "senior" ? "Family view" : "Senior view"}
              </span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={signOut}
              aria-label="Sign out"
              className="rounded-full"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <nav className="md:hidden border-t border-border/50 px-2 py-2 flex justify-center gap-1 overflow-x-auto">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg text-xs text-muted-foreground min-w-[70px]"
              activeProps={{
                className:
                  "flex flex-col items-center gap-1 px-4 py-2 rounded-lg text-xs text-white bg-gradient-to-br from-primary to-emerald-600 min-w-[70px]",
              }}
            >
              <n.icon className="w-4 h-4" />
              {n.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
