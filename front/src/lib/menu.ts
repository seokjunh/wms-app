import { Box, ChartArea, SquareKanban, Truck } from "lucide-react";

export const menu = [
  {
    title: "대시보드",
    url: "/",
    icon: ChartArea,
    isActive: false,
  },
  {
    title: "입고",
    icon: Truck,
    isActive: false,
    items: [
      {
        title: "입고 예정",
        url: "/inbound/plan",
      },
    ],
  },
  {
    title: "재고",
    icon: Box,
    isActive: false,
    items: [
      {
        title: "Genesis",
        url: "/",
      },
      {
        title: "Explorer",
        url: "/",
      },
      {
        title: "Quantum",
        url: "/",
      },
    ],
  },
  {
    title: "출고",
    icon: Truck,
    isActive: false,
    items: [
      {
        title: "Introduction",
        url: "/",
      },
      {
        title: "Get Started",
        url: "/",
      },
      {
        title: "Tutorials",
        url: "/",
      },
      {
        title: "Changelog",
        url: "/",
      },
    ],
  },
  {
    title: "통계",
    icon: SquareKanban,
    isActive: false,
    items: [
      {
        title: "Introduction",
        url: "/",
      },
      {
        title: "Get Started",
        url: "/",
      },
      {
        title: "Tutorials",
        url: "/",
      },
      {
        title: "Changelog",
        url: "/",
      },
    ],
  },
];
