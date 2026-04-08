"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import Modal from "@/components/ui/modal";
import InputField from "@/components/ui/input-field";
import Button from "@/components/ui/button";
import ErrorMessage from "@/components/ui/error-message";
import { validateEmail } from "@/lib/validations/auth-validation";
import { ROUTES } from "@/lib/constants/routes";
import { authClient } from "@/lib/supabase/auth-client";

export default function ForgotPassword() {
	const [email, setEmail] = useState("");
	const [error, setError] = useState("");
	const [success, setSuccess] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	// Handle form submission
	const handleSubmit = async () => {
		setError("");
		let hasErrors = false;

		// Validation
		const emailErr = validateEmail(email);
		if (emailErr) {
			setError(emailErr);
			hasErrors = true;
		}

		if (hasErrors) return;

		setIsLoading(true);

		try {
			const { error: resetError } = await authClient.auth.resetPasswordForEmail(email, {
				redirectTo: `${window.location.origin}${ROUTES.CHANGE_PASSWORD}`,
			});
			if (resetError) throw resetError;

			// Show success message
			setSuccess(true);
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: "Failed to send reset link. Please try again.",
			);
		} finally {
			setIsLoading(false);
		}
	};

	// Handle input change
	const handleInputChange = (value: string) => {
		setEmail(value);
		if (error) setError("");
	};

	return (
		<div
			className="min-h-screen flex bg-gradient-to-br from-landing-bg via-deep-bg via-55% to-vibrant-orange"
			style={{ backgroundAttachment: "fixed" }}>
			{/* Forgot Password Form (Modal Style) - Centered */}
			<div className="w-full flex items-center justify-center p-8 lg:p-12">
				<Modal
					title="Forgot Password"
					subtitle="Enter your email address and we'll send you a link to reset your password."
					maxWidth="md">
					{!success ? (
						<>
							{/* Email Input */}
							<InputField
								label="Email Address"
								type="email"
								placeholder="Enter your email address"
								value={email}
								onChange={(e) => handleInputChange(e.target.value)}
								labelClassName="block text-white-pearl mb-2 text-sm font-medium"
							/>

							{/* Error message */}
							{error && <ErrorMessage message={error} variant="general" />}

							{/* Send Reset Link Button */}
							<Button
								onClick={handleSubmit}
								className="w-full h-11 rounded-xl text-sm font-semibold">
								{isLoading ? "Sending..." : "Send Reset Link"}
							</Button>
						</>
					) : (
						/* Success State */
						<div className="text-center space-y-4">
							<div className="w-16 h-16 bg-sea-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
								<CheckCircle className="w-8 h-8 text-sea-green" />
							</div>
							<h3 className="text-white-pearl text-xl font-semibold">
								Reset Link Sent!
							</h3>
							<p className="text-white-pearl/80 text-base">
								We've sent a password reset link to{" "}
								<span className="font-medium">{email}</span>. Check your inbox
								and follow the instructions.
							</p>
							<p className="text-white-pearl/70 text-sm">
								Didn't receive the email? Check your spam folder or{" "}
								<button
									onClick={() => {
										setSuccess(false);
										handleSubmit();
									}}
									disabled={isLoading}
									className="text-vibrant-orange hover:text-vibrant-orange/80 font-medium disabled:opacity-50 transition-colors">
									try again
								</button>
							</p>
							<div className="pt-4 border-t border-input-bg">
								<Link
									href={ROUTES.LANDING}
									className="text-vibrant-orange hover:text-vibrant-orange/80 font-medium transition-colors">
									Back to Sign In
								</Link>
							</div>
						</div>
					)}
				</Modal>
			</div>
		</div>
	);
}
