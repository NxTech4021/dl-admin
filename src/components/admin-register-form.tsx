"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export function AdminRegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    console.log("Fetching invite for token:", token);
    const fetchEmail = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_HOST_URL}/api/admin/get-invite?token=${token}`
        );
        console.log("res", res.data);
        setEmail(res.data.email);
      } catch (err) {
        console.error("Error fetching invite email:", err);
        setError("Invalid or expired invite token");
      }
    };

    fetchEmail();
  }, [token]);

    const validateUsername = (raw: string) => {
    const sanitized = raw.trim().toLowerCase().replace(/\s+/g, "_");
    const regex = /^[a-z0-9_]{3,20}$/; // letters, numbers, underscore, 3–20 chars
    return regex.test(sanitized) ? sanitized : null;
  };


  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("Invalid or missing invite token")
      setError("Invalid or missing invite token");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const safeUsername = validateUsername(username);
    if (!safeUsername) {
      setError(
        "Invalid username. Use 3–20 characters: letters, numbers, underscores only."
      );
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");

    const formData = { token, email, username: safeUsername, name, password };
    console.log("Submitting form data:", formData);


    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_HOST_URL}/api/admin/register`,
        formData,
        { withCredentials: true }
      );

      setSuccess(res.data.message);
      toast.success(res.data.message || "You have registered successfully!");
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to register");
      toast.error(err.response?.data?.message || "Failed to register admin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create Admin Account</CardTitle>
          <CardDescription>Fill in your details to register</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="grid gap-6">
            <div className="grid gap-3">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                disabled
                className="bg-gray-100"
              />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <p className="text-xs text-red-500">
                No spaces or Uppercase Letters
              </p>
            </div>


            <div className="grid gap-3">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
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

            <div className="grid gap-3">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
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
              {loading ? "Registering..." : "Register"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
