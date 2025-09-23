"use client";
import { FormEvent, useState } from "react";
import { logInAction } from "@/actions/authActions";
import { useRouter } from "next/navigation";

const LogIn = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const response = await logInAction(formData);
    if (response.status !== "success") {
      setErrorMessage(response.message);
      router.push("/dashboard");
      return;
    }
    setErrorMessage(null);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div
          className={`
            bg-opacity-50 bg-gray-800 rounded-xl shadow-2xl border-2 border-purple-900/30 p-10
            backdrop-blur-sm transition-all duration-500
          `}
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-purple-200 tracking-wide animate-pulse">
              Admin Portal
            </h2>
            <p className="mt-2 text-sm text-gray-400">Enter your credentials</p>
          </div>
          <form
            onSubmit={handleSubmit}
            className="space-y-6"
            autoComplete=""
            autoSave=""
          >
            {/* Username Input */}
            <div className="relative">
              <input
                type="text"
                id="username"
                value={username}
                placeholder="Username"
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                className="w-full px-4 py-3 rounded-lg bg-black/40 text-purple-200 placeholder-purple-300 border-2 border-purple-800/50 focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all duration-300"
                required
                name="username"
                disabled={isLoading}
              />
            </div>
            {/* Password Input */}
            <div className="relative">
              <input
                type="password"
                id="password"
                value={password}
                placeholder="Password"
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                className="w-full px-4 py-3 rounded-lg bg-black/40 text-purple-200 placeholder-purple-300 border-2 border-purple-800/50 focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all duration-300"
                required
                name="password"
                disabled={isLoading}
              />
            </div>
            {errorMessage && (
              <div className="text-red-400 bg-red-900/30 border-2 border-red-700/50 w-full text-center py-2 rounded-lg">
                {errorMessage}
              </div>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-6 bg-purple-800 text-white font-semibold rounded-lg hover:bg-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all duration-300 transform active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-purple-800 disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Logging in...
                </div>
              ) : (
                "Log In"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LogIn;
