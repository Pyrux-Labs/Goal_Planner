import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Create your account — GoalPlanner",
    description:
        "Sign up for GoalPlanner and start turning your annual goals into daily habits. Free to use.",
    openGraph: {
        title: "Create your account — GoalPlanner",
        description:
            "Sign up for GoalPlanner and start turning your annual goals into daily habits. Free to use.",
        url: "https://goalplanner.com.ar/register",
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
        title: "Create your account — GoalPlanner",
        description:
            "Sign up for GoalPlanner and start turning your annual goals into daily habits.",
        images: ["/og-image.png"],
    },
    alternates: {
        canonical: "https://goalplanner.com.ar/register",
    },
};

export default function RegisterLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
