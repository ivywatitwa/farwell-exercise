"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const userId = searchParams.get("id");
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        profile_picture: null,
    });
    const [passwordData, setPasswordData] = useState({
        current_password: "",
        new_password: "",
        new_password_confirmation: "",
    });
    const [isVisible, setIsVisible] = useState(false);

    const toggleVisibility = () => {
        setIsVisible((prev) => !prev);
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await axios.get(
                `http://localhost:8000/api/users/${userId}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "token"
                        )}`,
                    },
                }
            );

            setUser({
                ...response.data,
                profile_picture_url: response.data.profile_picture
                    ? `http://localhost:8000/storage/${response.data.profile_picture}`
                    : "",
            });

            setFormData({
                name: response.data.name,
                email: response.data.email,
                profile_picture: null,
            });
        } catch (error) {
            console.error("Error fetching profile:", error);
            router.push("/auth/login");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData((prev) => ({
                ...prev,
                profile_picture: file,
            }));

            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();

        try {
            let formDataToSend = new FormData();

            formDataToSend.append("_method", "PUT");
            formDataToSend.append("name", formData.name);
            formDataToSend.append("email", formData.email);

            if (formData.profile_picture instanceof File) {
                formDataToSend.append(
                    "profile_picture",
                    formData.profile_picture
                );
            }

            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("No token found! Please log in.");
            }

            for (let [key, value] of formDataToSend.entries()) {
                console.log(`FormData -> ${key}:`, value);
            }

            const response = await axios.post(
                `http://localhost:8000/api/users/profile`,
                formDataToSend,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    withCredentials: true,
                }
            );
            if (response.data) {
                setUser({
                    ...response.data,
                    profile_picture_url: response.data.profile_picture
                        ? `http://localhost:8000/storage/${response.data.profile_picture}`
                        : "",
                });
                setIsEditing(false);
            }
        } catch (error) {
            console.error("Full error:", error);
            console.error("Response data:", error.response?.data);
            console.error("Response status:", error.response?.status);
            alert("Failed to update profile. Please try again.");
        }
    };

    const handlePasswordChange = (e) => {
        setPasswordData({
            ...passwordData,
            [e.target.name]: e.target.value,
        });
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        try {
            await axios.put(
                `http://localhost:8000/api/users/password`,
                passwordData,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "token"
                        )}`,
                    },
                }
            );

            alert("Password updated successfully!");
            localStorage.removeItem("token");
            router.push("auth/login");
        } catch (error) {
            if (
                error.response &&
                error.response.data &&
                error.response.data.message
            ) {
                alert(error.response.data.message);
            } else {
                alert("An unexpected error occurred. Please try again.");
            }
            console.error("Error updating password:", error);
        }
    };

    const handleLogout = async () => {
        try {
            const response = await axios.post(
                "http://localhost:8000/api/logout",
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "token"
                        )}`,
                    },
                }
            );

            if (response.data.success) {
                localStorage.removeItem("token");
                router.push("/auth/login");
            } else {
                console.error("Failed to log out:", response.message);
            }
        } catch (error) {
            console.error("Error during logout:", error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <section className="bg-white">
            <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
                <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
                    <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                        <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                            Profile Information
                        </h1>
                        <div>
                            {!isEditing && !showPasswordForm ? (
                                <div className="space-y-4">
                                    <div className="flex justify-center mb-6">
                                        <div className="relative w-32 h-32 rounded overflow-hidden">
                                            {user?.profile_picture_url ? (
                                                <Image
                                                    src={
                                                        user.profile_picture_url
                                                    }
                                                    alt="Profile"
                                                    width={120}
                                                    height={148}
                                                    className="rounded"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                                    <span className="text-black text-4xl">
                                                        👤
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="border-b border-gray-200 pb-4">
                                        <p className="text-sm text-white">
                                            Email
                                        </p>
                                        <p className="font-medium text-white">
                                            {user?.email}
                                        </p>
                                    </div>
                                    <div className="border-b border-gray-200 pb-4">
                                        <p className="text-sm text-white">
                                            Name
                                        </p>
                                        <p className="font-medium text-white">
                                            {user?.name}
                                        </p>
                                    </div>
                                    <div className="flex gap-4 pt-4">
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
                                        >
                                            Update Profile
                                        </button>
                                        <button
                                            onClick={() =>
                                                setShowPasswordForm(true)
                                            }
                                            className="px-4 py-2 border border-gray-300 text-gray-400 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
                                        >
                                            Change Password
                                        </button>{" "}
                                        <button className="px-4 py-2 border border-gray-300 text-white rounded-lg hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors">
                                            <Link href="/fileUpload">
                                                Upload CSV
                                            </Link>
                                        </button>
                                        <button
                                            onClick={handleLogout}
                                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                                        >
                                            Log Out
                                        </button>
                                    </div>
                                </div>
                            ) : isEditing ? (
                                <form
                                    onSubmit={handleUpdateProfile}
                                    className="space-y-4"
                                >
                                    <div className="flex justify-center mb-6">
                                        <div className="relative w-32 h-32">
                                            {(imagePreview ||
                                                user?.profile_picture_url) && (
                                                <Image
                                                    src={
                                                        imagePreview ||
                                                        user.profile_picture_url
                                                    }
                                                    alt="Profile Preview"
                                                    layout="fill"
                                                    objectFit="cover"
                                                    className="rounded-full"
                                                />
                                            )}
                                            <label className="block mt-4 text-center cursor-pointer">
                                                <span className="text-sm text-blue-600 hover:text-blue-700">
                                                    Change Photo
                                                </span>
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                />
                                            </label>
                                        </div>
                                    </div>
                                    <div>
                                        <label
                                            className="block mb-2 text-sm font-medium text-white dark:text-white text-white"
                                            htmlFor="name"
                                        >
                                            Name
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            id="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className="bg-gray-50 border border-gray-300 text-white rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label
                                            className="block mb-2 text-sm font-medium text-white dark:text-white"
                                            htmlFor="email"
                                        >
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            id="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="bg-gray-50 border border-gray-300 text-white rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                            required
                                        />
                                    </div>
                                    <div className="flex gap-4 pt-4">
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
                                        >
                                            Save Changes
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsEditing(false);
                                                setImagePreview(null);
                                            }}
                                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <form
                                    onSubmit={handleUpdatePassword}
                                    className="space-y-4"
                                >
                                    <div>
                                        <label
                                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                            htmlFor="current_password"
                                        >
                                            Current Password
                                        </label>
                                        <div className="relative w-full">
                                            <input
                                                type={
                                                    isVisible
                                                        ? "text"
                                                        : "password"
                                                }
                                                name="current_password"
                                                id="current_password"
                                                value={
                                                    passwordData.current_password
                                                }
                                                autoComplete="current_password"
                                                onChange={handlePasswordChange}
                                                className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                                required
                                            />{" "}
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setIsVisible(!isVisible)
                                                }
                                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
                                            >
                                                {isVisible ? (
                                                    <EyeOff className="h-5 w-5" />
                                                ) : (
                                                    <Eye className="h-5 w-5" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label
                                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                            htmlFor="new_password"
                                        >
                                            New Password
                                        </label>
                                        <div className="relative w-full">
                                            <input
                                                type={
                                                    isVisible
                                                        ? "text"
                                                        : "password"
                                                }
                                                name="new_password"
                                                id="new_password"
                                                value={
                                                    passwordData.new_password
                                                }
                                                autoComplete="new_password"
                                                onChange={handlePasswordChange}
                                                className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                                required
                                            />{" "}
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setIsVisible(!isVisible)
                                                }
                                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
                                            >
                                                {isVisible ? (
                                                    <EyeOff className="h-5 w-5" />
                                                ) : (
                                                    <Eye className="h-5 w-5" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label
                                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                            htmlFor="new_password_confirmation"
                                        >
                                            Confirm New Password
                                        </label>
                                        <div className="relative w-full">
                                            <input
                                                type={
                                                    isVisible
                                                        ? "text"
                                                        : "password"
                                                }
                                                name="new_password_confirmation"
                                                id="new_password_confirmation"
                                                value={
                                                    passwordData.new_password_confirmation
                                                }
                                                autoComplete="new_password_confirmation"
                                                onChange={handlePasswordChange}
                                                className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                                required
                                            />{" "}
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setIsVisible(!isVisible)
                                                }
                                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
                                            >
                                                {isVisible ? (
                                                    <EyeOff className="h-5 w-5" />
                                                ) : (
                                                    <Eye className="h-5 w-5" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 pt-4">
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
                                        >
                                            Update Password
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPasswordForm(false)
                                            }
                                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Profile;
