"use client";

import React, { useState } from "react";
import "../styles/globals.css";
import { Sidebar } from "../components/navigation/Sidebar";
import { Header } from "../components/navigation/Header";
import { AuthProvider } from "../context/AuthContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isPresentationMode, setIsPresentationMode] = useState(false);

  return (
    <html lang="en" className="dark">
      <head>
        <title>MoSPI Real-Time Airfare Price Index for India | SIH 2026</title>
        <meta
          name="description"
          content="Ministry of Statistics & Programme Implementation (MoSPI) Real-Time Airfare Price Index for CPI Augmentation. Smart India Hackathon 2026."
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#080c14] text-slate-100 min-h-screen flex antialiased selection:bg-sky-500 selection:text-slate-950">
        <AuthProvider>
          {/* Government Intelligence Left Sidebar */}
          <Sidebar isPresentationMode={isPresentationMode} />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 min-h-screen">
            {/* Top Application Header */}
            <Header
              isPresentationMode={isPresentationMode}
              setIsPresentationMode={setIsPresentationMode}
            />

            {/* Page Routing Container */}
            <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
