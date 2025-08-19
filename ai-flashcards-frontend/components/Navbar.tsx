"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { FiMenu, FiX, FiUser, FiSettings, FiLogOut, FiHome, FiFileText, FiPlusCircle, FiClock } from "react-icons/fi";
import { FaUserCircle } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { useUser } from '@/context/UserContext';

export default function Navbar() {
    const { user, logout, initialized } = useUser();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);


    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setProfileOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout(); // Uses the context logout function
        toast.success("Logged out successfully");
    };

    // Don't render anything until auth state is initialized
    if (!initialized) {
        return null;
    }

    return (
        <nav className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Left side - Logo and main links */}
                    <div className="flex items-center">
                        <Link href="/" className="text-2xl font-bold tracking-wide flex items-center">
                            <span className="bg-white text-blue-600 px-2 py-1 rounded mr-2">AI</span>
                            <span>Flashcards</span>
                        </Link>

                        <div className="hidden md:block ml-50">
                            <div className="flex space-x-4">
                                <NavLink href="/dashboard" icon={<FiHome className="mr-1" />}>
                                    Dashboard
                                </NavLink>
                                <NavLink href="/flashcards" icon={<FiFileText className="mr-1" />}>
                                    Flashcards
                                </NavLink>
                                <NavLink href="/generate" icon={<FiPlusCircle className="mr-1" />}>
                                    Generate
                                </NavLink>
                                <NavLink href="/history" icon={<FiClock className="mr-1" />}>
                                    History
                                </NavLink>
                            </div>
                        </div>
                    </div>

                    {/* Right side - User profile and mobile menu */}
                    <div className="flex items-center">
                        {user ? (
                            <div className="relative ml-3" ref={profileRef}>
                                <button
                                    onClick={() => setProfileOpen(!profileOpen)}
                                    className="flex items-center space-x-2 focus:outline-none"
                                >
                                    {user.profilePhoto ? (
                                        <img
                                            className="h-8 w-8 rounded-full object-cover"
                                            src={user.profilePhoto}
                                            alt="Profile"
                                        />
                                    ) : (
                                        <FaUserCircle className="h-8 w-8 text-blue-200 hover:text-white" />
                                    )}
                                    <span className="hidden md:inline text-sm font-medium">
                                        {user.firstName}
                                    </span>
                                </button>

                                {profileOpen && (
                                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                                        <div className="px-4 py-2 border-b border-gray-100">
                                            <p className="text-sm text-gray-700">{user.firstName}</p>
                                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                        </div>
                                        <Link
                                            href="/account"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                                            onClick={() => setProfileOpen(false)}
                                        >
                                            <FiUser className="inline mr-2" />
                                            Account
                                        </Link>
                                        <Link
                                            href="/settings"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                                            onClick={() => setProfileOpen(false)}
                                        >
                                            <FiSettings className="inline mr-2" />
                                            Settings
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                                        >
                                            <FiLogOut className="inline mr-2" />
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="hidden md:block">
                                <Link
                                    href="/login"
                                    className="px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-blue-700 hover:bg-opacity-50 transition"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/register"
                                    className="ml-2 px-3 py-2 rounded-md text-sm font-medium bg-white text-blue-600 hover:bg-blue-50 transition"
                                >
                                    Register
                                </Link>
                            </div>
                        )}

                        {/* Mobile menu button */}
                        <div className="md:hidden ml-3">
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-white hover:bg-blue-700 focus:outline-none"
                            >
                                {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isOpen && (
                <div className="md:hidden bg-blue-700 pb-3 px-4">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <MobileNavLink href="/dashboard" icon={<FiHome className="mr-2" />}>
                            Dashboard
                        </MobileNavLink>
                        <MobileNavLink href="/flashcards" icon={<FiFileText className="mr-2" />}>
                            Flashcards
                        </MobileNavLink>
                        <MobileNavLink href="/generate" icon={<FiPlusCircle className="mr-2" />}>
                            Generate
                        </MobileNavLink>
                        <MobileNavLink href="/history" icon={<FiClock className="mr-2" />}>
                            History
                        </MobileNavLink>
                    </div>
                    {user ? (
                        <div className="pt-4 pb-3 border-t border-blue-800">
                            <div className="flex items-center px-5">
                                {user.profilePhoto ? (
                                    <img
                                        className="h-10 w-10 rounded-full"
                                        src={user.profilePhoto}
                                        alt="Profile"
                                    />
                                ) : (
                                    <FaUserCircle className="h-10 w-10 text-blue-200" />
                                )}
                                <div className="ml-3">
                                    <p className="text-base font-medium text-white">{user.firstName}</p>
                                    <p className="text-sm font-medium text-blue-200">{user.email}</p>
                                </div>
                            </div>
                            <div className="mt-3 px-2 space-y-1">
                                <MobileNavLink href="/account" icon={<FiUser className="mr-2" />}>
                                    Account
                                </MobileNavLink>
                                <MobileNavLink href="/settings" icon={<FiSettings className="mr-2" />}>
                                    Settings
                                </MobileNavLink>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center px-3 py-2 rounded-md text-base font-medium text-white hover:bg-blue-600"
                                >
                                    <FiLogOut className="mr-2" />
                                    Logout
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex space-x-4 px-2 pt-4">
                            <Link
                                href="/login"
                                className="w-full px-3 py-2 rounded-md text-center font-medium text-white bg-blue-800 hover:bg-blue-600"
                                onClick={() => setIsOpen(false)}
                            >
                                Login
                            </Link>
                            <Link
                                href="/register"
                                className="w-full px-3 py-2 rounded-md text-center font-medium text-blue-700 bg-white hover:bg-gray-100"
                                onClick={() => setIsOpen(false)}
                            >
                                Register
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
}

// Reusable NavLink component
function NavLink({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <Link
            href={href}
            className="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 hover:bg-opacity-50 transition"
        >
            {icon}
            {children}
        </Link>
    );
}

// Reusable MobileNavLink component
function MobileNavLink({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <Link
            href={href}
            className="flex items-center px-3 py-2 rounded-md text-base font-medium text-white hover:bg-blue-600"
        >
            {icon}
            {children}
        </Link>
    );
}