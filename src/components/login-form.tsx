"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
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
import { Eye, EyeOff, Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import axiosInstance, { endpoints } from "@/lib/endpoints";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter ();

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    const { data, error } = await authClient.signIn.email({
      email,
      password,
    });

    if (error) {
      toast.error(error.message || error?.statusText);
      return;
    }

    // Track login on backend
    if (data?.user?.id) {
      await axiosInstance.put(endpoints.user.trackLogin, {
        userId: data.user.id,
      });
    }

    console.log("✅ SUCCESS BETTER AUTH", data);
    router.push("/dashboard");
  } catch (err) {
    console.error("Login error:", err);
    toast.error("Something went wrong. Please try again.");
  } finally {
    setLoading(false);
  }
};


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
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    // placeholder="admin@deuceleague.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter your email"
                    className="focus-visible:ring-3 focus-visible:ring-[#FF690090] focus-visible:ring-offset-0"
                  />
                </div>
                <div className="grid gap-3">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <a
                      href="#"
                      className="ml-auto text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </a>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Enter your password"
                      className="focus-visible:ring-3 focus-visible:ring-[#FF691090] focus-visible:ring-offset-0"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                      <span className="sr-only">
                        {showPassword ? "Hide password" : "Show password"}
                      </span>
                    </Button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2Icon className="animate-spin" /> : "Login"}
                </Button>
              </div>
            </div>
          </form>
          {/* <Button
            className="w-full mt-3"
            onClick={async () => {
              const { data, error } = await authClient.signUp.email({
                name: "Afiq",
                email: "afiqnrzm@hotmail.com",
                password: "Afiq7203",
                username: "apikol",
                displayUsername: "apikol",
              });

              console.log(data);

              if (error) {
                console.log("BETTER AUTH ERROR SIGNUP", error);
              }
            }}
          >
            {"Register"}
          </Button> */}
        </CardContent>
      </Card>
    </div>
  );
}
