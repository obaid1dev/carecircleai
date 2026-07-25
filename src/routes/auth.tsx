import { createFileRoute, useRouter, Link, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Mail, CheckCircle2 } from "lucide-react";
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
      const { data: profile } = await supabase.from("profiles").select("active_role").eq("id", data.user.id).maybeSingle();
      const role = profile?.active_role || "senior";
      throw redirect({ to: role === "caregiver" ? "/family" : "/dashboard" });
    }
  },
  component: AuthPage,
});

function AuthPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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
      if (error.message.includes("Email not confirmed") || error.message.includes("email not confirmed")) {
        return toast.error("Please confirm your email before signing in. Check your inbox for the confirmation link.");
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
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 font-semibold text-lg mb-6">
          <Heart className="w-6 h-6 text-accent" fill="currentColor" />
          CareCircle
        </Link>

        {showEmailConfirmation ? (
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
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
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Welcome</CardTitle>
              <CardDescription>Sign in or create your account to continue.</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="signin">
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="signin">Sign in</TabsTrigger>
                  <TabsTrigger value="signup">Sign up</TabsTrigger>
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
        )}
      </div>
    </div>
  );
}
