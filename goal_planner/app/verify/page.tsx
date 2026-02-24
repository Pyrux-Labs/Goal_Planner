"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BiSolidError } from "react-icons/bi";
import Modal from "@/components/ui/Modal/Modal";
import Button from "@/components/ui/Button/Button";
import { createClient } from "@/lib/supabase/client";

export default function VerifyEmail() {
	const router = useRouter();
	const [code, setCode] = useState(["", "", "", "", "", "", "", ""]);
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [userEmail, setUserEmail] = useState("");
	const [resendSuccess, setResendSuccess] = useState(false);

	useEffect(() => {
		let email = sessionStorage.getItem("verifyEmail");
		if (!email) {
			email = localStorage.getItem("verifyEmail");
		}

		if (email) {
			setUserEmail(email);
		} else {
			setError("Session expired. Please sign up again.");
			setTimeout(() => {
				router.push("/register");
			}, 3000);
		}
	}, []);

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
			const supabase = createClient();
			const { error } = await supabase.auth.verifyOtp({
				email: userEmail,
				token: verificationCode,
				type: "signup",
			});

			if (error) {
				if (error.message?.includes("Invalid OTP")) {
					setError(
						"Invalid verification code. Please check your email and try again.",
					);
				} else if (error.message?.includes("expired")) {
					setError("Verification code has expired. Please request a new one.");
				} else {
					setError(error.message || "Verification failed. Please try again.");
				}
				return;
			}

			// Success - clear sessionStorage and redirect to onboarding
			sessionStorage.removeItem("verifyEmail");
			router.push("/onboarding");
		} catch (err) {
			setError("An unexpected error occurred. Please try again.");
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
			const supabase = createClient();

			const { error } = await supabase.auth.resend({
				type: "signup",
				email: userEmail,
				options: {
					emailRedirectTo: `${window.location.origin}/verify`,
				},
			});

			if (error) {
				console.error("Resend error:", error);
				setError(
					`Failed to resend code: ${error.message || "Please try again."}`,
				);
			} else {
				// Clear inputs and focus first
				setCode(["", "", "", "", "", "", "", ""]);
				const firstInput = document.getElementById(
					"code-0",
				) as HTMLInputElement;
				firstInput?.focus();

				// Show success feedback
				setError(""); // Clear any existing error
				setResendSuccess(true);
				setTimeout(() => setResendSuccess(false), 4000);
			}
		} catch (err) {
			console.error("Resend catch error:", err);
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
					{error && (
						<div className="flex items-center gap-2 text-carmin text-sm">
							<BiSolidError className="text-lg" />
							<span>{error}</span>
						</div>
					)}

					{/* Success message */}
					{resendSuccess && (
						<div className="flex items-center gap-2 text-sea-green text-sm">
							<svg
								className="w-4 h-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M5 13l4 4L19 7"
								/>
							</svg>
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
