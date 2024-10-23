"use client";
import React from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const Home = () => {
  const [rollno, setRollno] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  const Submitbro = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true); // Set loading to true

    if (!rollno || !password) {
      setError("Both fields are required.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post("http://127.0.0.1:8000/login/", {
        username: rollno,
        password: password,
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
      setError(error.response.data['error']);
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <>
      <div>
        <h1 className="text-3xl -mb-20 pt-8 bg-gray-100  font-bold text-center text-gray-900">Faculty of Engineering</h1>

        <div className="min-h-screen bg-gray-100 flex flex-col justify-center sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Course Registration Login
            </h2>
          </div>

          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              {/* Error message display */}
              <form className="space-y-6" onSubmit={Submitbro}>
                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Username
                  </label>
                  <div className="mt-1">
                    <input
                      id="username"
                      name="username"
                      type="text"
                      required
                      className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                      placeholder="Enter your username"
                      value={rollno}
                      onChange={(e) => setRollno(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Password
                  </label>
                  <div className="mt-1">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading} // Disable button during loading
                    className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${loading
                        ? "bg-gray-500"
                        : "bg-indigo-600 hover:bg-indigo-700"
                      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                  >
                    {loading ? "Signing in..." : "Sign in"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
