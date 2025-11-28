"use client";

import { useState, useEffect, useRef } from "react";
import { authClient, useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Loader2Icon, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import axiosInstance, { endpoints } from "@/lib/endpoints";

/**
 * LoginForm - Secure authentication form with comprehensive error handling
 *
 * Features:
 * - Automatic redirect for authenticated users
 * - Detailed error messages with retry capability
 * - Form validation
 * - Accessible password toggle
 * - Fire-and-forget activity tracking
 * - Request cancellation on unmount
 */

interface LoginError {
  type: "network" | "auth" | "server" | "validation" | "unknown";
  message: string;
}

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<LoginError | null>(null);
  const [loading, setLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const router = useRouter();
  const abortControllerRef = useRef<AbortController | null>(null);

  // Check if user is already authenticated
  const { data: session, isPending: sessionLoading } = useSession();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (session?.user && !sessionLoading) {
      setIsRedirecting(true);
      router.replace("/dashboard");
    }
  }, [session, sessionLoading, router]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Auto-focus email field
  useEffect(() => {
    const emailInput = document.getElementById("email");
    if (emailInput && !session) {
      emailInput.focus();
    }
  }, [session]);

  const trackLoginActivity = async (userId: string) => {
    // Fire-and-forget tracking - don't block user experience
    try {
      await axiosInstance.put(
        endpoints.user.trackLogin,
        { userId },
        { timeout: 3000 } // 3s timeout for tracking
      );
    } catch (err) {
      // Log but don't surface to user
      if (process.env.NODE_ENV === "development") {
        console.warn("Failed to track login activity:", err);
      }
    }
  };

  const validateForm = (): LoginError | null => {
    if (!email.trim()) {
      return {
        type: "validation",
        message: "Email is required",
      };
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return {
        type: "validation",
        message: "Please enter a valid email address",
      };
    }

    if (!password) {
      return {
        type: "validation",
        message: "Password is required",
      };
    }

    if (password.length < 6) {
      return {
        type: "validation",
        message: "Password must be at least 6 characters",
      };
    }

    return null;
  };

  const parseLoginError = (err: any): LoginError => {
    // Better Auth specific errors
    if (err?.message) {
      const message = err.message.toLowerCase();

      if (message.includes("invalid") || message.includes("credential")) {
        return {
          type: "auth",
          message: "Invalid email or password",
        };
      }

      if (message.includes("network") || message.includes("fetch")) {
        return {
          type: "network",
          message: "Network connection failed. Please check your internet connection.",
        };
      }

      if (message.includes("timeout")) {
        return {
          type: "network",
          message: "Request timed out. Please try again.",
        };
      }

      if (message.includes("429") || message.includes("rate limit")) {
        return {
          type: "server",
          message: "Too many login attempts. Please wait a moment and try again.",
        };
      }

      if (message.includes("500") || message.includes("502") || message.includes("503")) {
        return {
          type: "server",
          message: "Server temporarily unavailable. Please try again shortly.",
        };
      }
    }

    // Status-based errors
    if (err?.status === 401 || err?.status === 403) {
      return {
        type: "auth",
        message: "Invalid email or password",
      };
    }

    if (err?.status === 429) {
      return {
        type: "server",
        message: "Too many login attempts. Please wait before trying again.",
      };
    }

    if (err?.status >= 500) {
      return {
        type: "server",
        message: "Server error. Please try again later.",
      };
    }

    // Network errors
    if (err?.code === "ECONNABORTED" || err?.code === "ERR_NETWORK") {
      return {
        type: "network",
        message: "Connection failed. Please check your internet connection.",
      };
    }

    // Default error
    return {
      type: "unknown",
      message: err?.message || "An unexpected error occurred. Please try again.",
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setError(null);

    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    // Create abort controller for this request
    abortControllerRef.current = new AbortController();
    setLoading(true);

    try {
      const { data, error: authError } = await authClient.signIn.email({
        email: email.trim(),
        password,
      });

      if (authError) {
        const loginError = parseLoginError(authError);
        setError(loginError);
        toast.error(loginError.message);
        return;
      }

      if (!data?.user) {
        throw new Error("No user data returned");
      }

      // Track login activity (fire-and-forget)
      if (data.user.id) {
        trackLoginActivity(data.user.id);
      }

      // Success - redirect to dashboard
      toast.success("Login successful! Redirecting...");
      setIsRedirecting(true);
      router.push("/dashboard");

    } catch (err) {
      const loginError = parseLoginError(err);
      setError(loginError);
      toast.error(loginError.message);
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleRetry = () => {
    setError(null);
    setEmail("");
    setPassword("");
    document.getElementById("email")?.focus();
  };

  // Show loading state while checking session
  if (sessionLoading || isRedirecting) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              {isRedirecting ? "Redirecting to dashboard..." : "Loading..."}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>Login with your email and password</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>{error.message}</span>
                {error.type === "network" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRetry}
                    className="ml-2"
                  >
                    Retry
                  </Button>
                )}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="grid gap-6">
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter your email"
                    disabled={loading}
                    autoComplete="email"
                    className="focus-visible:ring-3 focus-visible:ring-[#FF690090] focus-visible:ring-offset-0"
                    aria-invalid={error?.type === "validation" ? "true" : "false"}
                  />
                </div>
                <div className="grid gap-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    {/* Disabled until forgot password is implemented */}
                    {/* <Link
                      href="/forgot-password"
                      className="text-sm underline-offset-4 hover:underline text-muted-foreground"
                    >
                      Forgot password?
                    </Link> */}
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Enter your password"
                      disabled={loading}
                      autoComplete="current-password"
                      className="focus-visible:ring-3 focus-visible:ring-[#FF691090] focus-visible:ring-offset-0 pr-10"
                      aria-invalid={error?.type === "validation" ? "true" : "false"}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                      tabIndex={-1}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Eye className="h-4 w-4" aria-hidden="true" />
                      )}
                    </Button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
