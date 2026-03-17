import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "GoalPlanner — Master your goals, one step at a time",
    description:
        "The minimalist tool for students and young professionals to turn abstract visions into actionable daily habits. Set goals, plan tasks, track habits.",
    openGraph: {
        title: "GoalPlanner — Master your goals, one step at a time",
        description:
            "The minimalist tool for students and young professionals to turn abstract visions into actionable daily habits.",
        url: "https://goalplanner.com.ar",
        siteName: "GoalPlanner",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "GoalPlanner — Goal tracking calendar app",
            },
        ],
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "GoalPlanner — Master your goals, one step at a time",
        description:
            "The minimalist tool for students and young professionals to turn abstract visions into actionable daily habits.",
        images: ["/og-image.png"],
    },
    alternates: {
        canonical: "https://goalplanner.com.ar/landing",
    },
};

export default function LandingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
