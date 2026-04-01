"use client";

import {
  createContext,
  use,
  useState,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from "react";

interface DashboardHeroStateValue {
  selectedId: number | null;
  setSelectedId: Dispatch<SetStateAction<number | null>>;
}

const DashboardHeroStateContext = createContext<DashboardHeroStateValue | null>(
  null,
);

interface DashboardHeroStateProviderProps {
  children: ReactNode;
  initialSelectedId: number | null;
}

export function DashboardHeroStateProvider({
  children,
  initialSelectedId,
}: DashboardHeroStateProviderProps) {
  const [selectedId, setSelectedId] = useState<number | null>(
    initialSelectedId,
  );

  return (
    <DashboardHeroStateContext value={{ selectedId, setSelectedId }}>
      {children}
    </DashboardHeroStateContext>
  );
}

export function useDashboardHeroState() {
  return use(DashboardHeroStateContext);
}
