import "./globals.css";
import BgProvider from "./components/ui/bg-provider";

export const metadata = {
  title: {
    template: "%s | Multimedia App",
    default: "Multimedia App"
  },
  description: "Multimedia Manager",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
