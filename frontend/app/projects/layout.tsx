import type { Metadata } from "next";
import DashboardNavbar from "@/components/dashboard/navbar";
import Footer from "@/components/landing/footer";

export const metadata: Metadata = {
  title: "Detail Project — WebKalcer",
  robots: { index: false, follow: false },
};

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <DashboardNavbar />
      <main className="wrap flex-1 pt-10 pb-24">
        {children}
      </main>
      <Footer />
    </>
  );
}
