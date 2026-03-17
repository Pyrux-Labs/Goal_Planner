import Navbar from "@/components/Layout/Navbar/Navbar";
import PageTransition from "@/components/Layout/PageTransition";

/**
 * Shared layout for all authenticated pages.
 * Provides the Navbar and consistent page wrapper with proper margins
 * to account for the sidebar navigation.
 */
export default function AuthenticatedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-deep-bg">
            <Navbar />
            <div className="ml-0 md:ml-14 lg:ml-14 xl:ml-16 2xl:ml-20 mr-4 md:mr-7 p-4 md:p-6 pb-20 md:pb-6">
                <PageTransition>{children}</PageTransition>
            </div>
        </div>
    );
}
