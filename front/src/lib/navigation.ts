import { menu } from "./menu";

export const getBreadcrumbItems = (pathname: string) => {
  for (const item of menu) {
    if (item.url === pathname) {
      return [item];
    }

    if (item.items) {
      for (const sub of item.items) {
        if (sub.url === pathname) {
          return [item, sub];
        }
      }
    }
  }

  return [];
};
