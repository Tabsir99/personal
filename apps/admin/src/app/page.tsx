"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "premium-ds/toast";

import { logInAction } from "@/actions/authActions";
import { Button } from "premium-ds/button";
import { TextField } from "premium-ds/text-field";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Kbd } from "@/components/ui/Kbd";
import { Badge } from "premium-ds/badge";
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
      router.push("/analytics");
      return;
    }
    toast.error(response.message);
    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background bg-[radial-gradient(hsl(var(--border))_1px,transparent_1px)] bg-size-[28px_28px] p-4">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed top-1/4 left-1/2 h-100 w-150 -translate-x-1/2 rounded-full bg-primary/4 blur-[80px]"
      />

      <div className="relative z-10 w-full max-w-md stagger-cascade">
        <div
          className="mb-5 flex items-center justify-between px-0.5"
          style={{ ["--stagger-index" as string]: 0 }}
        >
          <Eyebrow tone="muted" family="mono">
            sys / admin
          </Eyebrow>
          <Badge tone="info" dot live pill>
            Secure
          </Badge>
        </div>

        <div
          className="relative overflow-hidden rounded-lg border border-border bg-card shadow-dialog"
          style={{ ["--stagger-index" as string]: 1 }}
        >
          <div className="px-8 pt-8 pb-2">
            <Eyebrow tone="muted" family="mono">
              Authentication required
            </Eyebrow>
            <h1 className="mt-1.5 text-[1.75rem] leading-tight font-semibold tracking-tight text-foreground">
              Admin Portal
            </h1>
            <p className="font-mono text-xs leading-relaxed tracking-wide text-muted-foreground">
              Restricted access — authenticate to continue.
            </p>
          </div>

          <div className="px-8 pt-2 pb-8">
            <form
              onSubmit={handleSubmit}
              className="space-y-4"
              autoComplete="off"
            >
              <TextField
                type="text"
                id="username"
                label="Username"
                value={username}
                placeholder="username"
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
              />

              <TextField
                type="password"
                id="password"
                label="Password"
                value={password}
                placeholder="••••••••"
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />

              <Button
                type="submit"
                disabled={isLoading || !username || !password}
                loading={isLoading}
                size="lg"
                className="mt-2 h-10 w-full justify-center gap-2"
                iconRight={
                  !isLoading ? (
                    <Kbd
                      size="sm"
                      className="border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground"
                    >
                      ⌘⏎
                    </Kbd>
                  ) : undefined
                }
              >
                {isLoading ? "Authenticating…" : "Sign in"}
              </Button>
            </form>
          </div>
        </div>

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
