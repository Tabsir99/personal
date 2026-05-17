"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { logInAction } from "@/actions/authActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { FormField } from "@/components/ui/FormField";
import { Kbd } from "@/components/ui/Kbd";
import { StatusDot } from "@/components/ui/StatusDot";

export default function LogIn() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const response = await logInAction(formData);
    if (response.status === "success") {
      router.push("/dashboard");
      return;
    }
    toast.error(response.message);
    setIsLoading(false);
  };

  return (
    <div className="dark flex min-h-screen items-center justify-center bg-background bg-[radial-gradient(hsl(var(--border))_1px,transparent_1px)] bg-size-[28px_28px] p-4">
      {/* Ambient glow — single tight focal point */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed top-1/4 left-1/2 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-primary/4 blur-[80px]"
      />

      <div className="stagger-cascade relative z-10 w-full max-w-md">
        {/* Top meta row */}
        <div
          className="mb-5 flex items-center justify-between px-0.5"
          style={{ ["--stagger-index" as string]: 0 }}
        >
          <Eyebrow tone="muted" family="mono">
            sys / admin
          </Eyebrow>
          <span className="inline-flex items-center gap-1.5 rounded-sm border border-primary/25 bg-primary/8 px-2 py-0.5">
            <StatusDot tone="primary" size="xs" breathing />
            <Eyebrow tone="primary" family="mono">
              Secure
            </Eyebrow>
          </span>
        </div>

        {/* Card */}
        <Card
          className="relative overflow-hidden bg-card shadow-dialog"
          style={{ ["--stagger-index" as string]: 1 }}
        >
          <CardHeader className="px-8 pt-8 pb-2">
            <Eyebrow tone="muted" family="mono">
              Authentication required
            </Eyebrow>
            <h1 className="mt-1.5 text-[1.75rem] leading-tight font-semibold tracking-tight text-foreground">
              Admin Portal
            </h1>
            <p className="font-mono text-xs leading-relaxed tracking-wide text-muted-foreground">
              Restricted access — authenticate to continue.
            </p>
          </CardHeader>

          <CardContent className="px-8 pt-2 pb-8">
            <form
              onSubmit={handleSubmit}
              className="space-y-4"
              autoComplete="off"
            >
              <FormField label="Username">
                <Input
                  type="text"
                  id="username"
                  name="username"
                  value={username}
                  placeholder="username"
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-10 font-mono text-sm"
                />
              </FormField>

              <FormField label="Password">
                <Input
                  type="password"
                  id="password"
                  name="password"
                  value={password}
                  placeholder="••••••••"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-10 font-mono text-sm"
                />
              </FormField>

              <Button
                type="submit"
                disabled={isLoading}
                size="lg"
                className="mt-2 h-10 w-full justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Authenticating…</span>
                  </>
                ) : (
                  <>
                    <span>Sign in</span>
                    <Kbd
                      size="sm"
                      className="border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground"
                    >
                      ⌘⏎
                    </Kbd>
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer note */}
        <div
          className="mt-5 text-center"
          style={{ ["--stagger-index" as string]: 2 }}
        >
          <Eyebrow tone="muted" family="mono">
            All access attempts are logged
          </Eyebrow>
        </div>
      </div>
    </div>
  );
}
