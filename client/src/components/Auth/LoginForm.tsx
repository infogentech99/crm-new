"use client";
import { useState } from "react";
import { loginUser } from "@services/authService";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { addToken } from "@store/slices/tokenSlice";
import { addUser } from "@store/slices/userSlice";

import { Button } from "@components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@components/ui/form";
import { Input } from "@components/ui/input";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
// import AuthCelebration from "@components/Common/AuthCelebration"; // Temporarily removed

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

export default function LoginForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const router = useRouter();
  // const [showCelebration, setShowCelebration] = useState(false); // Temporarily removed

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setError("");
    try {
      const data = await loginUser(values);
      const { id, name, email, role } = data.user;
      dispatch(
        addUser({
          id,
          name: name || "",
          email: email || "",
          role: role || "",
        })
      );
      const token = data.token;
      dispatch(addToken(token));
      localStorage.setItem("token", token);
      // setShowCelebration(true); // Temporarily removed
      toast.success("Login successful!");
      router.push("/");
    } catch (err: unknown) {
      const errorMessage = (err instanceof Error) ? err.message : "An unknown error occurred.";
      setError(errorMessage || "Login failed");
      toast.error(errorMessage || "Login failed. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md dark:bg-gray-800 dark:text-gray-200">
        <h2 className="text-2xl font-bold text-center mb-6">Sign In</h2>
        <p className="text-center text-muted-foreground mb-6">
          Please enter your credentials to log in to your account.
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email address</FormLabel>
                  <FormControl>
                    <Input placeholder="name@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="******" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </form>
        </Form>
      </div>
      {/* {showCelebration && (
        <AuthCelebration
          onComplete={() => {
            setShowCelebration(false);
          }}
        />
      )} */}
    </div>
  );
}
