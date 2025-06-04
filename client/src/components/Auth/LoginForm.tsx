"use client";
import { useState } from "react";
import { loginUser } from "@services/authService";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { addToken } from "@store/slices/tokenSlice";
import { addUser } from "@store/slices/userSlice";
import { toast } from "sonner";
import AuthCelebration from "@components/Common/AuthCelebration";

export default function LoginForm() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();
  const [showCelebration, setShowCelebration] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const data = await loginUser(form);
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
    } catch (err: unknown) {
      setError((err as Error).message || "Login failed");
      toast.error((err as Error).message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="flex min-h-screen items-center  justify-between bg-gradient-to-br from-blue-100 to-blue-300"
    >
      <div className="hidden lg:flex flex-col items-center justify-center p-4 w-1/2">
        <img
          src="/assets/img/loginSubImg.png"
          alt="loginSubImg"
          className="max-w-full h-auto"
        />
      </div>
      <div
        className="flex flex-col justify-center p-8 md:p-24 min-h-screen w-full lg:w-1/2 bg-white rounded-tl-[120px] shadow-lg"
        style={{
          maxWidth: "700px",
          backgroundColor: "#d9f5ff", // Keeping original color for now, can convert to Tailwind later
        }}
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

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
            <input
              type="email"
              id="email"
              name="email"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="name@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="******"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={isLoading}
          >
            {isLoading && (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {isLoading ? "Logging in…" : "Login"}
          </button>
        </form>
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
