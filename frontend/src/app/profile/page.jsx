'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';


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
    name: '',
    email: '',
    profile_picture: null
  });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setUser(response.data);
      setFormData({
        name: response.data.name,
        email: response.data.email,
        profile_picture: null,
        profile_picture_name: ""
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
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // No need to store the filename separately
      setFormData(prev => ({
        ...prev,
        profile_picture: file
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

    // Debug what's in formData
    console.log("Original formData:", {
      name: formData.name,
      email: formData.email,
      profile_picture: formData.profile_picture
    });

    formDataToSend.set("name", formData.name);
    formDataToSend.set("email", formData.email);

    if (formData.profile_picture) {
      formDataToSend.append("profile_picture", formData.profile_picture);
      
      // Debug the file object
      console.log("File details:", {
        name: formData.profile_picture.name,
        type: formData.profile_picture.type,
        size: formData.profile_picture.size
      });
    }

console.log("data",formDataToSend)

const token = localStorage.getItem("token"); 
    if (!token) {
      throw new Error("No token found! Please log in.");
    }
console.log("i HA", token)
    const response = await axios.put(
      `http://localhost:8000/api/users/profile`,
      formDataToSend,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      })
    // ...rest of your code
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
      [e.target.name]: e.target.value
    });
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:8000/api/users/password`,
        passwordData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        }
      );
      setShowPasswordForm(false);
      setPasswordData({
        current_password: '',
        new_password: '',
        new_password_confirmation: ''
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
            
          Authorization: `Bearer ${localStorage.getItem("token")}`,// Pass token in headers
          },
        }
      );

      if (response.ok) {
        // Logout success: clear the token
        localStorage.removeItem("token");
      router.push('/auth/login');
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
    <div className="container mx-auto px-4 py-8" bg-white>
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Profile Information</h2>
        </div>

        <div className="p-6">
          {!isEditing && !showPasswordForm ? (
            <div className="space-y-6">
              <div className="flex justify-center mb-6">
                <div className="relative w-32 h-32 rounded-full overflow-hidden">
                  {user?.profile_picture_url ? (
                    <Image 
                      src={user.profile_picture_url} 
                      alt="Profile"
                      layout="fill"
                      objectFit="cover"
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-black text-4xl">👤</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-b border-gray-200 pb-4">
                <p className="text-sm text-black">Email</p>
                <p className="font-medium text-gray-800">{user?.email}</p>
              </div>
              
              <div className="border-b border-gray-200 pb-4">
                <p className="text-sm text-black">Name</p>
                <p className="font-medium text-gray-800">{user?.name}</p>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  Update Profile
                </button>
                <button
                  onClick={() => setShowPasswordForm(true)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  Change Password
                </button>
                <button
        onClick={handleLogout}
        className="logout-button bg-red-500 text-white px-4 py-2 rounded mt-4"
      >
        Log Out
      </button>
              </div>
            </div>
          ) : isEditing ? (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="flex justify-center mb-6">
                <div className="relative w-32 h-32">
                  {(imagePreview || user?.profile_picture_url) && (
                    <Image 
                      src={imagePreview || user.profile_picture_url}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  required
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setImagePreview(null);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                name="current_password"
                value={passwordData.current_password}
                onChange={handlePasswordChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                name="new_password"
                value={passwordData.new_password}
                onChange={handlePasswordChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                name="new_password_confirmation"
                value={passwordData.new_password_confirmation}
                onChange={handlePasswordChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                required
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Update Password
              </button>
              <button
                type="button"
                onClick={() => setShowPasswordForm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;