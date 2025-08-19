"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      
      const { data, error } = await authClient.signIn.email({
        email,
        password,
      });

      if (error) {
        setError(error.message || "Login failed");
        return;
      }

      if (data) {
        // Redirect to dashboard on successful login
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#fefcf8' }}>
      {/* Hashtag-like grid box around login card */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, transparent calc(50% - 250px), rgba(254, 159, 77, 0.3) calc(50% - 250px), rgba(254, 159, 77, 0.3) calc(50% - 248px), transparent calc(50% - 248px)),
            linear-gradient(to right, transparent calc(50% + 250px), rgba(254, 159, 77, 0.3) calc(50% + 250px), rgba(254, 159, 77, 0.3) calc(50% + 252px), transparent calc(50% + 252px)),
            linear-gradient(to bottom, transparent calc(50% - 250px), rgba(254, 159, 77, 0.3) calc(50% - 250px), rgba(254, 159, 77, 0.3) calc(50% - 248px), transparent calc(50% - 248px)),
            linear-gradient(to bottom, transparent calc(50% + 250px), rgba(254, 159, 77, 0.3) calc(50% + 250px), rgba(254, 159, 77, 0.3) calc(50% + 252px), transparent calc(50% + 252px))
          `
        }}
      />
      
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 1000px 700px at center, 
              rgba(107, 114, 128, 0.3) 0%, 
              rgba(107, 114, 128, 0.2) 20%, 
              rgba(107, 114, 128, 0.1) 40%, 
              rgba(107, 114, 128, 0.05) 60%, 
              transparent 80%
            )
          `,
          backgroundImage: `
            linear-gradient(to right, transparent calc(50% - 250px), rgba(107, 114, 128, 0.2) calc(50% - 250px), rgba(107, 114, 128, 0.2) calc(50% - 248px), transparent calc(50% - 248px)),
            linear-gradient(to right, transparent calc(50% + 250px), rgba(107, 114, 128, 0.2) calc(50% + 250px), rgba(107, 114, 128, 0.2) calc(50% + 252px), transparent calc(50% + 252px)),
            linear-gradient(to bottom, transparent calc(50% - 250px), rgba(107, 114, 128, 0.2) calc(50% - 250px), rgba(107, 114, 128, 0.2) calc(50% - 248px), transparent calc(50% - 248px)),
            linear-gradient(to bottom, transparent calc(50% + 250px), rgba(107, 114, 128, 0.2) calc(50% + 250px), rgba(107, 114, 128, 0.2) calc(50% + 252px), transparent calc(50% + 252px))
          `,
          maskImage: `radial-gradient(ellipse 1000px 700px at center, black 0%, black 60%, transparent 80%)`,
          WebkitMaskImage: `radial-gradient(ellipse 1000px 700px at center, black 0%, black 60%, transparent 80%)`
        }}
      />
      
      {/* Login Card*/}
      <Card className="w-full max-w-sm relative z-10 bg-white border border-gray-300 shadow-sm">
        <CardHeader className="space-y-1 pb-4 px-6">
          <div className="space-y-1">
            <CardTitle className="text-2xl sm:text-3xl font-bold italic text-center tracking-tight" style={{ color: '#FE9F4D' }}>
              DEUCE
            </CardTitle>
            <CardDescription className="text-center text-gray-600 text-sm">
              Sign in to your account to continue
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 px-6 pb-6">
          {error && (
            <Alert variant="destructive" className="border-red-400 bg-red-50 text-red-700">
              <AlertDescription className="text-xs sm:text-sm">{error}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Mail size={16} className="text-gray-500" />
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@deuceleague.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-orange-300 focus:ring-orange-200 h-10 text-sm transition-all duration-300 hover:border-orange-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Lock size={16} className="text-gray-500" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-orange-300 focus:ring-orange-200 h-10 text-sm transition-all duration-300 hover:border-orange-200"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-10 mt-6 bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white font-medium text-sm transition-all duration-300 active:scale-[0.98] border-0" 
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing in...</span>
                </div>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
