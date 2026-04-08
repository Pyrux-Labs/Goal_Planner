import Image from "next/image";
import Button from "@/components/ui/button";
import { ROUTES } from "@/lib/constants/routes";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-deep-bg to-modal-bg flex items-center justify-center px-4">
            <div className="max-w-4xl w-full">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    {/* Error Message */}
                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-4xl md:text-6xl font-title font-bold text-white-pearl mb-4">
                            Page Not Found
                        </h1>
                        <p className="text-lg md:text-xl text-white-pearl mb-8">
                            Sorry, the page you're looking for doesn't exist or
                            has been moved.
                        </p>

                        {/* Action Button */}
                        <div className="flex justify-center md:justify-start">
                            <Button
                                href={ROUTES.CALENDAR}
                                mobileText="Return home"
                                desktopText="Return home"
                                className="w-full sm:w-auto"
                            />
                        </div>
                    </div>

                    {/* 404 SVG Illustration */}
                    <div className="flex-shrink-0">
                        <Image
                            src="/404_not_found.svg"
                            alt="404 Not Found"
                            width={250}
                            height={250}
                            className="w-64 h-64"
                            priority
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
