"use client";

import { usePathname } from "next/navigation";
import { getBreadcrumbItems } from "@/lib/navigation";
import NotificationToggle from "./NotificationToggle";
import ThemeToggle from "./ThemeToggle";
import UserToggle from "./UserToggle";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";
import { SidebarTrigger } from "./ui/sidebar";

const Header = () => {
  const pathname = usePathname();
  const crumbs = getBreadcrumbItems(pathname);

  return (
    <header className="flex shrink-0 items-center justify-between">
      <div className="flex items-center gap-2">
        <SidebarTrigger size="default" />
        <Breadcrumb>
          <BreadcrumbList>
            {crumbs.map((crumb, index) => {
              const isLast = index === crumbs.length - 1;

              return (
                <div key={crumb.title} className="flex items-center">
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={crumb.url}>{crumb.title}</BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isLast && <BreadcrumbSeparator />}
                </div>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div>
        <NotificationToggle />
        <UserToggle />
        <ThemeToggle />
      </div>
    </header>
  );
};
export default Header;
