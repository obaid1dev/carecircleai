import { createFileRoute, useRouter, Link, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, CheckCircle2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in · CareCircle AI" },
      { name: "description", content: "Sign in or create an account to start using CareCircle." },
    ],
  }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("active_role")
        .eq("id", data.user.id)
        .maybeSingle();
      const role = profile?.active_role || "senior";
      throw redirect({ to: role === "caregiver" ? "/family" : "/dashboard" });
    }
  },
  component: AuthPage,
});

function AuthPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("signin");
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [confirmedEmail, setConfirmedEmail] = useState("");

  const signIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: String(fd.get("email")),
      password: String(fd.get("password")),
    });
    setLoading(false);
    if (error) {
      if (
        error.message.includes("Email not confirmed") ||
        error.message.includes("email not confirmed")
      ) {
        return toast.error(
          "Please confirm your email before signing in. Check your inbox for the confirmation link.",
        );
      }
      return toast.error(error.message);
    }
    router.navigate({ to: "/dashboard" });
  };

  const signUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email"));
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password: String(fd.get("password")),
      options: {
        emailRedirectTo: window.location.origin,
        data: { name: String(fd.get("name")) },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    setConfirmedEmail(email);
    setShowEmailConfirmation(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-[32rem] h-[32rem] rounded-full bg-primary/15 blur-3xl animate-blob" />
        <div className="absolute -bottom-32 -right-24 w-[30rem] h-[30rem] rounded-full bg-emerald-400/15 blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[24rem] h-[24rem] rounded-full bg-accent/25 blur-3xl animate-blob animation-delay-4000" />
      </div>
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 font-semibold text-lg mb-6">
          <img src="/logo.png" alt="CareCircle" className="h-9 w-9" />
          CareCircle
        </Link>

        <AnimatePresence mode="wait">
          {showEmailConfirmation ? (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ type: "spring", damping: 26, stiffness: 300 }}
            >
              <Card className="glass-strong rounded-3xl border-transparent shadow-2xl shadow-black/10 dark:shadow-black/40">
                <CardHeader className="text-center pt-8">
                  <div className="w-16 h-16 mx-auto mb-4 gradient-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg shadow-emerald-900/25">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <CardTitle>Check your email</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    We've sent a confirmation link to <strong>{confirmedEmail}</strong>. Please open
                    your inbox and click the link to verify your account.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                    <p className="text-sm text-muted-foreground">
                      <Mail className="w-4 h-4 inline mr-1" /> Didn't receive the email?
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1 pl-4 list-disc">
                      <li>Check your spam or promotions folder</li>
                      <li>Make sure you entered the correct email address</li>
                      <li>Wait a few minutes - sometimes delivery takes a moment</li>
                    </ul>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => {
                      setShowEmailConfirmation(false);
                      setConfirmedEmail("");
                    }}
                  >
                    Back to sign in
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">
                    Already confirmed?{" "}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-0 h-auto"
                      onClick={() => router.navigate({ to: "/auth" })}
                    >
                      Sign in now
                    </Button>
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="auth"
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ type: "spring", damping: 26, stiffness: 300 }}
            >
              <Card className="glass-strong rounded-3xl border-transparent shadow-2xl shadow-black/10 dark:shadow-black/40">
                <CardHeader className="pt-8">
                  <CardTitle>Welcome</CardTitle>
                  <CardDescription>Sign in or create your account to continue.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="signin" value={tab} onValueChange={(v) => setTab(v)}>
                    <TabsList className="relative grid grid-cols-2 w-full h-12 items-stretch rounded-full bg-background/60 p-1 border border-border/50">
                      <TabsTrigger
                        value="signin"
                        className="relative rounded-full cursor-pointer data-[state=active]:text-primary-foreground"
                      >
                        {tab === "signin" && (
                          <motion.span
                            layoutId="auth-tab-pill"
                            className="absolute inset-0 rounded-full gradient-primary shadow-md shadow-emerald-900/20"
                            transition={{ type: "spring", stiffness: 420, damping: 34 }}
                          />
                        )}
                        <span className="relative">Sign in</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="signup"
                        className="relative rounded-full cursor-pointer data-[state=active]:text-primary-foreground"
                      >
                        {tab === "signup" && (
                          <motion.span
                            layoutId="auth-tab-pill"
                            className="absolute inset-0 rounded-full gradient-primary shadow-md shadow-emerald-900/20"
                            transition={{ type: "spring", stiffness: 420, damping: 34 }}
                          />
                        )}
                        <span className="relative">Sign up</span>
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="signin">
                      <form onSubmit={signIn} className="space-y-4 mt-4">
                        <div>
                          <Label htmlFor="si-email">Email</Label>
                          <Input id="si-email" name="email" type="email" required />
                        </div>
                        <div>
                          <Label htmlFor="si-password">Password</Label>
                          <Input
                            id="si-password"
                            name="password"
                            type="password"
                            required
                            minLength={6}
                          />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                          Sign in
                        </Button>
                      </form>
                    </TabsContent>
                    <TabsContent value="signup">
                      <form onSubmit={signUp} className="space-y-4 mt-4">
                        <div>
                          <Label htmlFor="su-name">Your name</Label>
                          <Input id="su-name" name="name" required />
                        </div>
                        <div>
                          <Label htmlFor="su-email">Email</Label>
                          <Input id="su-email" name="email" type="email" required />
                        </div>
                        <div>
                          <Label htmlFor="su-password">Password</Label>
                          <Input
                            id="su-password"
                            name="password"
                            type="password"
                            required
                            minLength={6}
                          />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                          Create account
                        </Button>
                      </form>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
