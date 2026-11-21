/** @format */

import type { ReactNode } from "react";

import { UseCasesProvider } from "@/src/di/UseCasesProvider";

interface AppUseCasesProviderProps {
  readonly children: ReactNode;
}

export function AppUseCasesProvider({ children }: AppUseCasesProviderProps) {
  return <UseCasesProvider>{children}</UseCasesProvider>;
}
