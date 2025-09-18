import axiosInstance, { endpoints } from "@/lib/endpoints";
import { useState } from "react";
import { toast } from "sonner";

export default function ChangePasswordForm() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (newPassword !== confirmPassword) {
    setMessage("New password and confirm password do not match");
    return;
  }

  setLoading(true);
  setMessage(null);

  try {
    const res = await axiosInstance.post(endpoints.admin.updatepassword, 
      { oldPassword, newPassword },
      { withCredentials: true } 
    );

    setMessage(res.data.message || "Password updated successfully");
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
  } catch (err: any) {
    console.error(err);
    if (err.response) {
      setMessage(err.response.data?.message || "Failed to update password");
    } else {
      setMessage("Something went wrong");
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      {message && (
        <div
          className={`p-2 rounded-md text-sm ${
            message.includes("success")
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Current Password</label>
        <input
          type="password"
          className="w-full border rounded-md p-2"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">New Password</label>
        <input
          type="password"
          className="w-full border rounded-md p-2"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Confirm New Password</label>
        <input
          type="password"
          className="w-full border rounded-md p-2"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
      >
        {loading ? "Updating..." : "Update Password"}
      </button>
    </form>
  );
}
