"use client"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu"
import Image from "next/image"
import React, { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { usePathname, useRouter } from "next/navigation"
import { AnimatePresence, motion, type Transition, type Variants } from "framer-motion"
import { Menu, X } from "lucide-react"

const defaultEasing: [number, number, number, number] = [0.19, 1, 0.22, 1]

const navRevealVariants: Variants = {
  hidden: { opacity: 0, y: -18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: defaultEasing } }
}

const mobileLinkVariants: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.32, ease: defaultEasing } },
  exit: { opacity: 0, x: 30, transition: { duration: 0.2, ease: "easeInOut" } }
}

const pillTransition: Transition = { type: "spring", stiffness: 360, damping: 28 }

export default function Navbar() {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [hasScrolled, setHasScrolled] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const tabs = [
    { label: "home", href: "/" },
    { label: "case files", href: "/case-files" },
    { label: "daughters of dissent", href: "/daughters-of-dissent" },
    { label: "signals", href: "/signals" },
    { label: "hall of noise", href: "/hall-of-noise" },
    { label: "sponsors", href: "/sponsors" }
  ]

  const selectedTab =
    tabs.find((tab) => (tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href)))?.label ?? tabs[0].label

  useEffect(() => {
    const updateScrolledState = () => setHasScrolled(window.scrollY > 18)
    updateScrolledState()
    window.addEventListener("scroll", updateScrolledState)
    return () => window.removeEventListener("scroll", updateScrolledState)
  }, [])

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.setProperty("overflow", "hidden")
    } else {
      document.body.style.removeProperty("overflow")
    }
    return () => {
      document.body.style.removeProperty("overflow")
    }
  }, [isMobileMenuOpen])

  return (
    <>
      <motion.div
        variants={navRevealVariants}
        initial="hidden"
        animate="show"
        className="fixed top-0 left-0 z-40 hidden w-screen justify-center px-4 sm:flex"
      >
        <motion.div
          layout
          className={cn(
            "mt-4 flex w-full max-w-6xl items-center justify-center rounded-full border px-8 py-4 transition-all duration-300 ease-out",
            hasScrolled
              ? "border-white/15 bg-[rgba(10,10,10,0.88)] shadow-[0_22px_55px_rgba(0,0,0,0.55)] backdrop-blur-xl"
              : "border-white/8 bg-[rgba(10,10,10,0.62)] shadow-[0_16px_45px_rgba(0,0,0,0.42)] backdrop-blur-lg"
          )}
        >
          <NavigationMenu className="flex flex-row items-center justify-center uppercase">
            <NavigationMenuList className="flex w-full items-center gap-5 before:pointer-events-none before:absolute before:inset-x-0 before:-bottom-5 before:hidden before:h-px before:bg-gradient-to-r before:from-white/0 before:via-white/35 before:to-white/0 before:xl:block">
              {/* <NavigationMenuItem>
                <motion.div
                  whileHover={{ rotate: -6 }}
                  transition={{ type: "spring", stiffness: 220, damping: 12 }}
                  className="mr-8"
                >
                  <Image src="/logo.svg" alt="logo" width={32} height={32} className="rounded-full object-cover" priority />
                </motion.div>
              </NavigationMenuItem> */}
              {tabs.map((tab) => {
                const isActive = selectedTab === tab.label
                return (
                  <NavigationMenuItem key={tab.label} className="relative hover:cursor-pointer">
                    <NavigationMenuLink
                      onClick={() => router.push(tab.href)}
                      className={cn(
                        navigationMenuTriggerStyle(),
                        "relative overflow-hidden rounded-full px-3 py-2 text-xs uppercase tracking-[0.3em] text-white/65 transition duration-200 hover:text-white/85 focus-visible:ring-0 focus-visible:ring-offset-0"
                      )}
                    >
                      <motion.span
                        className="relative z-10 block"
                        whileHover={{ y: -1 }}
                        transition={{ duration: 0.18 }}
                      >
                        {tab.label}
                      </motion.span>
                      {isActive && (
                        <motion.span
                          layoutId="pill-tab"
                          transition={pillTransition}
                          className="absolute inset-0 z-0 rounded-full border border-white/45 bg-gradient-to-r from-white/30 via-white/15 to-white/25 shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
                        />
                      )}
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                )
              })}
            </NavigationMenuList>
          </NavigationMenu>
        </motion.div>
      </motion.div>

      <motion.button
        type="button"
        aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={isMobileMenuOpen}
        onClick={() => setMobileMenuOpen((prev) => !prev)}
        className="fixed top-5 left-5 z-50 flex items-center justify-center rounded-lg border border-white/20 bg-[rgba(12,12,12,0.75)] p-2 text-white shadow-[0_18px_32px_rgba(0,0,0,0.4)] backdrop-blur-md transition hover:border-white/35 sm:hidden"
        whileTap={{ scale: 0.92 }}
        whileHover={{ scale: 1.05 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={isMobileMenuOpen ? "close" : "open"}
            initial={{ opacity: 0, rotate: -10 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 10 }}
            transition={{ duration: 0.18 }}
          >
            {isMobileMenuOpen ? <X size={17} /> : <Menu size={17} />}
          </motion.span>
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 flex w-screen items-stretch justify-end bg-[rgba(6,6,6,0.58)] backdrop-blur-lg sm:hidden"
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="relative flex h-full w-[min(88vw,20rem)] flex-col gap-8 border-l border-white/12 bg-[rgba(12,12,12,0.94)] px-6 pb-10 pt-16 shadow-[0_20px_50px_rgba(0,0,0,0.55)]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center w-full justify-end">
                <div className="flex items-center justify-around w-max gap-3">
                  <span className="text-sm uppercase tracking-[0.45em] text-right text-white/60">Generation <br />Uprising</span>
                  <Image src="/logo.svg" alt="logo" width={28} height={28} className="rounded-full object-cover" priority />
                </div>
              </div>

              <motion.ul
                className="flex flex-col gap-2"
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={{
                  hidden: { transition: { staggerChildren: 0.06, staggerDirection: -1 } },
                  visible: { transition: { staggerChildren: 0.08 } }
                }}
              >
                {tabs.map((tab) => {
                  const isActive = selectedTab === tab.label
                  return (
                    <motion.li key={tab.label} variants={mobileLinkVariants}>
                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false)
                          router.push(tab.href)
                        }}
                        className={cn(
                          "w-full rounded-2xl border px-5 py-3 text-left text-[0.75rem] uppercase tracking-[0.4em] transition",
                          isActive
                            ? "border-white/45 bg-white/15 text-white"
                            : "border-white/12 bg-white/5 text-white/70 hover:border-white/25 hover:bg-white/10 hover:text-white"
                        )}
                      >
                        {tab.label}
                      </button>
                    </motion.li>
                  )
                })}
              </motion.ul>

              {/* <div className="mt-auto space-y-2 text-[0.65rem] uppercase tracking-[0.35em] text-white/45">
                <p>Broadcasting nightly</p>
                <p>Stay tuned for signals.</p>
              </div> */}

              <motion.span
                aria-hidden
                className="pointer-events-none absolute inset-x-8 bottom-8 h-24 rounded-full bg-gradient-to-b from-white/12 to-transparent blur-3xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}



