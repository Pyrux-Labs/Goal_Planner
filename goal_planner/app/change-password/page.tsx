"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import Modal from "@/components/ui/Modal/Modal";
import InputField from "@/components/ui/InputField/InputField";
import Button from "@/components/ui/Button/Button";
import ErrorMessage from "@/components/ui/ErrorMessage/ErrorMessage";
import { authClient } from "@/lib/supabase/auth-client";
import {
	validatePassword,
	validatePasswordMatch,
} from "@/lib/validations/authValidation";
import { ROUTES } from "@/lib/constants/routes";

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
	const [sessionReady, setSessionReady] = useState(false);

	useEffect(() => {
		// Supabase redirige con ?error=... cuando el link falla (ej: expirado)
		const errorParam = searchParams.get("error");
		if (errorParam) {
			const description = searchParams.get("error_description");
			setGeneralError(
				description
					? decodeURIComponent(description.replace(/\+/g, " "))
					: "Reset link is invalid or has expired. Please request a new one.",
			);
			return;
		}

		// Igual que la doc oficial: mismo cliente para onAuthStateChange y updateUser
		const { data: { subscription } } = authClient.auth.onAuthStateChange((event) => {
			if (event === "PASSWORD_RECOVERY") {
				setSessionReady(true);
			}
		});

		return () => subscription.unsubscribe();
	}, []);

	// Handle form submission
	const handleSubmit = async () => {
		// Clear all errors
		setNewPasswordError("");
		setConfirmPasswordError("");
		setGeneralError("");

		let hasErrors = false;

		// Validation
		const passwordError = validatePassword(newPassword);
		if (passwordError) {
			setNewPasswordError(passwordError);
			hasErrors = true;
		}

		const matchError = validatePasswordMatch(newPassword, confirmPassword);
		if (matchError) {
			setConfirmPasswordError(matchError);
			hasErrors = true;
		}

		if (hasErrors) return;

		setIsLoading(true);

		try {
			// Mismo cliente que recibió PASSWORD_RECOVERY, igual que la doc oficial
			const { error } = await authClient.auth.updateUser({
				password: newPassword,
			});
			if (error) throw error;

			// Show success message
			setSuccess(true);
		} catch (error) {
			const message = error instanceof Error ? error.message : "";
			if (message.toLowerCase().includes("password")) {
				setNewPasswordError(
					"Password is too weak. Please use a stronger password.",
				);
			} else {
				setGeneralError(
					message || "Failed to change password. Please try again.",
				);
			}
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
			style={{ backgroundAttachment: "fixed" }}>
			{/* Change Password Form (Modal Style) - Centered */}
			<div className="w-full flex items-center justify-center p-8 lg:p-12">
				<Modal
					title="Change Password"
					subtitle="Enter your new password and confirm it to update your account."
					maxWidth="md">
					{!success ? (
						<>
							{/* New Password Input */}
							<div>
								<InputField
									label="New Password"
									type="password"
									placeholder="Enter your new password"
									value={newPassword}
									onChange={(e) => handleNewPasswordChange(e.target.value)}
									labelClassName="block text-white-pearl mb-2 text-sm font-medium"
									showPasswordToggle={true}
									isPasswordVisible={showNewPassword}
									onPasswordToggle={() => setShowNewPassword(!showNewPassword)}
								/>
								{newPasswordError && (
									<ErrorMessage message={newPasswordError} />
								)}
							</div>

							{/* Confirm Password Input */}
							<div>
								<InputField
									label="Confirm Password"
									type="password"
									placeholder="Confirm your new password"
									value={confirmPassword}
									onChange={(e) => handleConfirmPasswordChange(e.target.value)}
									labelClassName="block text-white-pearl mb-2 text-sm font-medium"
									showPasswordToggle={true}
									isPasswordVisible={showConfirmPassword}
									onPasswordToggle={() =>
										setShowConfirmPassword(!showConfirmPassword)
									}
								/>
								{confirmPasswordError && (
									<ErrorMessage message={confirmPasswordError} />
								)}
							</div>

							{/* General Error message */}
							{generalError && (
								<ErrorMessage message={generalError} variant="general" />
							)}

							{/* Change Password Button */}
							<Button
								onClick={handleSubmit}
								className="w-full h-11 rounded-xl text-sm font-semibold">
								{isLoading ? "Changing..." : "Change Password"}
							</Button>
						</>
					) : (
						/* Success State */
						<div className="text-center space-y-4">
							<div className="w-16 h-16 bg-sea-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
								<CheckCircle className="w-8 h-8 text-sea-green" />
							</div>
							<h3 className="text-white-pearl text-xl font-semibold">
								Password Changed!
							</h3>
							<p className="text-white-pearl/80 text-base">
								Your password has been successfully updated. You can now sign in
								with your new password.
							</p>
							<div className="pt-4 border-t border-input-bg">
								<Link
									href={`${ROUTES.LANDING}?signin=true`}
									className="inline-flex items-center justify-center w-full h-11 rounded-xl text-sm font-semibold bg-vibrant-orange text-white-pearl hover:bg-vibrant-orange/90 transition-all duration-200">
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
