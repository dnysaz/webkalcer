import type { Metadata } from "next";
import { AuthProvider } from "@/components/dashboard/auth-provider";
import DashboardNavbar from "@/components/dashboard/navbar";
import Footer from "@/components/landing/footer";

export const metadata: Metadata = {
  title: "Dashboard — WebKalcer",
  robots: { index: false, follow: false },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <DashboardNavbar />
      <main className="wrap flex-1 pt-10 pb-24">
        {children}
      </main>
      <Footer />
    </AuthProvider>
  );
}
