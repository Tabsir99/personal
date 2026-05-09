"use client";
import { FormEvent, useState } from "react";
import { logInAction } from "@/actions/authActions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const LogIn = () => {
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
    } else {
      toast.error(response.message);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen dark bg-background bg-[radial-gradient(hsl(var(--border))_1px,transparent_1px)] bg-size-[28px_28px] flex items-center justify-center p-4">
      {/* Ambient glow */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-primary/5 blur-[80px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-[420px]">
        {/* Top meta row */}
        <div className="flex items-center justify-between mb-5 px-0.5">
          <span className="font-mono text-[0.65rem] tracking-widest text-muted-foreground uppercase">
            sys / admin
          </span>
          <span className="font-mono text-[0.65rem] tracking-widest uppercase text-primary bg-primary/10 border border-primary/25 px-2 py-0.5 rounded-sm">
            ● Secure
          </span>
        </div>

        {/* Card */}
        <Card className="relative overflow-hidden border border-border bg-card shadow-2xl rounded-xl">
          <CardHeader className="px-8 pt-8 pb-6">
            <div>
              <h1 className="font-sans font-extrabold text-[1.75rem] tracking-tight leading-none text-foreground mb-2">
                Admin Portal
              </h1>
              <p className="font-mono text-xs text-muted-foreground tracking-wide">
                Restricted access — authenticate to continue
              </p>
            </div>
          </CardHeader>

          <CardContent className="px-8 pb-8">
            <form
              onSubmit={handleSubmit}
              className="space-y-5"
              autoComplete=""
              autoSave=""
            >
              {/* Username */}
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="username"
                  className="font-mono text-[0.65rem] tracking-widest uppercase text-muted-foreground"
                >
                  Username
                </Label>
                <Input
                  type="text"
                  id="username"
                  name="username"
                  value={username}
                  placeholder="enter username"
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-11 rounded-md font-mono text-sm bg-background border-border text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-primary disabled:opacity-50"
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="password"
                  className="font-mono text-[0.65rem] tracking-widest uppercase text-muted-foreground"
                >
                  Password
                </Label>
                <Input
                  type="password"
                  id="password"
                  name="password"
                  value={password}
                  placeholder="••••••••"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-11 rounded-md font-mono text-sm bg-background border-border text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-primary disabled:opacity-50"
                />
              </div>

              {/* Submit */}
              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 rounded-md font-sans font-bold text-xs tracking-[0.08em] uppercase bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-45 disabled:cursor-not-allowed disabled:active:scale-100"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2.5">
                      <svg
                        className="animate-spin w-3.5 h-3.5 shrink-0"
                        viewBox="0 0 15 15"
                        fill="none"
                      >
                        <circle
                          cx="7.5"
                          cy="7.5"
                          r="6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeOpacity="0.25"
                        />
                        <path
                          d="M7.5 1.5a6 6 0 0 1 6 6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                      Authenticating...
                    </span>
                  ) : (
                    "Sign In →"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer note */}
        <p className="text-center mt-5 font-mono text-[0.6rem] tracking-widest uppercase text-muted-foreground/40">
          All access attempts are logged and monitored
        </p>
      </div>
    </div>
  );
};

export default LogIn;
