"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";

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
            setUser(response.data);
            setFormData({
                name: response.data.name,
                email: response.data.email,
                profile_picture: null,
                profile_picture_name: "",
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
            // No need to store the filename separately
            setFormData((prev) => ({
                ...prev,
                profile_picture: file,
            }));

            // Clean up previous preview URL to prevent memory leaks
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

            console.log("Original formData:", {
                name: formData.name,
                email: formData.email,
                profile_picture: formData.profile_picture,
            });

            formDataToSend.append("name", formData.name);
            formDataToSend.append("email", formData.email);

            if (formData.profile_picture) {
                formDataToSend.append(
                    "profile_picture",
                    formData.profile_picture
                );

                console.log("File details:", {
                    name: formData.profile_picture.name,
                    type: formData.profile_picture.type,
                    size: formData.profile_picture.size,
                });
            }

            console.log("formdata", formData);

            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("No token found! Please log in.");
            }

            const response = await axios.put(
                `http://localhost:8000/api/users/profile`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Accept': 'application/json'
                    },
                }
            );
            console.log("response", response);
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
            setShowPasswordForm(false);
            setPasswordData({
                current_password: "",
                new_password: "",
                new_password_confirmation: "",
            });
        } catch (error) {
            console.error("Error updating password:", error);
        }
    };

    const handleLogout = async () => {
        try {
            const response = await axios.post(
                "http://localhost:8000/logout",
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "token"
                        )}`, // Pass token in headers
                    },
                }
            );

            if (response.ok) {
                // Logout success: clear the token
                localStorage.removeItem("token");
                router.push("/auth/login");
            } else {
                // Handle logout error
                console.error("Failed to log out:", response.statusText);
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
                                        <div className="relative w-32 h-32 rounded-full overflow-hidden">
                                            {user?.profile_picture_url ? (
                                                <Image
                                                    src={
                                                        user.profile_picture_url
                                                    }
                                                    alt="Profile"
                                                    layout="fill"
                                                    objectFit="cover"
                                                    className="rounded-full"
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
                                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
                                        >
                                            Change Password
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
                                                <span className="text-sm text-primary-600 hover:text-primary-700">
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
                                        <input
                                            type="password"
                                            name="current_password"
                                            id="current_password"
                                            value={
                                                passwordData.current_password
                                            }
                                            autoComplete="current_password"
                                            onChange={handlePasswordChange}
                                            className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label
                                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                            htmlFor="new_password"
                                        >
                                            New Password
                                        </label>
                                        <input
                                            type="password"
                                            name="new_password"
                                            id="new_password"
                                            value={passwordData.new_password}
                                            autoComplete="new_password"
                                            onChange={handlePasswordChange}
                                            className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label
                                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                            htmlFor="new_password_confirmation"
                                        >
                                            Confirm New Password
                                        </label>
                                        <input
                                            type="password"
                                            name="new_password_confirmation"
                                            id="new_password_confirmation"
                                            value={
                                                passwordData.new_password_confirmation
                                            }
                                            autoComplete="new_password_confirmation"
                                            onChange={handlePasswordChange}
                                            className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                            required
                                        />
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
