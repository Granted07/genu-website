"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const tabs = [
    { label: "HOME", href: "/" },
    { label: "CASE FILES", href: "/case-files" },
    { label: "DAUGHTERS OF DISSENT", href: "/daughters-of-dissent" },
    { label: "SIGNALS", href: "/signals" },
    { label: "HALL OF NOISE", href: "/hall-of-noise" },
    { label: "SPONSORS", href: "/sponsors" },
  ];

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const handleNavClick = (href: string) => {
    router.push(href);
    setMobileMenuOpen(false);
  };

  const isHomePage = pathname === "/";

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-[100] hidden lg:block px-8 pt-4">
        <div
          className={cn(
            "mx-auto px-8 py-6 transition-all duration-300 rounded-2xl",
            !isHomePage &&
              "bg-black/30 backdrop-blur-md shadow-lg shadow-black/20"
          )}
        >
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push("/")}
              className="flex cursor-pointer items-center gap-2 text-white hover:opacity-80 transition-opacity"
            >
              <Image
                src="/logo.svg"
                alt="Generation Uprising"
                width={24}
                height={24}
                className="rounded-full"
                priority
              />
              <span className="text-sm font-medium tracking-widest">
                GENERATION UPRISING
              </span>
            </button>

            <div className="flex items-center gap-8">
              {tabs.slice(1).map((tab) => {
                const isActive =
                  pathname === tab.href ||
                  (tab.href !== "/" && pathname.startsWith(tab.href));
                return (
                  <button
                    key={tab.href}
                    onClick={() => handleNavClick(tab.href)}
                    className={cn(
                      "relative text-[13px] font-normal tracking-wide transition-colors duration-200 cursor-pointer group",
                      isActive ? "text-white" : "text-white/60 hover:text-white"
                    )}
                  >
                    {tab.label}
                    <span
                      className={cn(
                        "absolute left-0 bottom-[-4px] h-[1px] bg-white transition-all duration-300 ease-out",
                        isActive ? "w-full" : "w-0 group-hover:w-full"
                      )}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-[100] lg:hidden",
          !isHomePage && "backdrop-blur-md bg-black/30"
        )}
      >
        <div className="flex items-center justify-between px-6 py-5">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-white"
          >
            <Image
              src="/logo.svg"
              alt="Generation Uprising"
              width={20}
              height={20}
              className="rounded-full"
              priority
            />
          </button>

          <button
            onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
            className="text-white p-2 hover:opacity-80 transition-opacity"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 z-[90] bg-black/30 backdrop-blur-lg lg:hidden"
          >
            <div className="flex flex-col h-full pt-20 px-6">
              <div className="flex flex-col gap-1">
                {tabs.map((tab, index) => (
                  <motion.button
                    key={tab.href}
                    initial={{ opacity: 0, x: -90 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.5 }}
                    onClick={() => handleNavClick(tab.href)}
                    className={cn(
                      "text-left py-3 px-4 text-md font-normal tracking-wide transition-colors border-b border-white/10",
                      pathname === tab.href ||
                        (tab.href !== "/" && pathname.startsWith(tab.href))
                        ? "text-white tracking-widest text-lg"
                        : "text-white/60"
                    )}
                  >
                    {tab.label}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
