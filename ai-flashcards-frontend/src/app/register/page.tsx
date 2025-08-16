"use client";

import { ChangeEvent, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FcGoogle } from "react-icons/fc";
import { signIn } from "next-auth/react";
import { toast } from "react-hot-toast";
import Image from "next/image";

// Form validation schema
const registerSchema = z
    .object({
        firstName: z.string().min(2, "First name must be at least 2 characters"),
        lastName: z.string().min(2, "Last name must be at least 2 characters"),
        email: z.string().email("Invalid email address"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        confirmPassword: z.string(),
        nic: z.string().min(10, "NIC must be at least 10 characters"),
        gender: z.enum(["male", "female", "other"]),
        phone: z.string().min(10, "Phone must be at least 10 characters"),
        addressline1: z.string(),
        addressline2: z.string(),
        city: z.string().min(2, "City is required"),
        district: z.string().min(2, "District is required"),
        province: z.string().min(2, "Province is required"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
    const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);


    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
    });

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 2 * 1024 * 1024) {
                toast.error("File size should be less than 2MB");
                return;
            }
            setProfilePhotoFile(file);
            const reader = new FileReader();
            reader.onload = () => {
                setProfilePhoto(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const onSubmit = async (data: RegisterFormValues) => {
        setIsLoading(true);
        try {
            const formData = new FormData();

            // Append all form data
            Object.entries(data).forEach(([key, value]) => {
                formData.append(key, value);
            });

            // Append profile photo if exists
            if (profilePhotoFile) {
                formData.append('profilePhoto', profilePhotoFile);
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/register`, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Registration failed");
            }

            toast.success("Registration successful! Please login.");
            router.push("/login");
        } catch (error: any) {
            toast.error(error.message || "Registration failed");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleRegister = () => {
        // Redirect to backend Google OAuth endpoint
        window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/google`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="w-full max-w-6xl">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="md:flex">
                        <div className="hidden md:block md:w-1/2 bg-blue-600 p-8 flex items-center justify-center">
                            <div className="text-center text-white">
                                <h2 className="text-3xl font-bold mb-4">Join Us Today</h2>
                                <p className="mb-6">
                                    Create an account to access all our features and services.
                                </p>
                                <div className="h-48 bg-blue-500 rounded-lg flex items-center justify-center">
                                    <span className="text-lg">Illustration or Logo</span>
                                </div>
                            </div>
                        </div>
                        <div className="w-full md:w-1/2 p-8">
                            <div className="text-center mb-8">
                                <h1 className="text-3xl font-bold text-gray-900">
                                    Create Account
                                </h1>
                                <p className="mt-2 text-gray-600">
                                    Fill in your details to get started
                                </p>
                            </div>

                            {/* //Profile Photo
                            <div className="h-48 bg-blue-500 rounded-lg flex items-center justify-center">
                                {profilePhoto ? (
                                    <div className="relative w-full h-full rounded-lg overflow-hidden">
                                        <Image
                                            src={profilePhoto}
                                            alt="Profile preview"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                ) : (
                                    <span className="text-lg">Profile Preview</span>
                                )}
                            </div> */}

                            {/* Profile Photo Upload */}
                            <div className="flex justify-center mb-6">
                                <div className="relative group">
                                    <div
                                        className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden cursor-pointer border-2 border-gray-300 hover:border-blue-500 transition-all"
                                        onClick={triggerFileInput}
                                    >
                                        {profilePhoto ? (
                                            <Image
                                                src={profilePhoto}
                                                alt="Profile preview"
                                                width={96}
                                                height={96}
                                                className="object-cover w-full h-full"
                                            />
                                        ) : (
                                            <svg
                                                className="w-12 h-12 text-gray-400"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                                />
                                            </svg>
                                        )}
                                        <div className="absolute inset-0  bg-opacity-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-white text-sm font-medium"></span>
                                        </div>
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                    <p className="text-xs text-gray-500 mt-2 text-center">
                                        Click to upload profile photo (max 2MB)
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label
                                            htmlFor="firstName"
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                            First Name
                                        </label>
                                        <input
                                            id="firstName"
                                            {...register("firstName")}
                                            className={`w-full px-4 py-2 rounded-lg border ${errors.firstName ? "border-red-500" : "border-gray-300"
                                                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                                            placeholder="John"
                                        />
                                        {errors.firstName && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.firstName.message}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="lastName"
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                            Last Name
                                        </label>
                                        <input
                                            id="lastName"
                                            {...register("lastName")}
                                            className={`w-full px-4 py-2 rounded-lg border ${errors.lastName ? "border-red-500" : "border-gray-300"
                                                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                                            placeholder="Doe"
                                        />
                                        {errors.lastName && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.lastName.message}
                                            </p>
                                        )}
                                    </div>
                                </div>

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
                                        className={`w-full px-4 py-2 rounded-lg border ${errors.email ? "border-red-500" : "border-gray-300"
                                            } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                                        placeholder="your@email.com"
                                    />
                                    {errors.email && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.email.message}
                                        </p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label
                                            htmlFor="password"
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                            Password
                                        </label>
                                        <input
                                            id="password"
                                            type="password"
                                            {...register("password")}
                                            className={`w-full px-4 py-2 rounded-lg border ${errors.password ? "border-red-500" : "border-gray-300"
                                                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                                            placeholder="••••••••"
                                        />
                                        {errors.password && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.password.message}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="confirmPassword"
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                            Confirm Password
                                        </label>
                                        <input
                                            id="confirmPassword"
                                            type="password"
                                            {...register("confirmPassword")}
                                            className={`w-full px-4 py-2 rounded-lg border ${errors.confirmPassword
                                                ? "border-red-500"
                                                : "border-gray-300"
                                                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                                            placeholder="••••••••"
                                        />
                                        {errors.confirmPassword && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.confirmPassword.message}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label
                                            htmlFor="nic"
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                            NIC Number
                                        </label>
                                        <input
                                            id="nic"
                                            {...register("nic")}
                                            className={`w-full px-4 py-2 rounded-lg border ${errors.nic ? "border-red-500" : "border-gray-300"
                                                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                                            placeholder="123456789V"
                                        />
                                        {errors.nic && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.nic.message}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="gender"
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                            Gender
                                        </label>
                                        <select
                                            id="gender"
                                            {...register("gender")}
                                            className={`w-full px-4 py-2 rounded-lg border ${errors.gender ? "border-red-500" : "border-gray-300"
                                                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                                        >
                                            <option value="">Select</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                        {errors.gender && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.gender.message}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="phone"
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                            Phone Number
                                        </label>
                                        <input
                                            id="phone"
                                            {...register("phone")}
                                            className={`w-full px-4 py-2 rounded-lg border ${errors.phone ? "border-red-500" : "border-gray-300"
                                                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                                            placeholder="0771234567"
                                        />
                                        {errors.phone && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.phone.message}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* AddressLine */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label
                                            htmlFor="addressline1"
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                            Address Line 1
                                        </label>
                                        <input
                                            id="addressline1"
                                            type="text"
                                            {...register("addressline1")}
                                            className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                                            placeholder="address line 1"
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="addressline2"
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                            Address Line 2
                                        </label>
                                        <input
                                            id="addressline1"
                                            type="text"
                                            {...register("addressline2")}
                                            className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                                            placeholder="address line 2"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label
                                            htmlFor="city"
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                            City
                                        </label>
                                        <input
                                            id="city"
                                            {...register("city")}
                                            className={`w-full px-4 py-2 rounded-lg border ${errors.city ? "border-red-500" : "border-gray-300"
                                                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                                            placeholder="Colombo"
                                        />
                                        {errors.city && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.city.message}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="district"
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                            District
                                        </label>
                                        <input
                                            id="district"
                                            {...register("district")}
                                            className={`w-full px-4 py-2 rounded-lg border ${errors.district ? "border-red-500" : "border-gray-300"
                                                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                                            placeholder="Colombo"
                                        />
                                        {errors.district && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.district.message}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="province"
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                            Province
                                        </label>
                                        <input
                                            id="province"
                                            {...register("province")}
                                            className={`w-full px-4 py-2 rounded-lg border ${errors.province ? "border-red-500" : "border-gray-300"
                                                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                                            placeholder="Western"
                                        />
                                        {errors.province && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.province.message}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        id="terms"
                                        name="terms"
                                        type="checkbox"
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label
                                        htmlFor="terms"
                                        className="ml-2 block text-sm text-gray-700"
                                    >
                                        I agree to the{" "}
                                        <Link
                                            href="/terms"
                                            className="text-blue-600 hover:text-blue-500"
                                        >
                                            Terms and Conditions
                                        </Link>
                                    </label>
                                </div>

                                <div>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isLoading ? "opacity-70 cursor-not-allowed" : ""
                                            }`}
                                    >
                                        {isLoading ? "Registering..." : "Register"}
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
                                            Or register with
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-6 grid grid-cols-1 gap-3">
                                    <button
                                        onClick={handleGoogleRegister}
                                        disabled={isLoading}
                                        className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        <FcGoogle className="h-5 w-5 mr-2" />
                                        Sign up with Google
                                    </button>
                                </div>
                            </div>

                            <div className="mt-6 text-center">
                                <p className="text-sm text-gray-600">
                                    Already have an account?{" "}
                                    <Link
                                        href="/login"
                                        className="font-medium text-blue-600 hover:text-blue-500"
                                    >
                                        Sign in
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}