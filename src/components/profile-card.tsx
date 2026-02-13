"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, MapPin, UserCircle } from "lucide-react";

interface ProfileCardProps {
  profile?: {
    name?: string | null;
    area?: string | null;
    gender?: string | null;
    email?: string | null;
    image?: string | null;
    status?: string | null;
  } | null;

  onSave: (data: { name: string; area: string; gender: string }) => void;
  saving: boolean;
}
export function ProfileCard({
  profile,
  onSave,
  saving = false,
}: ProfileCardProps) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: profile?.name ?? "",
    area: profile?.area ?? "",
    gender: profile?.gender ?? "",
  });

  // Keep form in sync if profile changes
  useEffect(() => {
    setForm({
      name: profile?.name ?? "",
      area: profile?.area ?? "",
      gender: profile?.gender ?? "",
    });
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    onSave(form);
    setEditing(false);
  };

  // Safe defaults
  const displayName = profile?.name ?? "Unnamed";
  const displayEmail = profile?.email ?? "No email";
  const displayArea = profile?.area ?? "Location not set";
  const displayGender = profile?.gender ?? "Gender not set";
  //   const displayStatus = profile?.status ?? "inactive";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar className="size-16">
            <AvatarImage src={profile?.image ?? undefined} alt={displayName} />
            <AvatarFallback className="text-xl">
              {displayName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-2xl">
              {editing ? (
                <Input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="text-lg"
                  placeholder="Enter name"
                />
              ) : (
                displayName
              )}
            </CardTitle>

            {/* <Badge
              variant={displayStatus === "active" ? "default" : "secondary"}
              className="capitalize mt-1"
            >
              {displayStatus}
            </Badge> */}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Mail className="size-4" />
          <span>{displayEmail}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="size-4" />
          {editing ? (
            <Input
              name="area"
              value={form.area}
              onChange={handleChange}
              placeholder="Enter area"
            />
          ) : (
            <span>{displayArea}</span>
          )}
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <UserCircle className="size-4" />
          {editing ? (
            <Input
              name="gender"
              value={form.gender}
              onChange={handleChange}
              placeholder="Enter gender"
            />
          ) : (
            <span className="capitalize">{displayGender}</span>
          )}
        </div>

        <div className="flex gap-2 pt-4">
          {editing ? (
            <>
              <Button onClick={handleSubmit} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditing(false)}
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button onClick={() => setEditing(true)}>Edit Info</Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
