import React from "react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/router";

const SignIn: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const formBody = new URLSearchParams();
        formBody.append('username', email);   // OAuth2PasswordRequestFormではusernameにメールを入れる仕様
        formBody.append('password', password);

        try {
            const response = await fetch('http://localhost:8000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formBody.toString()
            });
            if(!response.ok) {
                const errorData = await response.json();
                setError(errorData.detail || "An error occurred during sign in.");
                return;
            }
            const data = await response.json();
            console.log("Login response data:", data);
            localStorage.setItem('token', data.access_token);
            alert('Sign in successful!');
            setTimeout(() => {
                router.push(`/${data.user_id}/chat/${data.chat_id}`);
            }, 1000);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unknown error occurred.');
            }
        }

    }
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Sign In</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-800 mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="Email"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-800 mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="Password"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded shadow-md hover:shadow-lg hover:bg-gray-800 active:scale-95 transition-all duration-200 ease-in-out"
          >
            Sign In
          </button>
        </form>
        <div>
          <div>
            <p className="mt-4 text-sm text-gray-600 text-center">
              Don't have an account?{" "}
              <Link href="/signup" className="text-gray-500 hover:text-gray-900 hover:underline transition-colors duration-200">
                Sign Up
              </Link>
            </p>
          </div>
          <div>
            <p className="mt-2 text-sm text-gray-600 text-center">
              <Link href="/forgot-password" className="text-gray-500 hover:text-gray-900 hover:underline transition-colors duration-200">
                Forgot Password?
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SignIn;