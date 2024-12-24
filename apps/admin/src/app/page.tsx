"use client";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { logInAction,secretAction } from "@/actions/authActions";

const LogIn = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [secretCode, setSecretCode] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [stage, setStage] = useState("login");
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (stage === "login") {
      const formData = new FormData(e.currentTarget);
      const response = await logInAction(formData);

      if (response.status !== "success") {
        setErrorMessage(response.message);
        return;
      }

      // Transition to secret code stage
      setStage("secretCode");
      setErrorMessage(null);
    } else if (stage === "secretCode") {
      const response = await secretAction(secretCode);

      if (response.status !== "success") {
        setErrorMessage(response.message);
        return;
      }

      // Successful authentication
      router.push("/dashboard");
    }
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
              {stage === "login" ? "Admin Portal" : "Enter Secret Code"}
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              {stage === "login"
                ? "Enter your credentials"
                : "Additional verification required"}
            </p>
          </div>

          <form
            key={stage}
            onSubmit={handleSubmit}
            className="space-y-6"
            autoComplete=""
            autoSave=""
          >
            {stage === "login" ? (
              <>
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
                  />
                </div>
              </>
            ) : (
              // Secret Code Input
              <div className="relative animate-slide-in">
                <input
                  type="text"
                  id="secretCode"
                  value={secretCode}
                  placeholder="Enter Secret Code"
                  onChange={(e) => {
                    setSecretCode(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  className="w-full px-4 py-3 rounded-lg bg-black/40 text-purple-200 placeholder-purple-300 border-2 border-purple-800/50 focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all duration-300"
                  required
                />
                <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-purple-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              </div>
            )}

            {errorMessage && (
              <div className="text-red-400 bg-red-900/30 border-2 border-red-700/50 w-full text-center py-2 rounded-lg">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 px-6 bg-purple-800 text-white font-semibold rounded-lg hover:bg-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all duration-300 transform active:scale-95 shadow-lg"
            >
              {stage === "login" ? "Next Step" : "Verify"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LogIn;
