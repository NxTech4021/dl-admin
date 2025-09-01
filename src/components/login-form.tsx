"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import axios from "axios";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // setError("");

    const { data, error } = await authClient.signIn.email({
      email,
      password,
      callbackURL: "http://localhost/",
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    console.log("SUCCESS BETTER AUTH", data);
    setLoading(false);

    // if (error) {
    //   toast.error("Error login");
    //   return;
    //   console.log("ERROR BETTER AUTH", error);
    // }

    // try {
    //   const response = await axios.post(
    //     `${process.env.NEXT_PUBLIC_HOST_URL}/api/admin/adminlogin`,
    //     { email, password },
    //     {
    //       withCredentials: true, // ensures cookies are sent/received
    //     }
    //   );

    //   const { data } = response;
    //   console.log("Login response:", data);

    //   if (data) {
    //     // Redirect to dashboard on successful login
    //     router.push("/");
    //     router.refresh();
    //   }
    // } catch (err: any) {
    //   // Extract error message from backend response
    //   if (err.response?.data?.message) {
    //     // Use the specific error message from the backend
    //     const backendMessage = err.response.data.message;
    //     if (
    //       backendMessage === "Invalid credentials" ||
    //       backendMessage === "Email and password are required"
    //     ) {
    //       setError("Wrong email or password");
    //     } else if (backendMessage === "Sorry you do not have permission") {
    //       setError("You don't have permission to access this admin panel");
    //     } else {
    //       setError(backendMessage);
    //     }
    //   } else if (
    //     err.response?.status === 400 ||
    //     err.response?.status === 401 ||
    //     err.response?.status === 403
    //   ) {
    //     setError("Wrong email or password");
    //   } else if (
    //     err.code === "ECONNREFUSED" ||
    //     err.message.includes("Network Error")
    //   ) {
    //     setError("Unable to connect to server. Please try again later.");
    //   } else {
    //     setError("An unexpected error occurred. Please try again.");
    //   }
    //   console.error("Login error:", err);
    // } finally {
    //   setLoading(false);
    // }
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
