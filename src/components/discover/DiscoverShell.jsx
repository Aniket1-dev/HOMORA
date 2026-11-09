import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import DiscoverHeader from "@/components/discover/DiscoverHeader";
import DiscoverFooter from "@/components/discover/DiscoverFooter";
import DiscoverBottomNav from "@/components/discover/DiscoverBottomNav";
import { initTheme } from "@/lib/theme";

export default function DiscoverShell() {
  const { pathname } = useLocation();

  useEffect(() => {
    initTheme();
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <DiscoverHeader />
      <main key={pathname} className="flex-1">
        <Outlet />
      </main>
      <DiscoverFooter />
      <DiscoverBottomNav />
    </div>
  );
}