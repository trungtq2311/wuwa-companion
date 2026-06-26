import { lazy } from "react";
import type { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { Layout } from "./Layout";

const DashboardPage = lazy(() =>
  import("@/features/dashboard/DashboardPage").then((m) => ({ default: m.DashboardPage })),
);
const ResonatorsPage = lazy(() =>
  import("@/features/resonators/ResonatorsPage").then((m) => ({ default: m.ResonatorsPage })),
);
const ResonatorDetailPage = lazy(() =>
  import("@/features/resonators/ResonatorDetailPage").then((m) => ({ default: m.ResonatorDetailPage })),
);
const ConvenePage = lazy(() =>
  import("@/features/convene/ConvenePage").then((m) => ({ default: m.ConvenePage })),
);
const NewsPage = lazy(() =>
  import("@/features/news/NewsPage").then((m) => ({ default: m.NewsPage })),
);
const NewsDetailPage = lazy(() =>
  import("@/features/news/NewsDetailPage").then((m) => ({ default: m.NewsDetailPage })),
);
const CodesPage = lazy(() =>
  import("@/features/codes/CodesPage").then((m) => ({ default: m.CodesPage })),
);
const BannersPage = lazy(() =>
  import("@/features/banners/BannersPage").then((m) => ({ default: m.BannersPage })),
);

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "resonators", element: <ResonatorsPage /> },
      { path: "resonators/:slug", element: <ResonatorDetailPage /> },
      { path: "convene", element: <ConvenePage /> },
      { path: "news", element: <NewsPage /> },
      { path: "news/:id", element: <NewsDetailPage /> },
      { path: "codes", element: <CodesPage /> },
      { path: "banners", element: <BannersPage /> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
];
