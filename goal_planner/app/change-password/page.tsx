"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { BiSolidError } from "react-icons/bi";
import Modal from "@/components/ui/Modal/Modal";
import InputField from "@/components/ui/InputField/InputField";
import Button from "@/components/ui/Button/Button";
import { createClient } from "@/lib/supabase/client";

function ChangePasswordContent() {
    const searchParams = useSearchParams();
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [newPasswordError, setNewPasswordError] = useState("");
    const [confirmPasswordError, setConfirmPasswordError] = useState("");
    const [generalError, setGeneralError] = useState("");
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Check for access_token in URL (from email link)
    useEffect(() => {
        const access_token = searchParams.get("access_token");
        const type = searchParams.get("type");

        if (access_token && type === "recovery") {
            // Set the session with the recovery token
            const setSession = async () => {
                const supabase = createClient();
                await supabase.auth.setSession({
                    access_token,
                    refresh_token: "",
                });
            };
            setSession();
        }
    }, [searchParams]);

    // Handle form submission
    const handleSubmit = async () => {
        // Clear all errors
        setNewPasswordError("");
        setConfirmPasswordError("");
        setGeneralError("");

        let hasErrors = false;

        // Validation
        if (!newPassword) {
            setNewPasswordError("New password is required");
            hasErrors = true;
        } else if (newPassword.length < 8) {
            setNewPasswordError("Password must be at least 8 characters long");
            hasErrors = true;
        }
        //Todo: better password validation
        /* else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
			setNewPasswordError(
				"Password must contain at least one uppercase letter, one lowercase letter, and one number",
			);
			hasErrors = true;
		} */

        if (!confirmPassword) {
            setConfirmPasswordError("Please confirm your password");
            hasErrors = true;
        } else if (newPassword !== confirmPassword) {
            setConfirmPasswordError("Passwords do not match");
            hasErrors = true;
        }

        if (hasErrors) return;

        setIsLoading(true);

        try {
            const supabase = createClient();
            const { error } = await supabase.auth.updateUser({
                password: newPassword,
            });

            if (error) {
                if (error.message?.includes("Password")) {
                    setNewPasswordError(
                        "Password is too weak. Please use a stronger password.",
                    );
                } else {
                    setGeneralError(
                        error.message ||
                            "Failed to change password. Please try again.",
                    );
                }
                return;
            }

            // Show success message
            setSuccess(true);
        } catch (err) {
            setGeneralError("Failed to change password. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // Handle input changes
    const handleNewPasswordChange = (value: string) => {
        setNewPassword(value);
        if (newPasswordError) setNewPasswordError("");
        if (generalError) setGeneralError("");
    };

    const handleConfirmPasswordChange = (value: string) => {
        setConfirmPassword(value);
        if (confirmPasswordError) setConfirmPasswordError("");
        if (generalError) setGeneralError("");
    };

    return (
        <div
            className="min-h-screen flex bg-gradient-to-br from-landing-bg via-deep-bg via-55% to-vibrant-orange"
            style={{ backgroundAttachment: "fixed" }}
        >
            {/* Change Password Form (Modal Style) - Centered */}
            <div className="w-full flex items-center justify-center p-8 lg:p-12">
                <Modal
                    title="Change Password"
                    subtitle="Enter your new password and confirm it to update your account."
                    maxWidth="md"
                >
                    {!success ? (
                        <>
                            {/* New Password Input */}
                            <div>
                                <InputField
                                    label="New Password"
                                    type="password"
                                    placeholder="Enter your new password"
                                    value={newPassword}
                                    onChange={(e) =>
                                        handleNewPasswordChange(e.target.value)
                                    }
                                    labelClassName="block text-white-pearl mb-2 text-sm font-medium"
                                    showPasswordToggle={true}
                                    isPasswordVisible={showNewPassword}
                                    onPasswordToggle={() =>
                                        setShowNewPassword(!showNewPassword)
                                    }
                                />
                                {newPasswordError && (
                                    <span className="text-xs text-carmin flex items-center gap-1 mt-1">
                                        <BiSolidError />
                                        {newPasswordError}
                                    </span>
                                )}
                            </div>

                            {/* Confirm Password Input */}
                            <div>
                                <InputField
                                    label="Confirm Password"
                                    type="password"
                                    placeholder="Confirm your new password"
                                    value={confirmPassword}
                                    onChange={(e) =>
                                        handleConfirmPasswordChange(
                                            e.target.value,
                                        )
                                    }
                                    labelClassName="block text-white-pearl mb-2 text-sm font-medium"
                                    showPasswordToggle={true}
                                    isPasswordVisible={showConfirmPassword}
                                    onPasswordToggle={() =>
                                        setShowConfirmPassword(
                                            !showConfirmPassword,
                                        )
                                    }
                                />
                                {confirmPasswordError && (
                                    <span className="text-xs text-carmin flex items-center gap-1 mt-1">
                                        <BiSolidError />
                                        {confirmPasswordError}
                                    </span>
                                )}
                            </div>

                            {/* General Error message */}
                            {generalError && (
                                <div className="flex items-center gap-2 text-carmin text-sm">
                                    <BiSolidError className="text-lg" />
                                    <span>{generalError}</span>
                                </div>
                            )}

                            {/* Change Password Button */}
                            <Button
                                onClick={handleSubmit}
                                className="w-full h-11 rounded-xl text-sm font-semibold"
                            >
                                {isLoading ? "Changing..." : "Change Password"}
                            </Button>
                        </>
                    ) : (
                        /* Success State */
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 bg-sea-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg
                                    className="w-8 h-8 text-sea-green"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-white-pearl text-xl font-semibold">
                                Password Changed!
                            </h3>
                            <p className="text-white-pearl/80 text-base">
                                Your password has been successfully updated. You
                                can now sign in with your new password.
                            </p>
                            <div className="pt-4 border-t border-input-bg">
                                <Link
                                    href="/landing?signin=true"
                                    className="inline-flex items-center justify-center w-full h-11 rounded-xl text-sm font-semibold bg-vibrant-orange text-white-pearl hover:bg-vibrant-orange/90 transition-all duration-200"
                                >
                                    Sign In
                                </Link>
                            </div>
                        </div>
                    )}
                </Modal>
            </div>
        </div>
    );
}

export default function ChangePassword() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-deep-bg" />}>
            <ChangePasswordContent />
        </Suspense>
    );
}
