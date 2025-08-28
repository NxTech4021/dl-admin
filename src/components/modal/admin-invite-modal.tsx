// components/AdminInviteModal.tsx
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Mail, Loader2, XCircle, CheckCircle } from "lucide-react";
import { CircleCheckBig } from "lucide-react";

interface AdminInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminInviteModal({
  isOpen,
  onClose,
}: AdminInviteModalProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSendInvite = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Axios call to your admin invite API
      const res = await axios.post(`${process.env.HOST_URL}/api/admin/invite`, {
        email,
      });
      setSuccess(res.data.message);

      console.log("email", res.data);
      setEmail(""); // reset input
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to send invite");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Invite a New Admin</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {success && (
            <Alert variant="default" className="bg-green-500 text-white">
              <CircleCheckBig className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button onClick={handleSendInvite} disabled={loading || !email}>
            {loading ? (
              <Loader2 className="animate-spin mr-2 h-4 w-4" />
            ) : (
              "Send Invitation"
            )}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
