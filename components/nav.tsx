"use client"
import Image from "next/image";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import { Button } from "@/components/ui/button"
import Link from "next/link";
import { Menu } from "lucide-react";
import { useState } from "react";
import { motion } from "motion/react";


export default function Nav() {
    const [isOpen, setIsOpen] = useState(false);
    
    return(
        <div>

                
            <nav className="sm:flex fixed hidden items-center justify-center gap-20 px-10 w-screen py-5 bg-gradient-to-b from-background to-transparent font-rethink-sans font-extrabold">
                <Image src="/logo.svg" alt="Logo" width={30} height={30} priority className="object-cover " />
                <div className="">
                    <NavigationMenu>
                        <NavigationMenuList>
                            <NavigationMenuItem>
                                <Button variant="ghost" asChild>
                                    <Link href="#" className="text-foreground">home</Link>
                                </Button>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <Button variant="ghost" asChild>
                                    <Link href="/docs" className="text-foreground">case files</Link>
                                </Button>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <Button variant="ghost" asChild>
                                    <Link href="/docs" className="text-foreground">daughters of dissent</Link>
                                </Button>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <Button variant="ghost" asChild>
                                    <Link href="/docs" className="text-foreground">signals</Link>
                                </Button>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <Button variant="ghost" asChild>
                                    <Link href="/docs" className="text-foreground">graffiti wall</Link>
                                </Button>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <Button variant="ghost" asChild>
                                    <Link href="/docs" className="text-foreground">about</Link>
                                </Button>
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>
            </nav>

            <nav className="sm:hidden fixed flex items-center justify-between px-10 py-7 gap-20 w-screen bg-gradient-to-b from-background to-transparent font-rethink-sans font-extrabold">
                <Menu onClick={() => setIsOpen(!isOpen)} />
                <Image src="/logo.svg" alt="Logo" width={30} height={30} priority className="object-cover " />
            </nav>
            <motion.div
                initial={{ x: "-100vw" }}
                animate={{ x: isOpen ? 0 : "-100vw" }}
                exit={{ x: "-100vw" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className={`fixed top-0 left-0 w-1/3 h-screen z-20 flex`}
                style={{ pointerEvents: isOpen ? "auto" : "none" }}
            >
                <div className="bg-background w-full h-screen"></div>

            </motion.div>
            {isOpen && (<motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={`w-screen absolute right-0 z-10 h-screen bg-transparent backdrop-blur-xl`} 
                onClick={() => setIsOpen(false)}/>
                 
            )}
        </div>
    )
}