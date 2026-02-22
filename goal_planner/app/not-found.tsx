"use client";

import Link from "next/link";
import { FileX } from "lucide-react";
import Modal from "@/components/ui/Modal/Modal";
import Button from "@/components/ui/Button/Button";

export default function NotFound() {
	return (
		<div
			className="min-h-screen flex bg-gradient-to-br from-landing-bg via-deep-bg via-55% to-vibrant-orange"
			style={{ backgroundAttachment: "fixed" }}>
			{/* 404 Error Modal - Centered */}
			<div className="w-full flex items-center justify-center flex-col p-8 lg:p-12">
				<Modal
					title="Error 404"
					subtitle="The page you're looking for doesn't exist or has been moved."
					maxWidth="md">
					<div className="text-center space-y-6">
						{/* Error Message */}
						<p className="text-white-pearl/80 text-base">
							Sorry, the page you requested could not be found. Please check the
							URL or return to the homepage.
						</p>

						{/* Homepage Button */}
						<Link href="/landing">
							<Button className="h-11 rounded-xl text-sm font-semibold w-full sm:w-auto mt-4">
								Go to Homepage
							</Button>
						</Link>
					</div>
				</Modal>
			</div>
		</div>
	);
}
