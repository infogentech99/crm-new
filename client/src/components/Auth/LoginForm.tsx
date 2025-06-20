"use client";
import { useState } from "react";
import { loginUser } from "@services/authService";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { addToken } from "@store/slices/tokenSlice";
import { addUser } from "@store/slices/userSlice";
import { toast } from "sonner";
import AuthCelebration from "@components/Common/AuthCelebration";
import { useMutation } from "@tanstack/react-query";
import { Input } from "@components/ui/input";
import { Button } from "@components/ui/button";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

export default function LoginForm() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [showCelebration, setShowCelebration] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
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
      setShowCelebration(true);
      toast.success("Login successful!");
      router.push("/dashboard");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Login failed. Please try again.");
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    loginMutation.mutate(values);
  };

  return (
    <div
      className="flex min-h-screen items-center justify-between bg-gradient-to-br from-blue-100 to-blue-300"
    >
      <div className="hidden lg:flex flex-col items-center justify-center p-4 w-1/2">
        <img
          src="/assets/img/loginSubImg.png"
          alt="loginSubImg"
          className="max-w-full h-auto"
        />
      </div>
      <div
        className="flex flex-col justify-center p-8 md:p-24 min-h-screen w-full lg:w-1/2 bg-blue-50 rounded-tl-[120px] shadow-lg"
        style={{ maxWidth: "700px" }}
      >
        <div className="text-center mb-10">
          <img
            src="/assets/img/companyLogo.webp"
            alt="Company Logo"
            className="max-h-16 mx-auto"
          />
        </div>

        <h3 className="text-center text-2xl font-bold mb-4 text-blue-600">Sign In</h3>
        <p className="text-center text-gray-600 mb-4">
          Please enter your credentials to log in to your account.
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email address</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="name@example.com"
                      {...field}
                    />
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
                  <div className="relative">
                    <FormControl>
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="******"
                        {...field}
                        className="pr-10"
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? (
                        <EyeOffIcon className="h-4 w-4 text-gray-500" />
                      ) : (
                        <EyeIcon className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending && (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {loginMutation.isPending ? "Logging in…" : "Login"}
            </Button>
          </form>
        </Form>
      </div>
      {showCelebration && (
        <AuthCelebration
          onComplete={() => {
            setShowCelebration(false);
          }}
        />
      )}
    </div>
  );
}
