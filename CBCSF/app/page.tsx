"use client";

import React, { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!username || !password) {
      setError("Both fields are required.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post("http://127.0.0.1:8000/login/", {
        username,
        password,
      });

      if (response.data["token"]) {
        localStorage.setItem("token", response.data["token"]);
        if (response.data["user_type"] === "Student") {
          router.push("/studentdashboard");
        } else {
          router.push("/admindashboard");
        }
      } else {
        setError("Invalid Credentials");
      }
    } catch (error) {
      console.error("Error during login:", error);
      setError(error.response?.data?.["error"] || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-bold text-center text-white mb-8 animate-fade-in">
          Faculty of Engineering
        </h1>
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-center text-gray-700 mb-6 animate-slide-down">
              Course Registration Login
            </h2>
            {error && (
              <p className="text-red-500 text-sm text-center mb-4 animate-shake">
                {error}
              </p>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <input
                  id="username"
                  type="text"
                  required
                  className="w-full px-3 py-2 text-gray-700 border-b-2 border-gray-300 focus:border-blue-500 transition-colors bg-transparent outline-none peer"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <label
                  htmlFor="username"
                  className="absolute left-3 top-2 text-gray-600 transition-all duration-300 peer-focus:-top-6 peer-focus:text-sm peer-focus:text-blue-500 peer-valid:-top-6 peer-valid:text-sm peer-valid:text-blue-500"
                >
                  Username
                </label>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  required
                  className="w-full px-3 py-2 text-gray-700 border-b-2 border-gray-300 focus:border-blue-500 transition-colors bg-transparent outline-none peer"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <label
                  htmlFor="password"
                  className="absolute left-3 top-2 text-gray-600 transition-all duration-300 peer-focus:-top-6 peer-focus:text-sm peer-focus:text-blue-500 peer-valid:-top-6 peer-valid:text-sm peer-valid:text-blue-500"
                >
                  Password
                </label>
              </div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  loading ? "opacity-50 cursor-not-allowed" : "animate-pulse"
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  "Sign in"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideDown {
          from {
            transform: translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          10%,
          30%,
          50%,
          70%,
          90% {
            transform: translateX(-5px);
          }
          20%,
          40%,
          60%,
          80% {
            transform: translateX(5px);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }

        .animate-slide-down {
          animation: slideDown 0.5s ease-out;
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
