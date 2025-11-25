import type { Metadata } from "next";
import "./globals.css";
import { ColorModeScript } from "@chakra-ui/react";
import { Providers } from "../components/Providers";
import { themeConfig } from "../theme";

export const metadata: Metadata = {
  title: "Talking Rabbitt",
  description: "Conversational analytics assistant for sales teams.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ColorModeScript initialColorMode={themeConfig.initialColorMode} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

