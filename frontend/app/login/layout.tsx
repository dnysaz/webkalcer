import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Masuk — WebKalcer",
  description:
    "Masuk ke dashboard WebKalcer untuk deploy website dari repository GitHub atau upload ZIP — hosting statis gratis di subdomain webkalcer.com.",
  robots: { index: false, follow: false },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
