"use client";

import React, {  useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@components/ui/input";
import { Button } from "@components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@components/ui/select";
import { RxCross2 } from "react-icons/rx";
import { createUser, updateUser } from "@services/userService";

interface Props {
  data?: any;
  mode: "Create" | "Edit";
  onClose: () => void;
}

export default function CustomForm({ data, mode, onClose }: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: data?.name || "",
    email: data?.email || "",
    password: "",
    role: data?.role || "employee",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      if (mode === "Edit" && data?._id) {
        const payload: any = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
        };
        if (formData.password) payload.password = formData.password;
        await updateUser(data._id, payload);
        toast.success("User updated successfully!");
      } else {
        await createUser(formData);
        toast.success("User created successfully!");
      }
      router.push("/dashboard/users");
      onClose();
    } catch (err) {
      console.error("User submission error:", err);
      toast.error("Failed to save user.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-blue-600">
          {mode === "Edit" ? "Edit User" : "Create User"}
        </h2>
        <button
          onClick={onClose}
          className="text-gray-200 rounded-full p-1 text-2xl leading-none hover:text-gray-500 cursor-pointer"
        >
          <RxCross2 />
        </button>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Name</label>
            <Input value={formData.name} onChange={(e) => handleChange("name", e.target.value)} required />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Email</label>
            <Input value={formData.email} onChange={(e) => handleChange("email", e.target.value)} required type="email" />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Password</label>
            <Input value={formData.password} onChange={(e) => handleChange("password", e.target.value)} type="password" placeholder={mode === "Edit" ? "Leave blank to keep existing" : ""} />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Role</label>
            <Select value={formData.role} onValueChange={(val) => handleChange("role", val)}>
              <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="salesperson">Salesperson</SelectItem>
                <SelectItem value="employee">Employee</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving..." : mode === "Edit" ? "Update User" : "Create User"}
          </Button>
        </div>
      </form>
    </div>
  );
}