"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";

const Activate = () => {
    const router = useRouter();

    const searchParams = useSearchParams();

    const email = searchParams.get("email");

    console.log("Email: ", email);
    const [formData, setFormData] = useState({
        email: email,
        activation_code: "",
    });

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(
                "http://localhost:8000/api/activate",
                {
                    email: formData.email,
                    activation_code: formData.activation_code,
                }
            );

            if (response.status == 200) {
              console.log("entered");
                router.push("/auth/login");
            } else {
                alert("No token received from the server. Please try again.");
            }
        } catch (error) {
            console.error("Error during activation:", error);
            alert(
                error.response?.data?.message ||
                    "Invalid activation code. Please try again."
            );
        }
    };

    return (
        <section className="bg-white">
            <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
                <div className="w-full bg-white rounded-lg shadow dark:border sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
                    <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                        <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                            Activate Account
                        </h1>
                        <form
                            className="space-y-4 md:space-y-6"
                            onSubmit={handleSubmit}
                        >
                            {/* Email Input */}
                            <div>
                                <label
                                    htmlFor="email"
                                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                >
                                    Your email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    id="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    placeholder="name@company.com"
                                    required readOnly
                                />
                            </div>

                            {/* Activation Code Input */}
                            <div>
                                <label
                                    htmlFor="activation_code"
                                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                >
                                    Enter Activation Code
                                </label>
                                <input
                                    type="text"
                                    name="activation_code"
                                    id="activation_code"
                                    value={formData.activation_code}
                                    onChange={handleInputChange}
                                    placeholder="Enter your code"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    required
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                            >
                                Activate your account
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Activate;
