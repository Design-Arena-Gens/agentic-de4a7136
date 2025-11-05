import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agentic Assistant",
  description: "A browsing agent that helps complete tasks from the current page.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="container-page py-8">
          {children}
        </div>
      </body>
    </html>
  );
}
