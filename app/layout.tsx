import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "族谱 SaaS",
  description: "多家族族谱 SaaS",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <div className="container">{children}</div>
      </body>
    </html>
  );
}
