"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Mail, Loader2, } from "lucide-react";


interface AdminInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminInviteModal({
  isOpen,
  onClose,
}: AdminInviteModalProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSendInvite = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {

      // username is a must for creating users in the backend 
       const tempUsername =
        email.split("@")[0] + Math.floor(Math.random() * 1000);
     
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_HOST_URL}/api/admin/invite`,
        {
          email,
          name,               
          username: tempUsername, 
        }
      );
      console.log("Success toast about to fire");
      toast.success(res.data.message || "Invitation sent successfully!");

      console.log("email", res.data);
      setSuccess(res.data.message);
      setEmail(""); 
      setName("");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to send invite");
      const message =
        err.response?.data?.error ||      
        err.response?.data?.message ||   
        err.message ||                   
        "Failed to send invite";

    toast.error(message);
    setError(message);
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
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Admin Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
         
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

      
        </CardContent>
             <CardFooter className="flex justify-between">
        <Button
            type="button"
            onClick={handleSendInvite}
            disabled={loading || !email || !name}
          >
            {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : "Send Invitation"}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </CardFooter>

      </Card>
    </div>
  );
}
