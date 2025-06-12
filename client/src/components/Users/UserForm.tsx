// File: src/components/Users/UserForm.tsx
"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createUser, updateUser } from "@services/userService";
import { X } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@components/ui/form";
import { Input } from "@components/ui/input";
import { Button } from "@components/ui/button";
import { User } from "@customTypes/index";

const createSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  role: z.enum(["admin", "salesperson"], {
    errorMap: () => ({ message: "Role must be admin or salesperson." }),
  }),
});

const editSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters.")
    .optional(),
  role: z.enum(["admin", "salesperson"], {
    errorMap: () => ({ message: "Role must be admin or salesperson." }),
  }),
});

type CreateFormData = z.infer<typeof createSchema>;
type EditFormData = z.infer<typeof editSchema>;

interface UserFormProps {
  initialData?: User;
  onClose: () => void;
  mode: "create" | "edit";
}

const UserForm: React.FC<UserFormProps> = ({ initialData, onClose, mode }) => {
  const queryClient = useQueryClient();
  const isEdit = mode === "edit";
  const schema = isEdit ? editSchema : createSchema;

  // Initialize form with either blank (create) or populated (edit)
  const form = useForm<CreateFormData | EditFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      password: "",
      role: (initialData?.role as CreateFormData["role"]) || "admin",
    },
  });

  // If editing, reset to initialData once it arrives
  useEffect(() => {
    if (initialData && isEdit) {
      form.reset({
        name: initialData.name!,
        email: initialData.email!,
        password: "",
        role: (initialData.role as CreateFormData["role"]) || "admin",
      });
    }
  }, [initialData, form, isEdit]);

  // Submit handler uses createUser or updateUser accordingly
  const mutation = useMutation({
    mutationFn: async (data: CreateFormData | EditFormData) => {
      if (isEdit && initialData?._id) {
        // Only send changed fields; include password if provided
        const payload: any = {
          name: data.name,
          email: data.email,
          role: data.role,
        };
        if ((data as EditFormData).password) {
          payload.password = (data as EditFormData).password;
        }
        return updateUser(initialData._id, payload);
      } else {
        // create mode
        return createUser({
          name: (data as CreateFormData).name,
          email: (data as CreateFormData).email,
          password: (data as CreateFormData).password,
          role: (data as CreateFormData).role,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(`User ${isEdit ? "updated" : "created"} successfully`);
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.message || "Something went wrong. Please try again.");
    },
  });

  const onSubmit = (values: CreateFormData | EditFormData) => {
    mutation.mutate(values);
  };

  return (
    <div className="p-3 w-full max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-blue-600">
          {isEdit ? "Edit User" : "Create User"}
        </h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-red-500 rounded-full p-1"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          {/* Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Name <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Email <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password (required for create, optional for edit) */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {isEdit ? "New Password (optional)" : "Password"}{" "}
                  {!isEdit && <span className="text-red-500">*</span>}
                </FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder={isEdit ? "Leave blank to keep existing" : ""}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Role */}
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Role <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="w-full border rounded-md px-2 py-1"
                  >
                    <option value="admin">Admin</option>
                    <option value="salesperson">Salesperson</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              className="bg-gray-100 text-gray-800 hover:bg-gray-200"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending
                ? isEdit
                  ? "Updating..."
                  : "Creating..."
                : isEdit
                ? "Update User"
                : "Create User"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default UserForm;
