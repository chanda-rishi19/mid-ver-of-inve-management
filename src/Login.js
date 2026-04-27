import React, { useState } from "react";
import API from "./api";

export default function Login({ setToken, switchToSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    try {
      const res = await API.post("/auth/login", { email, password });

      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);

    } catch (err) {
      console.log(err.response);

      if (err.response && err.response.data && err.response.data.error) {
        alert(err.response.data.error); // show real backend error
      } else {
        alert("Server not reachable");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow w-80">

        <h2 className="text-xl mb-4 font-bold">Login</h2>

        <input
          className="border p-2 w-full mb-2"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="border p-2 w-full mb-4"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={login}
          className="bg-blue-500 text-white w-full p-2 mb-2"
        >
          Login
        </button>

        <p className="text-sm text-center">
          New user?{" "}
          <span
            className="text-green-500 cursor-pointer"
            onClick={switchToSignup}
          >
            Signup
          </span>
        </p>

      </div>
    </div>
  );
}