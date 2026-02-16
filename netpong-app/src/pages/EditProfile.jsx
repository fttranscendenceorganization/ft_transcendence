import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function EditProfile() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    useEffect(() => {
        document.title = "Edit Profile - NetPong";


    }, []);

    // This is a user data (some fields here are unchangeable)
    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        username: '',
        profileImage: null
    });


    const [previewImage, setPreviewImage] = useState('/images/avatar.jpg');
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleUsernameChange = (e) => {
        setProfileData(prev => ({
            ...prev,
            username: e.target.value
        }));
    };

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // This section is for Validation of file type
            if (!file.type.startsWith('image/')) {
                alert('Please select a valid image file');
                return;
            }
            // This section is for Validate file size (max 5MB optional you can change it)
            if (file.size > 5 * 1024 * 1024) {
                alert('Image size should be less than 5MB');
                return;
            }
            setProfileData(prev => ({
                ...prev,
                profileImage: file
            }));
            // Create preview
            const reader = new FileReader(); // This is a browser API that reads files
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setProfileData({ ...profileData, profileImage: null });
        setPreviewImage('/images/avatar.jpg');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            setShowSuccess(true);

            // Hide The success message after 3 seconds
            setTimeout(() => {
                setShowSuccess(false);
            }, 3000);
            console.log('Updated profile:', profileData);
        }, 1500);
    };

    const handleCancel = () => {
        navigate('/home');
    };

    return (
        <div className="antialiased bg-[url('/images/user.jpg')] w-full min-h-screen bg-cover bg-center bg-no-repeat bg-fixed text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-slate-900/30 to-slate-900/50 pointer-events-none"></div>

            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-[10%] w-2 h-2 bg-orange-500/40 rounded-full animate-ping"></div>
                <div className="absolute top-40 right-[15%] w-3 h-3 bg-violet-500/30 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute bottom-40 left-[20%] w-2 h-2 bg-white/20 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-60 right-[25%] w-2 h-2 bg-orange-400/30 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }}></div>
            </div>

            {showSuccess && (
                <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
                    <div className="bg-green-600 text-white px-6 py-3 rounded-xl shadow-2xl border-2 border-green-400 flex items-center gap-3">
                        <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                        <span className="font-bold">Profile updated successfully!</span>
                    </div>
                </div>
            )}

            <div className="relative px-4 py-12 md:py-16">
                <div className="max-w-3xl mx-auto">
                    <div className="flex justify-center mb-8">
                        <div className="bg-slate-900/50 backdrop-blur-sm rounded-3xl px-8 md:px-12 py-6 md:py-8 shadow-2xl border border-white/40 hover:border-orange-500/70 transition-all duration-500">
                            <h1 className="font-sans text-3xl md:text-4xl lg:text-5xl text-center">
                                <span className="text-white font-bold">Edit Your </span>
                                <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-red-500 to-orange-400 drop-shadow-[0_0_20px_rgba(249,115,22,0.5)]">
                                    Profile
                                </span>
                            </h1>

                            <div className="flex justify-center mt-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-12 h-1 bg-gradient-to-r from-transparent via-orange-500 to-orange-500 rounded-full"></div>
                                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                    <div className="w-12 h-1 bg-gradient-to-l from-transparent via-orange-500 to-orange-500 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl p-6 md:p-10 shadow-2xl border border-white/30 hover:border-orange-500/50 transition-all duration-500">
                        <form onSubmit={handleSubmit}>
                            <div className="flex flex-col items-center mb-10 pb-8 border-b border-white/10">
                                <div className="relative group">
                                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.4)] group-hover:border-violet-500 group-hover:shadow-[0_0_40px_rgba(139,92,246,0.5)] transition-all duration-300">
                                        <img
                                            src={previewImage}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleImageClick}
                                        className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                    >
                                        <div className="text-center">
                                            <svg className="w-10 h-10 text-white mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                                            </svg>
                                            <span className="text-white text-sm font-bold">Change Photo</span>
                                        </div>
                                    </button>

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={handleImageClick}
                                        className="bg-violet-600 hover:bg-violet-500 text-white px-6 py-2 rounded-lg font-bold text-sm transition-all duration-300 hover:scale-105 shadow-lg"
                                    >
                                        Upload New
                                    </button>
                                    {profileData.profileImage && (
                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
                                            className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-lg font-bold text-sm transition-all duration-300 hover:scale-105 shadow-lg"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                                <p className="text-gray-400 text-xs mt-3">Max size: 5MB • JPG, PNG, GIF</p>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="flex items-center gap-2 text-white font-bold text-sm mb-2">
                                        <svg className="w-4 h-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM12 14a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7Z" />
                                        </svg>
                                        First Name
                                        <span className="ml-auto text-xs text-gray-400 font-normal">(Cannot be changed)</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={profileData.firstName}
                                        disabled
                                        className="w-full bg-slate-700/50 text-gray-400 placeholder-gray-500 rounded-lg px-4 py-3 border-2 border-slate-600/50 cursor-not-allowed text-sm md:text-base"
                                    />
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-white font-bold text-sm mb-2">
                                        <svg className="w-4 h-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                                        </svg>
                                        Last Name
                                        <span className="ml-auto text-xs text-gray-400 font-normal">(Cannot be changed)</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={profileData.lastName}
                                        disabled
                                        className="w-full bg-slate-700/50 text-gray-400 placeholder-gray-500 rounded-lg px-4 py-3 border-2 border-slate-600/50 cursor-not-allowed text-sm md:text-base"
                                    />
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-white font-bold text-sm mb-2">
                                        <svg className="w-4 h-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                                        </svg>
                                        Email Address
                                        <span className="ml-auto text-xs text-gray-400 font-normal">(Cannot be changed)</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={profileData.email}
                                        disabled
                                        className="w-full bg-slate-700/50 text-gray-400 placeholder-gray-500 rounded-lg px-4 py-3 border-2 border-slate-600/50 cursor-not-allowed text-sm md:text-base"
                                    />
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-white font-bold text-sm mb-2">
                                        <svg className="w-4 h-4 text-orange-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                                        </svg>
                                        Username
                                        <span className="ml-auto text-xs text-green-400 font-normal">✓ Editable</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={profileData.username}
                                        onChange={handleUsernameChange}
                                        placeholder="Enter your username"
                                        required
                                        className="w-full bg-slate-700 text-white placeholder-gray-400 rounded-lg px-4 py-3 border-2 border-slate-600 focus:outline-none focus:border-orange-500 transition text-sm md:text-base hover:border-orange-500/50"
                                    />
                                    <p className="text-gray-400 text-xs mt-2">Your unique username for NETPONG</p>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 mt-10 pt-8 border-t border-white/10">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 group relative overflow-hidden bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white py-4 px-8 font-bold rounded-xl shadow-[0_0_30px_rgba(249,115,22,0.4)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_50px_rgba(249,115,22,0.6)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                >
                                    {isLoading ? (
                                        <span className="relative z-10 flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Saving...
                                        </span>
                                    ) : (
                                        <>
                                            <span className="relative z-10">SAVE CHANGES</span>
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                                        </>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    disabled={isLoading}
                                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-4 px-8 font-bold rounded-xl shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    CANCEL
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="mt-6 bg-blue-900/30 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-4 md:p-6">
                        <div className="flex items-start gap-3">
                            <svg className="w-6 h-6 text-blue-400 flex-shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                            </svg>
                            <div>
                                <p className="text-blue-200 text-sm md:text-base leading-relaxed">
                                    <span className="font-bold">Note:</span> Your first name, last name, and email address cannot be changed for security reasons. Only your username and profile picture can be updated.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}