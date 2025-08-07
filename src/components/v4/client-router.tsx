"use client";

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  type ReactNode,
} from "react";

//-- 1. Context to hold the current path and navigation function
interface RouterContextType {
  currentPath: string;
  navigate: (to: string) => void;
}
const RouterContext = createContext<RouterContextType | null>(null);

//-- 2. The main Router Provider
export const ClientRouter = ({
  children,
  initialPath,
}: {
  children: ReactNode;
  initialPath: string;
}) => {
  const [currentPath, setCurrentPath] = useState(initialPath);

  // Listen to browser's back/forward buttons
  useEffect(() => {
    const onPopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const navigate = (to: string) => {
    window.history.pushState({}, "", to);
    setCurrentPath(to);
  };

  return (
    <RouterContext.Provider value={{ currentPath, navigate }}>
      {children}
    </RouterContext.Provider>
  );
};

export const useRouter = () => {
  const router = useContext(RouterContext);
  if (!router) throw new Error("useRouter must be used within a ClientRouter");
  return router;
};

//-- 3. The <Link> component
interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
}
export const Link = ({ to, children, ...props }: LinkProps) => {
  const router = useContext(RouterContext);
  if (!router) throw new Error("Link must be used within a ClientRouter");

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    router.navigate(to);
  };

  return (
    <a href={to} onClick={handleClick} {...props}>
      {children}
    </a>
  );
};

//-- 4. The <Routes> and <Route> components
const ParamsContext = createContext<Record<string, string> | null>(null);

interface RouteProps {
  path: string; // e.g., "/users/:id"
  component: React.ComponentType<any>;
}
export const Route = ({ path: _path, component: _Component }: RouteProps) => {
  return null;
};

export const Routes = ({ children }: { children: ReactNode }) => {
  const router = useContext(RouterContext);
  if (!router) throw new Error("Routes must be used within a ClientRouter");

  const childrenArray = React.Children.toArray(children);

  // Iterate through all <Route> children
  for (const child of childrenArray) {
    if (!React.isValidElement(child) || child.type !== Route) {
      // This allows <Routes> to have non-route elements like comments inside
      continue;
    }

    const { path, component: Component } = child.props as RouteProps;

    // --- The matching logic now lives here ---
    const paramNames: string[] = [];
    const regexPath = `^${path.replace(/:(\w+)/g, (_, paramName) => {
      paramNames.push(paramName);
      return "([^\\/]+)";
    })}/?$`; // Optional trailing slash

    const match = router.currentPath.match(new RegExp(regexPath));

    // If a match is found, render the component and stop searching
    if (match) {
      const params = paramNames.reduce(
        (acc, name, index) => {
          acc[name] = match[index + 1];
          return acc;
        },
        {} as Record<string, string>
      );

      return (
        <ParamsContext.Provider value={params}>
          <Component />
        </ParamsContext.Provider>
      );
    }
  }

  // If no route matched after checking all children, return null
  return null;
};

//-- 5. The useParams hook
export const useParams = () => {
  const params = useContext(ParamsContext);
  if (params === null) {
    // This can happen if a component using useParams is rendered outside a matching Route
    return {};
  }
  return params;
};
