import { useEffect } from 'react';

export default function TermsPage() {

    useEffect(() => {
        document.title = "Terms Service - Netpong";
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
                        Terms of Service
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
                            Acceptance of Terms
                        </h2>
                        <p className="text-gray-300 leading-relaxed mb-4">
                            Welcome to NETPONG! By accessing or using our air hockey gaming platform, you agree to be bound by these Terms of Service.
                        </p>
                        <p className="text-gray-300 leading-relaxed">
                            If you do not agree to these terms, please do not use our services.
                        </p>
                    </section>

                    <div className="h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent my-8"></div>

                    <section className="mb-8">
                        <h2 className="text-2xl md:text-3xl font-bold text-purple-400 mb-4 flex items-center gap-2">
                            <span className="text-3xl">📋</span>
                            User Accounts
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">Registration:</h3>
                                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                                    <li>You must be at least 13 years old to create an account</li>
                                    <li>You must provide accurate and complete information</li>
                                    <li>You are responsible for maintaining the security of your account</li>
                                    <li>You must not share your account credentials with others</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">Account Responsibilities:</h3>
                                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                                    <li>You are responsible for all activities under your account</li>
                                    <li>Notify us immediately of any unauthorized use</li>
                                    <li>We reserve the right to suspend or terminate accounts that violate these terms</li>
                                </ul>
                            </div>

                        </div>
                    </section>

                    <div className="h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent my-8"></div>

                    <section className="mb-8">
                        <h2 className="text-2xl md:text-3xl font-bold text-purple-400 mb-4 flex items-center gap-2">
                            <span className="text-3xl">⚙️</span>
                            User Conduct
                        </h2>
                        <p className="text-gray-300 leading-relaxed mb-4">
                            You agree NOT to:
                        </p>
                        <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                            <li>Cheat, hack, or use exploits in games</li>
                            <li>Harass, bully, or threaten other players</li>
                            <li>Use offensive, vulgar, or inappropriate language</li>
                            <li>Impersonate other users or NETPONG staff</li>
                            <li>Spam or send unsolicited messages</li>
                            <li>Share inappropriate content</li>
                            <li>Attempt to gain unauthorized access to our systems</li>
                            <li>Use bots or automated tools</li>
                            <li>Engage in any illegal activities</li>
                        </ul>
                    </section>

                    <div className="h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent my-8"></div>

                    <section className="mb-8">
                        <h2 className="text-2xl md:text-3xl font-bold text-purple-400 mb-4 flex items-center gap-2">
                            <span className="text-3xl">📜</span>
                            Game Rules
                        </h2>
                        <p className="text-gray-300 leading-relaxed mb-4">
                            Fair Play:
                        </p>
                        <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                            <li>Players must compete fairly and honestly</li>
                            <li>Use of third-party software or cheats is strictly prohibited</li>
                            <li>Exploitation of bugs or glitches is not allowed</li>
                            <li>Match manipulation or intentional losing is forbidden</li>
                        </ul>

                        <p className="text-gray-300 leading-relaxed mb-4">
                            Game Modes:
                        </p>
                        <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                            <li>Players must follow specific rules for each game mode (Zombie Land, Barbie Pink, Joker, Saul Society)</li>
                            <li>Inappropriate behavior during gameplay may result in penalties</li>
                        </ul>
                    </section>

                    <div className="h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent my-8"></div>

                    <section className="mb-8">
                        <h2 className="text-2xl md:text-3xl font-bold text-purple-400 mb-4 flex items-center gap-2">
                            <span className="text-3xl">✅</span>
                            Intellectual Property
                        </h2>
                        <p className="text-gray-300 leading-relaxed mb-4">
                            Our Content:
                        </p>
                        <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                            <li>All content, logos, graphics, and game designs are owned by NETPONG</li>
                            <li>You may not copy, modify, or distribute our content without permission</li>
                            <li><strong>NETPONG</strong> and related marks are our trademarks</li>
                        </ul>

                        <p className="text-gray-300 leading-relaxed mb-4">
                            User Content:
                        </p>
                        <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                            <li>You retain ownership of content you create (profile, messages)</li>
                            <li>By using our platform, you grant us a license to use your content for platform operations</li>
                            <li> You must have rights to any content you upload</li>
                        </ul>
                    </section>

                    <div className="h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent my-8"></div>

                    <section className="mb-8">
                        <h2 className="text-2xl md:text-3xl font-bold text-purple-400 mb-4 flex items-center gap-2">
                            <span className="text-3xl">🎮</span>
                            Virtual Items and Points
                        </h2>
                        <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                            <li>Points, achievements, and ranks have no real-world monetary value</li>
                            <li>We reserve the right to modify or remove virtual items</li>
                            <li>Virtual items cannot be transferred or sold outside the platform</li>
                            <li>We are not responsible for loss of virtual items due to account suspension</li>
                        </ul>
                    </section>

                    <div className="h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent my-8"></div>

                    <section className="mb-8">
                        <h2 className="text-2xl md:text-3xl font-bold text-purple-400 mb-4 flex items-center gap-2">
                            <span className="text-3xl">⚖️</span>
                            Privacy and Data
                        </h2>
                        <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                            <li>Your use of NETPONG is also governed by our Privacy Policy</li>
                            <li>We collect and use data as described in our Privacy Policy</li>
                            <li>You consent to data collection and processing when using our services</li>
                        </ul>
                    </section>

                    <div className="h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent my-8"></div>

                    <section className="mb-8">
                        <h2 className="text-2xl md:text-3xl font-bold text-purple-400 mb-4 flex items-center gap-2">
                            <span className="text-3xl">🚫</span>
                            Termination
                        </h2>
                        <p className="text-gray-300 leading-relaxed mb-4">
                            We may suspend or terminate your account if:
                        </p>
                        <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                            <li>You violate these Terms of Service</li>
                            <li>You engage in fraudulent or illegal activities</li>
                            <li>Your account has been inactive for an extended period</li>
                            <li>We discontinue the service</li>
                        </ul>

                        <p className="text-gray-300 leading-relaxed mb-4">
                            Upon termination:
                        </p>
                        <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                            <li>Your access to the platform will be revoked</li>
                            <li>Your data may be deleted according to our retention policy</li>
                            <li>You must cease all use of NETPONG services</li>
                        </ul>
                    </section>

                    <div className="h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent my-8"></div>

                    <section className="mb-8">
                        <h2 className="text-2xl md:text-3xl font-bold text-purple-400 mb-4 flex items-center gap-2">
                            <span className="text-3xl">🔄</span>
                            Disclaimers
                        </h2>
                        <p className="text-gray-300 leading-relaxed mb-4">
                            Service Availability:
                        </p>
                        <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                            <li>NETPONG is provided "as is" without warranties</li>
                            <li>We do not guarantee uninterrupted or error-free service</li>
                            <li>We may modify or discontinue services at any time</li>
                        </ul>

                        <p className="text-gray-300 leading-relaxed mb-4">
                            No Guarantees:
                        </p>
                        <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                            <li>We do not guarantee specific game outcomes</li>
                            <li>We are not responsible for user-generated content</li>
                            <li>We are not liable for disputes between users</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl md:text-3xl font-bold text-purple-400 mb-4 flex items-center gap-2">
                            <span className="text-3xl">⏱️</span>
                            Limitation of Liability
                        </h2>
                        <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                            <li>NETPONG is not liable for any indirect, incidental, or consequential damages</li>
                            <li>Use of our platform is at your own risk</li>
                            <li>We are not responsible for loss of data, profits, or gameplay progress</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl md:text-3xl font-bold text-purple-400 mb-4 flex items-center gap-2">
                            <span className="text-3xl">💥</span>
                            Modifications to Terms
                        </h2>
                        <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                            <li>We may update these Terms of Service at any time</li>
                            <li>Changes will be posted on this page with an updated date</li>
                            <li>Continued use after changes constitutes acceptance</li>
                            <li>Material changes will be communicated via email or platform notification</li>
                        </ul>
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
                        By clicking "I Agree" or by using NETPONG, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service..
                    </p>
                </div>
            </div>
        </div>
    );
}