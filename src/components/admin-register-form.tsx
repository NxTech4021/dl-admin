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
import {
  Eye,
  EyeOff,
  Mail,
  User,
  UserCheck,
  Lock,
  Check,
  X,
  AlertCircle,
} from "lucide-react";
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

  // Real-time validation states
  const [usernameValid, setUsernameValid] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);
  const [confirmPasswordValid, setConfirmPasswordValid] = useState(false);
  const [nameValid, setNameValid] = useState(false);

  // Focus states for showing requirements
  const [usernameFocused, setUsernameFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);

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

  // Real-time validation functions
  const validatePassword = (password: string) => {
    return (
      password.length >= 8 && /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)
    );
  };

  const validateName = (name: string) => {
    return name.trim().length >= 2 && /^[a-zA-Z\s]+$/.test(name.trim());
  };

  // Real-time validation effects
  useEffect(() => {
    const safeUsername = validateUsername(username);
    setUsernameValid(!!safeUsername && username.length > 0);
  }, [username]);

  useEffect(() => {
    setPasswordValid(validatePassword(password));
  }, [password]);

  useEffect(() => {
    setConfirmPasswordValid(
      password === confirmPassword && confirmPassword.length > 0
    );
  }, [password, confirmPassword]);

  useEffect(() => {
    setNameValid(validateName(name));
  }, [name]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("Invalid or missing invite token");
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
          <form
            onSubmit={handleRegister}
            className="grid gap-6"
            autoComplete="off"
            data-form-type="other"
          >
            <div className="grid gap-3">
              <Label htmlFor="email" className="flex items-center gap-2">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  disabled
                  className="bg-gray-100 pl-9"
                  autoComplete="off"
                  data-form-type="other"
                />
              </div>
            </div>

            <div className="grid gap-3">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onFocus={() => setUsernameFocused(true)}
                  onBlur={() => setUsernameFocused(false)}
                  className={`pl-9 pr-10 ${
                    username.length > 0
                      ? usernameValid
                        ? "border-green-500 focus:border-green-500"
                        : "border-red-500 focus:border-red-500"
                      : ""
                  }`}
                  required
                  autoComplete="new-password"
                  data-form-type="other"
                />
                {username.length > 0 && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {usernameValid ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <X className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                )}
              </div>
              {usernameFocused && (
                <div className="space-y-2 p-3 bg-muted/50 rounded-md border">
                  <p className="text-xs font-medium text-muted-foreground">
                    Requirements:
                  </p>
                  <div className="space-y-1">
                    <div
                      className={`flex items-center gap-2 text-xs ${
                        username.length >= 3
                          ? "text-green-600"
                          : "text-muted-foreground"
                      }`}
                    >
                      {username.length >= 3 ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                      3-20 characters
                    </div>
                    <div
                      className={`flex items-center gap-2 text-xs ${
                        /^[a-z0-9_]*$/.test(username) && username.length > 0
                          ? "text-green-600"
                          : "text-muted-foreground"
                      }`}
                    >
                      {/^[a-z0-9_]*$/.test(username) && username.length > 0 ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                      Lowercase letters, numbers, underscores only
                    </div>
                    <div
                      className={`flex items-center gap-2 text-xs ${
                        username.length <= 20
                          ? "text-green-600"
                          : "text-muted-foreground"
                      }`}
                    >
                      {username.length <= 20 ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                      Maximum 20 characters
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid gap-3">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={() => setNameFocused(true)}
                  onBlur={() => setNameFocused(false)}
                  className={`pl-9 pr-10 ${
                    name.length > 0
                      ? nameValid
                        ? "border-green-500 focus:border-green-500"
                        : "border-red-500 focus:border-red-500"
                      : ""
                  }`}
                  required
                  autoComplete="off"
                  data-form-type="other"
                />
                {name.length > 0 && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {nameValid ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <X className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                )}
              </div>
              {nameFocused && (
                <div className="space-y-2 p-3 bg-muted/50 rounded-md border">
                  <p className="text-xs font-medium text-muted-foreground">
                    Requirements:
                  </p>
                  <div className="space-y-1">
                    <div
                      className={`flex items-center gap-2 text-xs ${
                        name.trim().length >= 2
                          ? "text-green-600"
                          : "text-muted-foreground"
                      }`}
                    >
                      {name.trim().length >= 2 ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                      At least 2 characters
                    </div>
                    <div
                      className={`flex items-center gap-2 text-xs ${
                        /^[a-zA-Z\s]*$/.test(name) && name.length > 0
                          ? "text-green-600"
                          : "text-muted-foreground"
                      }`}
                    >
                      {/^[a-zA-Z\s]*$/.test(name) && name.length > 0 ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                      Letters and spaces only
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid gap-3">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  className={`pl-9 pr-20 ${
                    password.length > 0
                      ? passwordValid
                        ? "border-green-500 focus:border-green-500"
                        : "border-red-500 focus:border-red-500"
                      : ""
                  }`}
                  required
                  autoComplete="new-password"
                  data-form-type="other"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {password.length > 0 && (
                    <div className="mr-2">
                      {passwordValid ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-transparent"
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
              {passwordFocused && (
                <div className="space-y-2 p-3 bg-muted/50 rounded-md border">
                  <p className="text-xs font-medium text-muted-foreground">
                    Requirements:
                  </p>
                  <div className="space-y-1">
                    <div
                      className={`flex items-center gap-2 text-xs ${
                        password.length >= 8
                          ? "text-green-600"
                          : "text-muted-foreground"
                      }`}
                    >
                      {password.length >= 8 ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                      At least 8 characters
                    </div>
                    <div
                      className={`flex items-center gap-2 text-xs ${
                        /[a-z]/.test(password)
                          ? "text-green-600"
                          : "text-muted-foreground"
                      }`}
                    >
                      {/[a-z]/.test(password) ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                      One lowercase letter
                    </div>
                    <div
                      className={`flex items-center gap-2 text-xs ${
                        /[A-Z]/.test(password)
                          ? "text-green-600"
                          : "text-muted-foreground"
                      }`}
                    >
                      {/[A-Z]/.test(password) ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                      One uppercase letter
                    </div>
                    <div
                      className={`flex items-center gap-2 text-xs ${
                        /\d/.test(password)
                          ? "text-green-600"
                          : "text-muted-foreground"
                      }`}
                    >
                      {/\d/.test(password) ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                      One number
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid gap-3">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onFocus={() => setConfirmPasswordFocused(true)}
                  onBlur={() => setConfirmPasswordFocused(false)}
                  className={`pl-9 pr-20 ${
                    confirmPassword.length > 0
                      ? confirmPasswordValid
                        ? "border-green-500 focus:border-green-500"
                        : "border-red-500 focus:border-red-500"
                      : ""
                  }`}
                  required
                  autoComplete="new-password"
                  data-form-type="other"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {confirmPassword.length > 0 && (
                    <div className="mr-2">
                      {confirmPasswordValid ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-transparent"
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
              {confirmPasswordFocused && (
                <div className="space-y-2 p-3 bg-muted/50 rounded-md border">
                  <p className="text-xs font-medium text-muted-foreground">
                    Requirements:
                  </p>
                  <div className="space-y-1">
                    <div
                      className={`flex items-center gap-2 text-xs ${
                        confirmPassword === password &&
                        confirmPassword.length > 0
                          ? "text-green-600"
                          : "text-muted-foreground"
                      }`}
                    >
                      {confirmPassword === password &&
                      confirmPassword.length > 0 ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                      Must match the password above
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={
                loading ||
                !usernameValid ||
                !passwordValid ||
                !confirmPasswordValid ||
                !nameValid
              }
            >
              {loading ? "Registering..." : "Register"}
            </Button>

            {/* Validation Summary */}
            <div className="text-xs text-muted-foreground space-y-1">
              <p className="font-medium">Form Requirements:</p>
              <div className="grid grid-cols-2 gap-2">
                <div
                  className={`flex items-center gap-2 ${
                    usernameValid ? "text-green-600" : "text-muted-foreground"
                  }`}
                >
                  {usernameValid ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <X className="h-3 w-3" />
                  )}
                  Username valid
                </div>
                <div
                  className={`flex items-center gap-2 ${
                    nameValid ? "text-green-600" : "text-muted-foreground"
                  }`}
                >
                  {nameValid ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <X className="h-3 w-3" />
                  )}
                  Name valid
                </div>
                <div
                  className={`flex items-center gap-2 ${
                    passwordValid ? "text-green-600" : "text-muted-foreground"
                  }`}
                >
                  {passwordValid ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <X className="h-3 w-3" />
                  )}
                  Password valid
                </div>
                <div
                  className={`flex items-center gap-2 ${
                    confirmPasswordValid
                      ? "text-green-600"
                      : "text-muted-foreground"
                  }`}
                >
                  {confirmPasswordValid ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <X className="h-3 w-3" />
                  )}
                  Passwords match
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
