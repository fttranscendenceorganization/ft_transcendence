import { useEffect } from 'react';

export default function PrivacyPolicy() {

    useEffect(() => {
        document.title = "Privacy Policy - Netpong";
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-purple-950">

            <header className="sticky top-0 z-50 w-full bg-slate-900/80 backdrop-blur-md py-4 flex items-center justify-between px-4 md:px-6 shadow-lg border-b border-white/10">
                <a href="/" className="flex items-center group">
                    <img
                        src="/images/netpong.svg"
                        alt="NETPONG Logo"
                        className="h-8 md:h-10 w-auto transition-transform group-hover:scale-110"
                    />
                </a>
                <a
                    href="/"
                    className="text-white hover:text-orange-400 font-bold transition-all duration-300"
                >
                    Back to Home
                </a>
            </header>

            <div className="container mx-auto px-4 py-12 md:py-16 max-w-4xl">

                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4">
                        Privacy Policy
                    </h1>
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <div className="w-16 h-1 bg-gradient-to-r from-transparent via-purple-500 to-purple-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                        <div className="w-16 h-1 bg-gradient-to-l from-transparent via-purple-500 to-purple-500 rounded-full"></div>
                    </div>
                    <p className="text-gray-300 text-lg">
                        Last Updated: <span className="text-purple-400 font-bold">January 16, 2026</span>
                    </p>
                </div>

                <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-6 md:p-10 shadow-2xl border border-purple-500/30">

                    <section className="mb-8">
                        <h2 className="text-2xl md:text-3xl font-bold text-purple-400 mb-4 flex items-center gap-2">
                            <span className="text-3xl">🔒</span>
                            Introduction
                        </h2>
                        <p className="text-gray-300 leading-relaxed mb-4">
                            Welcome to NETPONG! We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our air hockey gaming platform.
                        </p>
                        <p className="text-gray-300 leading-relaxed">
                            By using NETPONG, you agree to the collection and use of information in accordance with this policy.
                        </p>
                    </section>

                    <div className="h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent my-8"></div>

                    <section className="mb-8">
                        <h2 className="text-2xl md:text-3xl font-bold text-purple-400 mb-4 flex items-center gap-2">
                            <span className="text-3xl">📋</span>
                            Information We Collect
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">Personal Information</h3>
                                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                                    <li>Username and display name</li>
                                    <li>Email address</li>
                                    <li>Password (encrypted)</li>
                                    <li>Profile information (avatar, image)</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">Gaming Data</h3>
                                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                                    <li>Game statistics (wins, losses, points)</li>
                                    <li>Match history and gameplay data</li>
                                    <li>rankings</li>
                                    <li>In-game chat messages</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">Technical Information</h3>
                                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                                    <li>IP address and device information</li>
                                    <li>Browser type and version</li>
                                    <li>Usage patterns and preferences</li>
                                    <li>Cookies and session data</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <div className="h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent my-8"></div>

                    <section className="mb-8">
                        <h2 className="text-2xl md:text-3xl font-bold text-purple-400 mb-4 flex items-center gap-2">
                            <span className="text-3xl">⚙️</span>
                            How We Use Your Information
                        </h2>
                        <p className="text-gray-300 leading-relaxed mb-4">
                            We use the collected information for the following purposes:
                        </p>
                        <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                            <li>To provide and maintain our gaming services</li>
                            <li>To manage your account and profile</li>
                            <li>To enable multiplayer gameplay and matchmaking</li>
                            <li>To track game statistics and leaderboards</li>
                            <li>To improve user experience and platform features</li>
                            <li>To communicate updates and announcements</li>
                            <li>To prevent fraud and ensure platform security</li>
                        </ul>
                    </section>

                    <div className="h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent my-8"></div>

                    <section className="mb-8">
                        <h2 className="text-2xl md:text-3xl font-bold text-purple-400 mb-4 flex items-center gap-2">
                            <span className="text-3xl">🛡️</span>
                            Data Security
                        </h2>
                        <p className="text-gray-300 leading-relaxed mb-4">
                            We take the security of your data seriously and implement industry-standard measures to protect it:
                        </p>
                        <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                            <li>Encrypted data transmission (HTTPS/SSL)</li>
                            <li>Secure password hashing and storage</li>
                            <li>Regular security audits and updates</li>
                            <li>Protected database access</li>
                            <li>Monitoring for unauthorized access</li>
                        </ul>
                    </section>

                    <div className="h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent my-8"></div>

                    <section className="mb-8">
                        <h2 className="text-2xl md:text-3xl font-bold text-purple-400 mb-4 flex items-center gap-2">
                            <span className="text-3xl">✅</span>
                            Your Rights
                        </h2>
                        <p className="text-gray-300 leading-relaxed mb-4">
                            You have the following rights regarding your personal data:
                        </p>
                        <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                            <li><strong>Access:</strong> Request a copy of your personal data</li>
                            <li><strong>Correction:</strong> Update or correct your information</li>
                            <li><strong>Deletion:</strong> Request deletion of your account and data</li>
                        </ul>
                    </section>

                    <div className="h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent my-8"></div>

                    <section className="mb-8">
                        <h2 className="text-2xl md:text-3xl font-bold text-purple-400 mb-4 flex items-center gap-2">
                            <span className="text-3xl">🍪</span>
                            Cookies
                        </h2>
                        <p className="text-gray-300 leading-relaxed mb-4">
                            NETPONG uses cookies to enhance your experience. Cookies are small files stored on your device that help us:
                        </p>
                        <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                            <li>Keep you logged in to your account</li>
                            <li>Remember your preferences and settings</li>
                            <li>Analyze website traffic and usage patterns</li>
                            <li>Improve platform performance</li>
                        </ul>
                        <p className="text-gray-300 leading-relaxed mt-4">
                            You can control cookie settings through your browser preferences.
                        </p>
                    </section>

                    <div className="h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent my-8"></div>

                    <section className="mb-8">
                        <h2 className="text-2xl md:text-3xl font-bold text-purple-400 mb-4 flex items-center gap-2">
                            <span className="text-3xl">🔗</span>
                            Third-Party Services
                        </h2>
                        <p className="text-gray-300 leading-relaxed mb-4">
                            We may use third-party services for:
                        </p>
                        <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                            <li>Analytics and performance monitoring</li>
                            <li>Cloud hosting and storage</li>
                        </ul>
                        <p className="text-gray-300 leading-relaxed mt-4">
                            These services have their own privacy policies and we recommend reviewing them.
                        </p>
                    </section>

                    <div className="h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent my-8"></div>

                    <section className="mb-8">
                        <h2 className="text-2xl md:text-3xl font-bold text-purple-400 mb-4 flex items-center gap-2">
                            <span className="text-3xl">👶</span>
                            Children's Privacy
                        </h2>
                        <p className="text-gray-300 leading-relaxed">
                            NETPONG is intended for users aged 13 and above. We do not knowingly collect personal information from children under 13. If you believe we have collected data from a child under 13, please contact us immediately and we will delete the information.
                        </p>
                    </section>

                    <div className="h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent my-8"></div>

                    <section className="mb-8">
                        <h2 className="text-2xl md:text-3xl font-bold text-purple-400 mb-4 flex items-center gap-2">
                            <span className="text-3xl">🔄</span>
                            Changes to This Policy
                        </h2>
                        <p className="text-gray-300 leading-relaxed">
                            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date. We encourage you to review this policy periodically for any changes.
                        </p>
                    </section>

                    <div className="h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent my-8"></div>

                    <section>
                        <h2 className="text-2xl md:text-3xl font-bold text-purple-400 mb-4 flex items-center gap-2">
                            <span className="text-3xl">📧</span>
                            Contact Us
                        </h2>
                        <p className="text-gray-300 leading-relaxed mb-4">
                            If you have any questions about this Privacy Policy or our data practices, please contact us:
                        </p>
                        <div className="bg-slate-800/50 rounded-xl p-4 border border-purple-500/20">
                            <p className="text-white font-bold mb-2">NETPONG Support Team</p>
                            <p className="text-gray-300">Please visit our <a href="/contact" className="text-purple-400 hover:text-purple-300 transition">Contact Page</a></p>
                        </div>
                    </section>
                </div>

                <div className="text-center mt-8">
                    <p className="text-gray-400 text-sm">
                        By using NETPONG, you acknowledge that you have read and understood this Privacy Policy.
                    </p>
                </div>
            </div>
        </div>
    );
}