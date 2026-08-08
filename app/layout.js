import PWARegister from "./PWARegister";
import "./globals.css";

export const metadata = {
  title: "Resumindo Viagens - Formulário de Visto",
  description: "Formulário para inserção de dados para solicitação de Visto",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-64.png", sizes: "64x64", type: "image/png" }
    ],
    apple: [{ url: "/favicon-180.png", sizes: "180x180", type: "image/png" }]
  },
  manifest: "/manifest.json",
  themeColor: "#1f2a60",
  appleWebApp: { capable: true, title: "Resumindo Viagens", statusBarStyle: "default" }
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body><PWARegister />{children}</body>
    </html>
  );
}
