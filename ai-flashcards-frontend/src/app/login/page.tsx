"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FcGoogle } from "react-icons/fc";
import { signIn } from "next-auth/react";
import { toast } from "react-hot-toast";
import { EyeIcon } from "@heroicons/react/16/solid";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useUser } from "@/context/UserContext";

// Form validation schema
const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const { setUser } = useUser();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormValues) => {
        setIsLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Login failed");
            }

            if (result.token && result.user) {
                localStorage.setItem("authToken", result.token);
                localStorage.setItem("userId", result.user._id);
                setUser(result.user); // Update context
                toast.success("Login successful!");
                router.push("/dashboard");
            }
        } catch (error: any) {
            toast.error(error.message || "Login failed");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        setIsLoading(true);

        // Store current path for redirect after login
        sessionStorage.setItem('preAuthPath', window.location.pathname);

        const popup = window.open(
            '',
            'google-auth-popup',
            'width=500,height=600,left=100,top=100'
        );

        if (!popup) {
            toast.error("Please allow popups to continue with Google");
            setIsLoading(false);
            return;
        }

        // Set the URL after opening to avoid popup blockers
        popup.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/google`;

        const handleMessage = (event: MessageEvent) => {
            // Verify origin and message type
            if (event.origin !== process.env.NEXT_PUBLIC_BACKEND_URL) return;

            setIsLoading(false);

            if (event.data.type === 'google-auth-success') {
                // 1. Store the token
                localStorage.setItem('authToken', event.data.token);
                localStorage.setItem('userId', event.data.user._id);


                // 2. Update user state
                setUser(event.data.user);

                // 3. Redirect to stored path or dashboard
                const redirectPath = '/dashboard';
                sessionStorage.removeItem('preAuthPath');
                router.push(redirectPath);

                toast.success("Login successful!");
            } else if (event.data.type === 'google-auth-error') {
                toast.error(event.data.error || "Google login failed");
            }

            window.removeEventListener('message', handleMessage);
        };

        const checkPopup = setInterval(() => {
            if (popup.closed) {
                clearInterval(checkPopup);
                window.removeEventListener('message', handleMessage);
                setIsLoading(false);
            }
        }, 500);

        window.addEventListener('message', handleMessage);

        return () => {
            clearInterval(checkPopup);
            window.removeEventListener('message', handleMessage);
        };
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="p-8">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
                            <p className="mt-2 text-gray-600">
                                Sign in to access your account
                            </p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    {...register("email")}
                                    className={`w-full px-4 py-3 rounded-lg border ${errors.email ? "border-red-500" : "border-gray-300"
                                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                                    placeholder="your@email.com"
                                />
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>

                            <div className="mb-4">
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Password
                                    <span className="text-red-500">*</span>
                                </label>

                                <div className="relative rounded-md shadow-sm">
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        {...register("password")}
                                        className={`block w-full rounded-md border-0 py-2.5 px-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6 ${errors.password ? "ring-red-500 focus:ring-red-500" : ""
                                            }`}
                                        placeholder="••••••••"
                                        aria-invalid={errors.password ? "true" : "false"}
                                        aria-describedby="password-error"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500 transition-colors duration-200"
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                        aria-pressed={showPassword}
                                    >
                                        {showPassword ? (
                                            <FiEyeOff className="h-5 w-5" aria-hidden="true" />
                                        ) : (
                                            <FiEye className="h-5 w-5" aria-hidden="true" />
                                        )}
                                    </button>
                                </div>

                                {errors.password && (
                                    <p
                                        className="mt-2 text-sm text-red-600"
                                        id="password-error"
                                    >
                                        <span role="alert">{errors.password.message}</span>
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input
                                        id="remember-me"
                                        name="remember-me"
                                        type="checkbox"
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label
                                        htmlFor="remember-me"
                                        className="ml-2 block text-sm text-gray-700"
                                    >
                                        Remember me
                                    </label>
                                </div>

                                <div className="text-sm">
                                    <Link
                                        href="/forgot-password"
                                        className="font-medium text-blue-600 hover:text-blue-500"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isLoading ? "opacity-70 cursor-not-allowed" : ""
                                        }`}
                                >
                                    {isLoading ? "Signing in..." : "Sign in"}
                                </button>
                            </div>
                        </form>

                        <div className="mt-6">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-gray-500">
                                        Or continue with
                                    </span>
                                </div>
                            </div>

                            <div className="mt-6 grid grid-cols-1 gap-3">
                                <button
                                    onClick={handleGoogleLogin}
                                    disabled={isLoading}
                                    className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    <FcGoogle className="h-5 w-5 mr-2" />
                                    Sign in with Google
                                </button>
                            </div>
                        </div>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-600">
                                Don't have an account?{" "}
                                <Link
                                    href="/register"
                                    className="font-medium text-blue-600 hover:text-blue-500"
                                >
                                    Sign up
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}