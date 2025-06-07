// File: src/components/Bills/BillForm.tsx
"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createBill, updateBill } from "@services/billService"; // implement these
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
import { Bill } from "@customTypes/index";

// Zod schemas
const billSchema = z.object({
  description: z.string().min(1, "Description is required."),
  hsnCode: z
    .string()
    .min(1, "HSN Code is required.")
    .regex(/^[0-9]+$/, "HSN Code must be numeric."),
   amount: z.preprocess(
    (val) => {
      if (typeof val === "string") {
        const parsed = parseFloat(val);
        return Number.isNaN(parsed) ? val : parsed;
      }
      return val;
    },
    z
      .number({ invalid_type_error: "Amount must be a number." })
      .positive("Amount must be greater than zero.")
  ),
});

type BillFormData = z.infer<typeof billSchema>;

interface BillFormProps {
  initialData?: Bill;
  mode: "create" | "edit";
  onClose: () => void;
}

const BillForm: React.FC<BillFormProps> = ({ initialData, mode, onClose }) => {
  const isEdit = mode === "edit";
  const queryClient = useQueryClient();

  const form = useForm<BillFormData>({
    resolver: zodResolver(billSchema),
    defaultValues: {
      description: initialData?.description || "",
      hsnCode: initialData?.hsnCode || "",
      amount: initialData?.amount || 0,
    },
  });

  // Reset form when editing and data arrives
  useEffect(() => {
    if (initialData && isEdit) {
      form.reset({
        description: initialData.description,
        hsnCode: initialData.hsnCode,
        amount: initialData.amount,
      });
    }
  }, [initialData, form, isEdit]);

  // Mutation
  const mutation = useMutation({
    mutationFn: async (data: BillFormData) => {
      if (isEdit && initialData?._id) {
        return updateBill(initialData._id, data);
      }
      return createBill(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["bills"]);
      toast.success(`Bill ${isEdit ? "updated" : "created"} successfully`);
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.message || "Something went wrong.");
    },
  });

  const onSubmit = (data: BillFormData) => mutation.mutate(data);

  return (
    <div className="p-4 w-full max-w-md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          {isEdit ? "Edit Bill" : "Create Bill"}
        </h2>
        <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:text-red-500">
          <X className="w-5 h-5" aria-hidden />
        </button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input type="text" placeholder="Item description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* HSN Code */}
          <FormField
            control={form.control}
            name="hsnCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>HSN Code <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input type="text" placeholder="e.g. 9983" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Amount */}
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="0.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isLoading}>
              {mutation.isLoading
                ? isEdit
                  ? "Updating..."
                  : "Creating..."
                : isEdit
                ? "Update Bill"
                : "Create Bill"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default BillForm;
