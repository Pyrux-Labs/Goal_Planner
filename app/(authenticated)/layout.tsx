import Navbar from "@/components/layout/navbar";

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-deep-bg">
      <Navbar />
      {children}
    </div>
  );
}
