import { Toaster } from "@/components/ui/sonner";
import { Outlet } from "react-router-dom";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/layout/CartDrawer";
import WhatsAppFloat from "@/components/layout/WhatsAppFloat";
import CookieBanner from "@/components/layout/CookieBanner";

// Shared chrome for every page: announcement ribbon, header, footer, drawer, floats, toasts.
export default function Layout() {
  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <AnnouncementBar />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <WhatsAppFloat />
      <CookieBanner />
      <Toaster offset={76} />
    </div>
  );
}
