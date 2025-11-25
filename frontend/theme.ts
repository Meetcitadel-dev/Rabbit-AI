import { extendTheme, ThemeConfig } from "@chakra-ui/react";

const config: ThemeConfig = {
  initialColorMode: "light",
  useSystemColorMode: false,
};

export const theme = extendTheme({
  config,
  fonts: {
    heading: `'Space Grotesk', Inter, sans-serif`,
    body: `'Inter', system-ui, sans-serif`,
  },
  colors: {
    brand: {
      50: "#eef2ff",
      100: "#dcd7ff",
      500: "#5E4AE3",
      600: "#4a3ab5",
      900: "#1a1140",
    },
  },
  styles: {
    global: (props: { colorMode: string }) => ({
      body: {
        bg: props.colorMode === "dark" ? "#050505" : "#f5f7fb",
        color: props.colorMode === "dark" ? "gray.100" : "gray.800",
      },
    }),
  },
});

export const themeConfig = config;

