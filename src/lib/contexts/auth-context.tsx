"use client";

import { createContext, useMemo, useState } from "react";

export const AuthContext = createContext({
  dialogOpen: false,
  setDialogOpen: (_open: boolean) => {
    void 0;
  },
});

export const AuthProvider = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const value = useMemo(() => ({ dialogOpen, setDialogOpen }), [dialogOpen]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
