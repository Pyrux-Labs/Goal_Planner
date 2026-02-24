"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button/Button";
import InputField from "@/components/ui/InputField/InputField";
import { FcGoogle } from "react-icons/fc";
import { BiSolidError } from "react-icons/bi";
import { createClient } from "@/lib/supabase/client";

interface SignInProps {
    onClose: () => void;
}

const SignIn = ({ onClose }: SignInProps) => {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    // TODO: keepLoggedIn state is declared but doesn't affect auth behavior yet
    const [keepLoggedIn, setKeepLoggedIn] = useState(false);
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [generalError, setGeneralError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setEmailError("");
        setPasswordError("");
        setGeneralError("");

        let hasErrors = false;

        if (!email) {
            setEmailError("Email is required");
            hasErrors = true;
        }

        if (!password) {
            setPasswordError("Password is required");
            hasErrors = true;
        }

        if (hasErrors) return;

        setIsLoading(true);

        try {
            const supabase = createClient();
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                if (error.message?.includes("Invalid login credentials")) {
                    setGeneralError(
                        "Invalid email or password. Please try again.",
                    );
                } else if (error.message?.includes("Email not confirmed")) {
                    setGeneralError(
                        "Please verify your email before signing in.",
                    );
                } else {
                    setGeneralError(
                        error.message || "Sign in failed. Please try again.",
                    );
                }
                return;
            }

            // Success - redirect to dashboard
            router.push("/calendar");
        } catch (err) {
            setGeneralError("An unexpected error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-modal-bg/90 backdrop-blur-sm flex items-center justify-center z-50 "
            onClick={onClose}
        >
            <div
                className="w-full h-full max-h-[650px] max-w-[440px] bg-modal-bg rounded-[28px] border-[3px] border-vibrant-orange shadow-[0_0_13.3px_0_hsl(var(--vibrant-orange))] px-6 md:px-14 pt-8 md:pt-10"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex flex-col items-center mb-6">
                    <h1 className="text-white-pearl text-center font-title text-4xl font-semibold mb-4">
                        Login
                    </h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
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
                        <div className="flex items-center justify-between">
                            <label className="text-white-pearl text-sm font-medium">
                                Password
                            </label>
                            <Link
                                href="/forgot-password"
                                className="text-royal-blue text-xs hover:underline"
                            >
                                Forgot Password
                            </Link>
                        </div>
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

                    {/* Keep me signed in */}
                    <div className="flex items-center gap-2 pt-1">
                        <input
                            id="keep-logged-in"
                            type="checkbox"
                            checked={keepLoggedIn}
                            onChange={() => setKeepLoggedIn(!keepLoggedIn)}
                            className="w-4 h-4 rounded-sm border-2 border-white-pearl bg-vibrant-orange accent-[hsl(var(--vibrant-orange))]"
                        />
                        <label className="text-white-pearl text-sm">
                            Keep me signed in
                        </label>
                    </div>

                    {/* Error message */}
                    {generalError && (
                        <div className="flex items-center gap-2 text-carmin text-sm">
                            <BiSolidError className="text-lg" />
                            <span>{generalError}</span>
                        </div>
                    )}

                    {/* Login Button */}
                    <Button
                        onClick={() => handleSubmit()}
                        className="w-full h-10 rounded-xl text-sm font-semibold"
                    >
                        {isLoading ? "Signing in..." : "Login"}
                    </Button>
                </form>

                {/* Divider */}
                <div className="relative my-10">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-input-bg"></div>
                    </div>
                    <div className="relative flex justify-center">
                        <span className="px-2 bg-modal-bg text-white-pearl text-xs">
                            or sign in with
                        </span>
                    </div>
                </div>

                {/* Google Sign In */}
                <Button
                    onClick={() => {}}
                    className="w-full h-12 rounded-xs text-base font-semibold flex items-center justify-center gap-2"
                >
                    <FcGoogle size={22} />
                    Sign in with Google
                </Button>

                {/* Sign Up Link */}
                <p className="text-center mt-6 text-white-pearl text-sm">
                    Don't have an Account?{" "}
                    <Link
                        href="/register"
                        className="text-royal-blue hover:underline"
                    >
                        Sign up here
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default SignIn;
