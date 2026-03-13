"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";
import Modal from "@/components/ui/Modal/Modal";
import Button from "@/components/ui/Button/Button";
import ErrorMessage from "@/components/ui/ErrorMessage/ErrorMessage";
import { verifyOtp, resendSignUpOtp } from "@/lib/services/authService";
import { ROUTES, REDIRECT_DELAY_MS } from "@/lib/constants/routes";

export default function VerifyEmail() {
	const router = useRouter();
	const [code, setCode] = useState(["", "", "", "", "", "", "", ""]);
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [userEmail, setUserEmail] = useState("");
	const [resendSuccess, setResendSuccess] = useState(false);

	useEffect(() => {
		const email = sessionStorage.getItem("verifyEmail");

		if (email) {
			setUserEmail(email);
		} else {
			setError("Session expired. Please sign up again.");
			setTimeout(() => {
				router.push(ROUTES.REGISTER);
			}, REDIRECT_DELAY_MS);
		}
	}, [router]);

	// Handle input change for each digit
	const handleInputChange = (index: number, value: string) => {
		// Only allow numbers
		if (value && !/^\d$/.test(value)) return;

		const newCode = [...code];
		newCode[index] = value;
		setCode(newCode);

		// Auto-focus next input
		if (value && index < 7) {
			const nextInput = document.getElementById(
				`code-${index + 1}`,
			) as HTMLInputElement;
			nextInput?.focus();
		}

		// Clear error when user starts typing
		if (error) setError("");
	};

	// Handle backspace key
	const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
		if (e.key === "Backspace" && !code[index] && index > 0) {
			const prevInput = document.getElementById(
				`code-${index - 1}`,
			) as HTMLInputElement;
			prevInput?.focus();
		}
	};

	// Handle paste event
	const handlePaste = (e: React.ClipboardEvent) => {
		e.preventDefault();
		const pastedData = e.clipboardData.getData("text").trim();

		// Only allow 8 digits
		if (/^\d{8}$/.test(pastedData)) {
			const digits = pastedData.split("");
			setCode(digits);

			// Focus last input
			const lastInput = document.getElementById("code-7") as HTMLInputElement;
			lastInput?.focus();
		}
	};

	// Handle form submission
	const handleSubmit = async () => {
		const verificationCode = code.join("");

		setError("");
		let hasErrors = false;

		// Validation
		if (verificationCode.length !== 8) {
			setError("Please enter all 8 digits");
			hasErrors = true;
		} else if (!userEmail) {
			setError("No email found. Please sign up again.");
			hasErrors = true;
		}

		if (hasErrors) return;

		setIsLoading(true);

		try {
			await verifyOtp(userEmail, verificationCode);

			// Success - clear stored email and redirect to onboarding
			sessionStorage.removeItem("verifyEmail");
			router.push(ROUTES.ONBOARDING);
		} catch (err) {
			const message = err instanceof Error ? err.message : "";
			if (message.includes("Invalid OTP")) {
				setError(
					"Invalid verification code. Please check your email and try again.",
				);
			} else if (message.includes("expired")) {
				setError("Verification code has expired. Please request a new one.");
			} else {
				setError(message || "Verification failed. Please try again.");
			}
		} finally {
			setIsLoading(false);
		}
	};

	// Handle resend code
	const handleResendCode = async () => {
		if (!userEmail) {
			setError("No email found. Please sign up again.");
			return;
		}

		setIsLoading(true);
		setError("");

		try {
			await resendSignUpOtp(userEmail, `${window.location.origin}/verify`);

			// Clear inputs and focus first
			setCode(["", "", "", "", "", "", "", ""]);
			const firstInput = document.getElementById("code-0") as HTMLInputElement;
			firstInput?.focus();

			// Show success feedback
			setError(""); // Clear any existing error
			setResendSuccess(true);
			setTimeout(() => setResendSuccess(false), 4000);
		} catch (err) {
			console.error("Resend error:", err);
			setError(
				`Failed to resend code: ${err instanceof Error ? err.message : "Please try again."}`,
			);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div
			className="min-h-screen flex bg-gradient-to-br from-landing-bg via-deep-bg via-55% to-vibrant-orange"
			style={{ backgroundAttachment: "fixed" }}>
			{/* Verification Form (Modal Style) - Centered */}
			<div className="w-full flex items-center justify-center p-4 md:p-8 lg:p-12">
				<Modal
					title="Verify your email"
					subtitle="We've sent a verification code to your email. Please enter the 8-digit code below."
					maxWidth="md">
					{userEmail && (
						<div className="text-center mb-6">
							<p className="text-white-pearl/70 text-sm">
								Verification code sent to:
							</p>
							<p className="text-white-pearl font-medium">{userEmail}</p>
						</div>
					)}
					{/* 8-digit code inputs */}
					<div className="flex justify-center gap-1.5 md:gap-2">
						{code.map((digit, index) => (
							<input
								key={index}
								id={`code-${index}`}
								type="text"
								inputMode="numeric"
								pattern="[0-9]*"
								maxLength={1}
								value={digit}
								onChange={(e) => handleInputChange(index, e.target.value)}
								onKeyDown={(e) => handleKeyDown(index, e)}
								onPaste={index === 0 ? handlePaste : undefined}
								className={`w-9 h-11 md:w-12 md:h-14 text-center text-xl md:text-2xl font-bold rounded-lg border-2 ${
									error
										? "border-carmin bg-carmin/10 text-carmin"
										: "border-white-pearl/30 bg-white-pearl/5 text-white-pearl focus:border-vibrant-orange"
								} focus:outline-none focus:ring-2 focus:ring-vibrant-orange/20 transition-all duration-200`}
							/>
						))}
					</div>

					{/* Error message */}
					{error && <ErrorMessage message={error} variant="general" />}

					{/* Success message */}
					{resendSuccess && (
						<div className="flex items-center gap-2 text-sea-green text-sm">
							<CheckCircle className="w-4 h-4" />
							<span>Code sent successfully! Check your email.</span>
						</div>
					)}

					{/* Verify Button */}
					<Button
						onClick={handleSubmit}
						className="w-full h-11 rounded-xl text-sm font-semibold">
						{isLoading ? "Verifying..." : "Verify Email"}
					</Button>

					{/* Resend Code */}
					<div className="text-center pt-4">
						<p className="text-white-pearl/70 text-sm mb-2">
							Didn't receive the code?
						</p>
						<button
							onClick={handleResendCode}
							disabled={isLoading}
							className="text-royal-blue hover:underline text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
							{isLoading ? "Sending..." : "Resend Code"}
						</button>
					</div>
				</Modal>
			</div>
		</div>
	);
}
