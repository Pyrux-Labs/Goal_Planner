import PageTransition from "@/components/layout/page-transition";

export default function PagesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="ml-0 md:ml-14 lg:ml-14 xl:ml-16 2xl:ml-20 mr-4 md:mr-7 p-4 md:p-6 pb-20 md:pb-6">
      <PageTransition>{children}</PageTransition>
    </div>
  );
}
