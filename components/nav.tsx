"use client"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import Image from "next/image"
import React, { useState } from "react";
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";



const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {

  
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-1 leading-none no-underline outline-hidden transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <div className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </div>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"

export default function Navbar() {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname();
  const router = useRouter();
  const tabs = [
    { label: "home", href: "/" },
    { label: "case files", href: "/case-files" },
    { label: "daughters of dissent", href: "/daughters-of-dissent" },
    { label: "signals", href: "/signals" },
    { label: "graffiti wall", href: "/graffiti-wall" },
    { label: "about", href: "/about" },
  ];
  const selectedTab = tabs.find(tab =>
    tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href)
  )?.label ?? "Home";

  return (
    <div className="">
      {/* Navbar */}
      <div className="flex-row fixed w-screen justify-center top-0 z-30 hidden items-center sm:flex">
        <NavigationMenu className="w-screen flex flex-row px-10 py-5 items-center justify-center bg-gradient-to-b from-background to-transparent">
          <NavigationMenuList className="gap-[50px] relative bg-trans">
            <NavigationMenuItem>
              <Image src={"/logo.svg"} alt={"logo"} width={30} height={30} className="rounded-full object-cover mr-10" />
            </NavigationMenuItem>
            {/* Tab links with animated pill indicator */}
            {tabs.map(tab => (
              <NavigationMenuItem key={tab.label} className="relative hover:cursor-pointer">
                <NavigationMenuLink
                  onClick={() => router.push(tab.href)}
                  className={navigationMenuTriggerStyle() + (selectedTab === tab.label ? "transition-colors text-white font-bold" : "")}
                >
                  <span className="relative z-10">{tab.label}</span>
                  {selectedTab === tab.label && (
                    <motion.span
                      layoutId="pill-tab"
                      transition={{ type: "spring", duration: 0.5 }}
                      className="absolute inset-0 z-0 border-foreground/30 bg-foreground/10 inset-shadow-foreground/10 rounded-md"
                    ></motion.span>
                  )}
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      

    </div>
  )
}



