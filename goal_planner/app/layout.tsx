import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast/ToastContext";
import { UserProvider } from "@/contexts/UserContext";

const defaultUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

export const metadata: Metadata = {
    metadataBase: new URL(defaultUrl),
    title: "GoalPlanner",
    description:
        "A goal-focused calendar app where you define annual objectives and link them to tasks and daily habits. Track your progress over time and turn long-term plans into concrete actions, all in one place.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className="bg-[hsl(var(--deep-bg))] overflow-x-hidden"
                suppressHydrationWarning
            >
                <ToastProvider>
                    <UserProvider>{children}</UserProvider>
                </ToastProvider>
            </body>
            {process.env.NEXT_PUBLIC_GA_ID && (
                <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
            )}
        </html>
    );
}
