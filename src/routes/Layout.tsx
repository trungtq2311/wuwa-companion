import { Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { TopNav } from "@/components/TopNav";
import { Loading } from "@/components/Loading";
import { UpdateBanner } from "@/components/UpdateBanner";

export function Layout() {
  const location = useLocation();

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden">
      <UpdateBanner />
      <TopNav />
      <main className="relative flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="mx-auto max-w-[1200px] px-4 py-5 sm:px-6 sm:py-6"
          >
            <Suspense fallback={<Loading />}>
              <Outlet />
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
