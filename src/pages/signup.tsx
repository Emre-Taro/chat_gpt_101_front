import React from "react";
import { useState } from "react";
import { useRouter } from "next/router";

const SignUp: React.FC = () => {
        const [email, setEmail] = useState('');
        const [password, setPassword] = useState('');
        const [error, setError] = useState('');
        const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        const formBody = new URLSearchParams();
        formBody.append('username', email);   // OAuth2PasswordRequestFormではusernameにメールを入れる仕様
        formBody.append('password', password);

        try {
            const response = await fetch('http://localhost:8000/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: email,
                    email,
                    password
                })
            });
            if(!response.ok) {
                const errorData = await response.json();
                setError(errorData.detail || "An error occurred during sign up.");
                return;
            }
            const data = await response.json();
            console.log("Sign up response data:", data);
            localStorage.setItem('token', data.access_token);
            alert('Sign up successful!');
            setTimeout(() => {
                router.push(`/signin`);
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
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Sign up</h2>
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
                        Sign Up
                    </button>
                </form>
            </div>
    </div>

    )
};

export default SignUp;
