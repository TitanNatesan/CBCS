"use client";
import React from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Change this import

const Home = () => {
  const [rollno, setRollno] = React.useState("");
  const [password, setPassword] = React.useState("");
  const router = useRouter(); // This should now refer to next/navigation's useRouter
  const [error, setError] = React.useState("");
  const Submitbro = async (e: any) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://192.168.169.143:8000/login/",
        {
          username: rollno,
          password: password,
        }
      );
      console.log(response.data)

      if (response.data['token']&&response.data['user_type']==="Student") {
        localStorage.setItem("token", response.data['token']);
        router.push("/studentdashboard");
      }
      else if (response.data['token']&&response.data['user_type']==="HOD") {
        localStorage.setItem("token", response.data['token']);
        router.push("/admindashboard");
      }
      else {
        setError("Invalid Credentials");
      }
    }
    catch (error) {
      console.error("Error during login:", error);
    }
  };

  return (
    <div>
      <div className="min-h-screen bg-gray-100 flex flex-col justify-center sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Username
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Enter your email address"
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
                  onClick={Submitbro}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Sign in
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
