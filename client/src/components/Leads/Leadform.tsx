// File: components/Leads/LeadForm.tsx
"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createLead, updateLead } from "@services/leadService";
import { X } from "lucide-react";
import {
Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from "@components/ui/form";
import { Input } from "@components/ui/input";
import { Button } from "@components/ui/button";
import { Lead } from "@customTypes/index";

const schema = z.object({
  name: z.string().min(2),
  phone: z.string().min(10),
  email: z.string().email(),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  zipCode: z.string(),
  country: z.string(),
  source: z.enum(["LinkedIn", "Website", "Referral", "Cold Call", "Other"]),
  industry: z.enum(["IT", "Retail", "Manufacturing", "Other"]),
  status: z.enum([
    "pending_approval",
    "denied",
    "approved",
    "quotation_submitted",
    "quotation_rejected",
    "quotation_approved",
    "invoice_issued",
    "invoice_accepted",
    "completed",
    "processing_payments",
    "new",
    "contacted",
    "qualified",
    "lost",
  ]),
  callResponse: z.enum(["Picked", "Not Response", "Talk to later"]),
  description: z.string().optional(),
  remark: z.string().optional(),
  position: z.string().optional(),
  website: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface LeadFormProps {
  initialData?: Lead;
  onClose: () => void;
  mode: 'create' | 'edit';
}

const LeadForm: React.FC<LeadFormProps> = ({ initialData, onClose, mode }) => {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      source: "LinkedIn",
      industry: "IT",
      status: "pending_approval",
      callResponse: "Picked",
      description: "",
      remark: "",
      position: "",
      website: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    }
  }, [initialData, form]);

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      mode === "edit" && initialData?._id
        ? updateLead(initialData._id, data)
        : createLead(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success(
        `Lead ${mode === "edit" ? "updated" : "created"} successfully`
      );
      onClose();
    },
    onError: () => {
      toast.error("Something went wrong. Please try again.");
    },
  });

  const onSubmit = (values: FormData) => {
    mutation.mutate(values);
  };

  return (
    <div className="p-3 w-full max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-blue-600">
          {mode === "edit" ? "Edit Lead" : "Create Lead"}
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
          {[
            { name: "name", label: "Client Name" },
            { name: "phone", label: "Phone", type: "tel" },
            { name: "email", label: "Email", type: "email" },
            { name: "address", label: "Address" },
            { name: "city", label: "City" },
            { name: "state", label: "State" },
            { name: "zipCode", label: "Zip Code" },
            { name: "country", label: "Country" },
          
          ].map((f) => (
            <FormField
              key={f.name}
              control={form.control}
              name={f.name as keyof FormData}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {f.label}
                    {["name", "phone", "email"].includes(f.name) && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </FormLabel>
                  <FormControl>
                    <Input type={f.type || "text"} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}

          <FormField
            control={form.control}
            name="source"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Source</FormLabel>
                <FormControl>
                  <select className="w-full border rounded-md px-2 py-1" {...field}>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Website">Website</option>
                    <option value="Referral">Referral</option>
                    <option value="Cold Call">Cold Call</option>
                    <option value="Other">Other</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="industry"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Industry</FormLabel>
                <FormControl>
                  <select className="w-full border rounded-md px-2 py-1" {...field}>
                    <option value="IT">IT</option>
                    <option value="Retail">Retail</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Other">Other</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Status Dropdown */}
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <FormControl>
                  <select
                    className="w-full border rounded-md px-2 py-1"
                    {...field}
                  >
                    <option value="pending_approval">Pending Approval</option>
                    <option value="denied">Denied</option>
                    <option value="approved">Approved</option>
                    <option value="quotation_submitted">
                      Quotation Submitted
                    </option>
                    <option value="quotation_rejected">
                      Quotation Rejected
                    </option>
                    <option value="quotation_approved">
                      Quotation Approved
                    </option>
                    <option value="invoice_issued">Invoice Issued</option>
                    <option value="invoice_accepted">Invoice Accepted</option>
                    <option value="completed">Completed</option>
                    <option value="processing_payments">
                      Processing Payments
                    </option>
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="lost">Lost</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Call Response Dropdown */}
          <FormField
            control={form.control}
            name="callResponse"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Call Response</FormLabel>
                <FormControl>
                  <select
                    className="w-full border rounded-md px-2 py-1"
                    {...field}
                  >
                    <option value="Picked">Picked</option>
                    <option value="Not Response">Not Response</option>
                    <option value="Talk to later">Talk to later</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Description Text Input */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Remark Text Input */}
          <FormField
            control={form.control}
            name="remark"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Remark</FormLabel>
                <FormControl>
                  <Input type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Position (Job Title) Text Input */}
          <FormField
            control={form.control}
            name="position"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Position</FormLabel>
                <FormControl>
                  <Input type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Website Text Input */}
          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website</FormLabel>
                <FormControl>
                  <Input type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="col-span-2 mt-4 flex justify-end gap-3">
            <Button
              type="button"
              onClick={onClose}
              className="bg-gray-100 text-gray-800 hover:bg-gray-200"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Submitting..." : mode === "edit" ? "Update Lead" : "Create Lead"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default LeadForm;
