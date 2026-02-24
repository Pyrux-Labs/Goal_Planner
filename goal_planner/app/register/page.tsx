"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button/Button";
import InputField from "@/components/ui/InputField/InputField";
import { FcGoogle } from "react-icons/fc";
import { BiSolidError } from "react-icons/bi";
import { createClient } from "@/lib/supabase/client";

export default function Register() {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [fullNameError, setFullNameError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [confirmPasswordError, setConfirmPasswordError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [generalError, setGeneralError] = useState("");
    const router = useRouter();

    const handleSubmit = async () => {
        setFullNameError("");
        setEmailError("");
        setPasswordError("");
        setConfirmPasswordError("");
        setGeneralError("");

        let hasErrors = false;

        if (!fullName) {
            setFullNameError("Full name is required");
            hasErrors = true;
        }

        if (!email) {
            setEmailError("Email is required");
            hasErrors = true;
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                setEmailError("Please enter a valid email address");
                hasErrors = true;
            }
        }

        if (!password) {
            setPasswordError("Password is required");
            hasErrors = true;
        } else if (password.length < 8) {
            setPasswordError("Password must be at least 8 characters");
            hasErrors = true;
        }
        //Todo: better password validation
        /* else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
			setPasswordError(
				"Password must contain at least one uppercase letter, one lowercase letter, and one number",
			);
			hasErrors = true;
		} */

        if (password !== confirmPassword) {
            setConfirmPasswordError("Passwords do not match");
            hasErrors = true;
        }

        if (!acceptTerms) {
            setGeneralError("You must accept the terms and conditions");
            hasErrors = true;
        }

        if (hasErrors) return;

        setIsLoading(true);

        try {
            const supabase = createClient();

            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    },
                    emailRedirectTo: `${window.location.origin}/verify`,
                },
            });

            if (error) {
                setGeneralError(error.message);
                sessionStorage.removeItem("verifyEmail");
                return;
            }
            sessionStorage.removeItem("verifyEmail");
            // Success - save email to sessionStorage and redirect to verify page
            sessionStorage.setItem("verifyEmail", email);
            localStorage.setItem("verifyEmail", email);
            router.push("/verify");
        } catch (error) {
            setGeneralError("An unexpected error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex bg-gradient-to-br from-landing-bg via-deep-bg via-55% to-vibrant-orange"
            style={{ backgroundAttachment: "fixed" }}
        >
            {/* Left Column - Marketing Content */}
            <div className="hidden lg:flex lg:w-1/2 p-12">
                <div className="max-w-lg mx-auto space-y-12">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 flex items-center justify-center">
                            <img
                                src="icon.svg"
                                alt="Goal Planner"
                                className="w-6 h-6"
                            />
                        </div>
                        <span className="text-white-pearl text-2xl font-bold">
                            Goal Planner
                        </span>
                    </div>

                    {/* Features */}
                    <div className="space-y-8">
                        <div className="space-y-3">
                            <h3 className="text-white-pearl text-xl font-semibold">
                                Achieve your dreams quickly
                            </h3>
                            <p className="text-white-pearl/90 text-base leading-relaxed border-l border-vibrant-orange pl-2">
                                Sign up in minutes and start organizing your
                                goals right away. Our intuitive interface makes
                                goal planning simple and effective.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-white-pearl text-xl font-semibold">
                                Track any habit
                            </h3>
                            <p className="text-white-pearl/90 text-base leading-relaxed border-l border-vibrant-orange pl-2">
                                Whether you're planning career objectives,
                                personal development, or health goals, Goal
                                Planner adapts to your unique journey.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-white-pearl text-xl font-semibold">
                                Join a focused community
                            </h3>
                            <p className="text-white-pearl/90 text-base leading-relaxed border-l border-vibrant-orange pl-2">
                                Be part of a growing community of goal-oriented
                                individuals who are turning their dreams into
                                reality every day.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column - Registration Form (Modal Style) */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12">
                <div className="w-full max-w-[550px] bg-modal-bg rounded-3xl border-[3px] border-vibrant-orange shadow-lg shadow-vibrant-orange/50 px-6 md:px-14 pt-8 md:pt-10 pb-8">
                    {/* Header */}
                    <div className="flex flex-col mb-6">
                        <h1 className="text-white-pearl text-left font-title text-4xl font-semibold mb-4 leading-tight">
                            Start your journey to success
                        </h1>
                    </div>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSubmit();
                        }}
                        className="space-y-4"
                    >
                        {/* Full Name Field */}
                        <div>
                            <InputField
                                label="Full Name"
                                type="text"
                                placeholder="Enter your full name"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                labelClassName="block text-white-pearl mb-2"
                            />
                            {fullNameError && (
                                <span className="text-xs text-carmin flex items-center gap-1 mt-1">
                                    <BiSolidError />
                                    {fullNameError}
                                </span>
                            )}
                        </div>

                        {/* Email Field */}
                        <div>
                            <InputField
                                label="Email Address"
                                type="email"
                                placeholder="mail@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                labelClassName="block text-white-pearl mb-2"
                            />
                            {emailError && (
                                <span className="text-xs text-carmin flex items-center gap-1 mt-1">
                                    <BiSolidError />
                                    {emailError}
                                </span>
                            )}
                        </div>

                        {/* Password Field */}
                        <div>
                            <label className="text-white-pearl text-sm font-medium">
                                Password
                            </label>
                            <InputField
                                label=""
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                labelClassName="block text-white-pearl mb-2"
                                showPasswordToggle={true}
                                isPasswordVisible={showPassword}
                                onPasswordToggle={() =>
                                    setShowPassword(!showPassword)
                                }
                            />
                            {passwordError && (
                                <span className="text-xs text-carmin flex items-center gap-1 mt-1">
                                    <BiSolidError />
                                    {passwordError}
                                </span>
                            )}
                        </div>

                        {/* Confirm Password Field */}
                        <div>
                            <label className="text-white-pearl text-sm font-medium">
                                Confirm Password
                            </label>
                            <InputField
                                label=""
                                type="password"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) =>
                                    setConfirmPassword(e.target.value)
                                }
                                labelClassName="block text-white-pearl mb-2"
                                showPasswordToggle={true}
                                isPasswordVisible={showConfirmPassword}
                                onPasswordToggle={() =>
                                    setShowConfirmPassword(!showConfirmPassword)
                                }
                            />
                            {confirmPasswordError && (
                                <span className="text-xs text-carmin flex items-center gap-1 mt-1">
                                    <BiSolidError />
                                    {confirmPasswordError}
                                </span>
                            )}
                        </div>

                        {/* Terms Checkbox */}
                        <div className="flex items-start gap-2 pt-1">
                            <input
                                id="accept-terms"
                                type="checkbox"
                                checked={acceptTerms}
                                onChange={() => setAcceptTerms(!acceptTerms)}
                                className="w-4 h-4 rounded-sm border-2 border-white-pearl bg-vibrant-orange accent-[hsl(var(--vibrant-orange))] self-center"
                            />
                            <label
                                htmlFor="accept-terms"
                                className="text-white-pearl text-base"
                            >
                                I accept terms and privacy policy
                            </label>
                        </div>

                        {/* Sign Up Button */}
                        <Button
                            onClick={() => handleSubmit()}
                            className="w-full h-11 rounded-xl text-sm font-semibold"
                        >
                            {isLoading ? "Creating account..." : "Sign Up"}
                        </Button>

                        {/* General Error */}
                        {generalError && (
                            <div className="flex items-center gap-2 text-carmin text-sm mt-4">
                                <BiSolidError className="text-lg" />
                                <span>{generalError}</span>
                            </div>
                        )}
                    </form>

                    {/* Divider */}
                    <div className="relative my-10">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-input-bg"></div>
                        </div>
                        <div className="relative flex justify-center">
                            <span className="px-2 bg-modal-bg text-white-pearl text-xs">
                                or sign up with
                            </span>
                        </div>
                    </div>

                    {/* Google Sign In */}
                    <Button
                        onClick={() => {}}
                        className="w-full h-12 rounded-xs text-base font-semibold flex items-center justify-center gap-2"
                    >
                        <FcGoogle size={22} />
                        Sign up with Google
                    </Button>

                    {/* Sign In Link */}
                    <p className="text-center mt-6 text-white-pearl text-sm">
                        Have an Account?{" "}
                        <Link
                            href="/landing?signin=true"
                            className="text-royal-blue hover:underline"
                        >
                            Sign in here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
