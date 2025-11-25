"use client";

import { IconButton, useColorMode } from "@chakra-ui/react";
import { FiMoon, FiSun } from "react-icons/fi";

export function ThemeToggle() {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <IconButton
      aria-label="Toggle color mode"
      icon={colorMode === "light" ? <FiMoon /> : <FiSun />}
      variant="ghost"
      onClick={toggleColorMode}
    />
  );
}

