import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authFetch } from '../utils/api';

function AvatarModal({ isOpen, onClose, onUploadFile, onSubmitUrl }) {
    const [tab, setTab] = useState('upload');
    const [urlValue, setUrlValue] = useState('');
    const [urlError, setUrlError] = useState('');
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);

    if (!isOpen) return null;

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) validateAndSubmitFile(file);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragActive(false);
        const file = e.dataTransfer.files[0];
        if (file) validateAndSubmitFile(file);
    };

    const validateAndSubmitFile = (file) => {
        if (!file.type.startsWith('image/')) {
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            return;
        }
        onUploadFile(file);
        onClose();
    };

    const handleUrlSubmit = () => {
        setUrlError('');
        if (!urlValue.trim()) {
            setUrlError('Please enter a URL');
            return;
        }
        try {
            new URL(urlValue.trim());
        } catch {
            setUrlError('Please enter a valid URL');
            return;
        }
        onSubmitUrl(urlValue.trim());
        setUrlValue('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <div
                className="relative bg-slate-900 border border-white/20 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">Change Avatar</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors p-1"
                    >
                        <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setTab('upload')}
                        className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-sm transition-all duration-300 ${tab === 'upload'
                            ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30'
                            : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                            }`}
                    >
                        <span className="flex items-center justify-center gap-2">
                            <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                            </svg>
                            Upload File
                        </span>
                    </button>
                    <button
                        onClick={() => setTab('url')}
                        className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-sm transition-all duration-300 ${tab === 'url'
                            ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
                            : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                            }`}
                    >
                        <span className="flex items-center justify-center gap-2">
                            <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
                            </svg>
                            Image URL
                        </span>
                    </button>
                </div>

                {tab === 'upload' && (
                    <div>
                        <div
                            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer ${dragActive
                                ? 'border-orange-500 bg-orange-500/10'
                                : 'border-slate-600 hover:border-orange-500/50 hover:bg-slate-800/50'
                                }`}
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                            onDragLeave={() => setDragActive(false)}
                            onDrop={handleDrop}
                        >
                            <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                            </svg>
                            <p className="text-white font-bold mb-1">Click or drag & drop</p>
                            <p className="text-gray-400 text-sm">JPG, PNG, GIF — Max 5MB</p>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                    </div>
                )}

                {tab === 'url' && (
                    <div>
                        <label className="block text-sm font-bold text-gray-300 mb-2">Image URL</label>
                        <input
                            type="url"
                            value={urlValue}
                            onChange={(e) => { setUrlValue(e.target.value); setUrlError(''); }}
                            placeholder="https://example.com/avatar.webp"
                            className="w-full bg-slate-700 text-white placeholder-gray-500 rounded-lg px-4 py-3 border-2 border-slate-600 focus:outline-none focus:border-violet-500 transition text-sm"
                        />
                        {urlError && (
                            <p className="text-red-400 text-xs mt-2">{urlError}</p>
                        )}
                        <button
                            onClick={handleUrlSubmit}
                            className="w-full mt-4 bg-violet-600 hover:bg-violet-500 text-white py-3 rounded-lg font-bold text-sm transition-all duration-300 hover:scale-[1.02] shadow-lg"
                        >
                            Use This URL
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}


export default function EditProfile() {
    const navigate = useNavigate();

    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        username: '',
        profileImage: null,
        avatarUrl: '',
    });

    const [previewImage, setPreviewImage] = useState('/images/avatar.webp');
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [showSuccess, setShowSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [showAvatarModal, setShowAvatarModal] = useState(false);

    useEffect(() => {
        document.title = 'Edit Profile - NetPong';

        (async () => {
            try {
                const res = await authFetch('/api/auth/me', { method: 'GET' });
                if (!res.ok) {
                    navigate('/login');
                    return;
                }
                const data = await res.json();

                setProfileData({
                    firstName: data.firstName ?? '',
                    lastName: data.lastName ?? '',
                    email: data.email ?? '',
                    username: data.username ?? '',
                    profileImage: null,
                    avatarUrl: '',
                });

                if (data.avatarUrl) {
                    setPreviewImage(data.avatarUrl);
                }
            } catch (err) {
                console.error('Failed to load profile', err);
                navigate('/login');
            } finally {
                setIsFetching(false);
            }
        })();
    }, [navigate]);


    const handleUsernameChange = (e) => setProfileData(prev => ({ ...prev, username: e.target.value }));
    const handleFirstNameChange = (e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }));
    const handleLastNameChange = (e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }));

    const handleAvatarUploadFile = (file) => {
        setProfileData(prev => ({ ...prev, profileImage: file, avatarUrl: '' }));
        const reader = new FileReader();
        reader.onloadend = () => setPreviewImage(reader.result);
        reader.readAsDataURL(file);
        setErrorMsg('');
    };

    const handleAvatarUrl = (url) => {
        setProfileData(prev => ({ ...prev, avatarUrl: url, profileImage: null }));
        setPreviewImage(url);
        setErrorMsg('');
    };

    const handleRemoveImage = () => {
        setProfileData(prev => ({ ...prev, profileImage: null, avatarUrl: '' }));
        setPreviewImage('/images/avatar.webp');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg('');

        try {
            const formData = new FormData();
            formData.append('firstName', profileData.firstName);
            formData.append('lastName', profileData.lastName);
            formData.append('username', profileData.username);

            if (profileData.profileImage) {
                formData.append('avatar', profileData.profileImage);
            } else if (profileData.avatarUrl) {
                formData.append('avatarUrl', profileData.avatarUrl);
            }

            const res = await authFetch('/api/auth/profile', {
                method: 'PATCH',
                body: formData,
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                setErrorMsg(err.message ?? 'Failed to update profile. Please try again.');
                return;
            }

            const updated = await res.json();

            if (updated.avatarUrl) {
                setPreviewImage(updated.avatarUrl);
            }

            setProfileData(prev => ({
                ...prev,
                firstName: updated.firstName ?? prev.firstName,
                lastName: updated.lastName ?? prev.lastName,
                username: updated.username ?? prev.username,
                profileImage: null,
                avatarUrl: '',
            }));

            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (err) {
            console.error('Submit error', err);
            setErrorMsg('Network error. Please check your connection.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => navigate('/home');

    if (isFetching) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-white text-xl animate-pulse">Loading Profile...</div>
            </div>
        );
    }

    return (
        <div className="antialiased bg-[url('/images/user.webp')] w-full min-h-screen bg-cover bg-center bg-no-repeat bg-fixed text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-slate-900/30 to-slate-900/50 pointer-events-none" />

            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-[10%] w-2 h-2 bg-orange-500/40 rounded-full animate-ping" />
                <div className="absolute top-40 right-[15%] w-3 h-3 bg-violet-500/30 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute bottom-40 left-[20%] w-2 h-2 bg-white/20 rounded-full animate-ping" style={{ animationDelay: '2s' }} />
                <div className="absolute top-60 right-[25%] w-2 h-2 bg-orange-400/30 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }} />
            </div>

            {showSuccess && (
                <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50">
                    <div className="bg-green-600 text-white px-6 py-3 rounded-xl shadow-2xl border-2 border-green-400 flex items-center gap-3">
                        <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                        <span className="font-bold">Profile updated successfully!</span>
                    </div>
                </div>
            )}

            <AvatarModal
                isOpen={showAvatarModal}
                onClose={() => setShowAvatarModal(false)}
                onUploadFile={handleAvatarUploadFile}
                onSubmitUrl={handleAvatarUrl}
            />

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
                                    <div className="w-12 h-1 bg-gradient-to-r from-transparent via-orange-500 to-orange-500 rounded-full" />
                                    <div className="w-2 h-2 bg-orange-500 rounded-full" />
                                    <div className="w-12 h-1 bg-gradient-to-l from-transparent via-orange-500 to-orange-500 rounded-full" />
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
                                            onError={(e) => { e.currentTarget.src = '/images/avatar.webp'; }}
                                        />
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setShowAvatarModal(true)}
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
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowAvatarModal(true)}
                                        className="bg-violet-600 hover:bg-violet-500 text-white px-6 py-2 rounded-lg font-bold text-sm transition-all duration-300 hover:scale-105 shadow-lg"
                                    >
                                        Change Avatar
                                    </button>
                                    {(profileData.profileImage || profileData.avatarUrl || (previewImage && previewImage !== '/images/avatar.webp')) && (
                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
                                            className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-lg font-bold text-sm transition-all duration-300 hover:scale-105 shadow-lg"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                                <p className="text-gray-400 text-xs mt-3">Upload a file or paste an image URL</p>
                            </div>

                            {errorMsg && (
                                <div className="mb-6 bg-red-900/40 border border-red-500/50 text-red-300 rounded-xl px-4 py-3 text-sm font-semibold flex items-center gap-2">
                                    <svg className="w-5 h-5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                                    </svg>
                                    {errorMsg}
                                </div>
                            )}

                            <div className="space-y-6">

                                <div>
                                    <label
                                        htmlFor="firstName"
                                        className="flex items-center gap-2 text-white font-bold text-sm mb-2">
                                        <svg className="w-4 h-4 text-orange-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                                        </svg>
                                        First Name
                                        <span className="ml-auto text-xs text-green-400 font-normal">✓ Editable</span>
                                    </label>
                                    <input
                                        id="firstName"
                                        name="firstName"
                                        type="text"
                                        autoComplete="given-name"
                                        value={profileData.firstName}
                                        onChange={handleFirstNameChange}
                                        placeholder="Enter your first name"
                                        required
                                        className="w-full bg-slate-700 text-white placeholder-gray-400 rounded-lg px-4 py-3 border-2 border-slate-600 focus:outline-none focus:border-orange-500 transition text-sm md:text-base hover:border-orange-500/50"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="lastName"
                                        className="flex items-center gap-2 text-white font-bold text-sm mb-2">
                                        <svg className="w-4 h-4 text-orange-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                                        </svg>
                                        Last Name
                                        <span className="ml-auto text-xs text-green-400 font-normal">✓ Editable</span>
                                    </label>
                                    <input
                                        id="lastName"
                                        name="lastName"
                                        type="text"
                                        autoComplete="family-name"
                                        value={profileData.lastName}
                                        onChange={handleLastNameChange}
                                        placeholder="Enter your last name"
                                        required
                                        className="w-full bg-slate-700 text-white placeholder-gray-400 rounded-lg px-4 py-3 border-2 border-slate-600 focus:outline-none focus:border-orange-500 transition text-sm md:text-base hover:border-orange-500/50"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="email"
                                        className="flex items-center gap-2 text-white font-bold text-sm mb-2">
                                        <svg className="w-4 h-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                                        </svg>
                                        Email Address
                                        <span className="ml-auto text-xs text-gray-400 font-normal">(Cannot be changed)</span>
                                    </label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        value={profileData.email}
                                        disabled
                                        className="w-full bg-slate-700/50 text-gray-400 placeholder-gray-500 rounded-lg px-4 py-3 border-2 border-slate-600/50 cursor-not-allowed text-sm md:text-base"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="username"
                                        className="flex items-center gap-2 text-white font-bold text-sm mb-2">
                                        <svg className="w-4 h-4 text-orange-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                                        </svg>
                                        Username
                                        <span className="ml-auto text-xs text-green-400 font-normal">✓ Editable</span>
                                    </label>
                                    <input
                                        id="username"
                                        name="username"
                                        type="text"
                                        autoComplete="username"
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
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Saving...
                                        </span>
                                    ) : (
                                        <>
                                            <span className="relative z-10">SAVE CHANGES</span>
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
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
                            <p className="text-blue-200 text-sm md:text-base leading-relaxed">
                                <span className="font-bold">Note:</span> Your email address cannot be changed for security reasons. You can update your first name, last name, username, and profile picture. For avatar, you can either upload an image file or provide a URL to an image.
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}