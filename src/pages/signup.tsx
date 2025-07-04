import React from "react";

const SignUp: React.FC = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Sign up</h2>
                <form>
                    <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-800 mb-2" htmlFor="email">
                        Email
                        </label>
                        <input
                        type="email"
                        id="email"
                        placeholder="Email"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
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
