"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createLead, updateLead } from "@services/leadService";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from "@components/ui/form";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@components/ui/select";

import { Input } from "@components/ui/input";
import { Button } from "@components/ui/button";
import { RxCross2 } from "react-icons/rx";
import { FormData } from "@customTypes/index";
import RequiredLabel from '@components/ui/RequiredLabel'; // Assuming this is the correct path for RequiredLabel]



interface LeadFormProps {
  initialData?: Partial<FormData> & { _id?: string };
  onClose: () => void;
  mode: 'Create' | 'Edit';
}

const LeadForm: React.FC<LeadFormProps> = ({ initialData, onClose, mode }) => {
  const form = useForm<FormData>({
    defaultValues: {
      name: "",
      phoneNumber: "",
      email: "",
      companyName: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      source: "Website",
      industry: "IT",
      callResponse: "Picked",
      description: "",
      remark: "",
      position: "",
      website: "",
      createdBy: "",
      projects: [], 
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
      
      mode === "Edit" && initialData?._id
        ? updateLead(initialData._id, data)
        : createLead(data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success(`Lead ${mode === "Edit" ? "updated" : "created"} successfully`);
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
          {mode === "Edit" ? "Edit Lead" : "Create Lead"}
        </h2>
        <button
          onClick={onClose}
          className="text-gray-200 rounded-full p-1 text-2xl leading-none hover:text-gray-500 cursor-pointer"
          aria-label="Close"
        >
          <RxCross2 />
        </button>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
          {["name", "phoneNumber", "email", "companyName", "address", "city", "state", "zipCode", "country", "source", "industry", "callResponse", "description", "remark", "position", "website"].map((field) => (
            <FormField
  key={field}
  control={form.control}
  name={field as keyof FormData}
  rules={
    ["name", "phoneNumber", "email", "companyName","city"].includes(field)
      ? { required: `${field.replace(/([A-Z])/g, ' $1')} is required` }
      : undefined
  }
  render={({ field: f }) => (
    <FormItem>
      <RequiredLabel required={["name", "phoneNumber", "email", "companyName","city"].includes(field)}>
        {field.replace(/([A-Z])/g, ' $1')}
      </RequiredLabel>
      <FormControl>
        {(field === "source" || field === "industry" || field === "callResponse") ? (
          <Select
            key={f.value as string}
            value={f.value as string}
            onValueChange={f.onChange}
          >
            <SelectTrigger>
              <SelectValue>{(f.value as string) || `Select ${field}`}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {field === "source" &&
                ["Website", "Referral", "LinkedIn", "Cold Call", "Facebook", "Google", "Instagram", "Twitter", "Advertisement", "Event", "Partnership", "Other"].map(val => (
                  <SelectItem key={val} value={val}>{val}</SelectItem>
                ))}
              {field === "industry" &&
                ["IT", "Retail", "Manufacturing", "Other"].map(val => (
                  <SelectItem key={val} value={val}>{val}</SelectItem>
                ))}
              {field === "callResponse" &&
                ["Picked", "Not Response", "Talk to later"].map(val => (
                  <SelectItem key={val} value={val}>{val}</SelectItem>
                ))}
            </SelectContent>
          </Select>
        ) : (
          <Input type="text" {...f} value={f.value as string} />
        )}
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
          ))}






          <div className="col-span-2 mt-4 flex justify-end gap-3">
            <Button
              type="button"
              onClick={onClose}
              className="bg-gray-100 text-gray-800 hover:bg-gray-200"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Submitting..." : mode === "Edit" ? "Update Lead" : "Create Lead"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default LeadForm;
