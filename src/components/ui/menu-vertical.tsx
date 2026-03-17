"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

type MenuItem = {
  label: string;
  href: string;
};

interface MenuVerticalProps {
  menuItems: MenuItem[];
  color?: string;
  skew?: number;
  onItemClick?: () => void;
}

const MotionLink = motion(Link);

export const MenuVertical = ({
  menuItems = [],
  color = "#ff6900",
  skew = 0,
  onItemClick,
}: MenuVerticalProps) => {
  return (
    <div className="flex w-full flex-col gap-4 px-1">
      {menuItems.map((item, index) => (
        <motion.div
          key={`${item.href}-${index}`}
          className="group/nav flex cursor-pointer items-center gap-2 text-zinc-900 dark:text-zinc-50"
          initial="initial"
          whileHover="hover"
        >
          <motion.div
            variants={{
              initial: { x: "-100%", color: "inherit", opacity: 0 },
              hover: { x: 0, color, opacity: 1 },
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="z-0"
          >
            <ArrowRight strokeWidth={3} className="size-7 sm:size-9" />
          </motion.div>

          <MotionLink
            href={item.href}
            onClick={onItemClick}
            variants={{
              initial: { x: -40, color: "inherit" },
              hover: { x: 0, color, skewX: skew },
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="text-2xl font-semibold leading-tight no-underline sm:text-4xl"
          >
            {item.label}
          </MotionLink>
        </motion.div>
      ))}
    </div>
  );
};
