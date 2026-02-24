"use client";

import Navbar from "@/components/Layout/Navbar/Navbar";
import Top from "@/components/Layout/Top/Top";

export default function ProfilePage() {
    return (
        <div className="min-h-screen bg-deep-bg">
            <Navbar />
            <div className="ml-0 md:ml-14 lg:ml-14 xl:ml-16 2xl:ml-20 mr-4 md:mr-7 p-4 md:p-6 pb-20 md:pb-6">
                <Top title="Profile" />
                <div className="max-w-2xl mx-auto mt-8">
                    <div className="bg-modal-bg border border-input-bg rounded-3xl p-6 md:p-8">
                        <p className="text-input-text text-center">
                            Profile page coming soon.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
