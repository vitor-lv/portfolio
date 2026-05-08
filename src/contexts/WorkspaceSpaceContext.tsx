import { createContext, useCallback, useContext, useState } from "react";

export type Space = "itau" | "pessoal";

interface SpaceCtx {
  space: Space;
  setSpace: (s: Space) => void;
  k: (baseKey: string) => string;
}

const Ctx = createContext<SpaceCtx>({
  space: "itau",
  setSpace: () => {},
  k: (key) => key,
});

export function WorkspaceSpaceProvider({ children }: { children: React.ReactNode }) {
  const [space, setSpaceState] = useState<Space>(() => {
    return (localStorage.getItem("lv:active_space") as Space) || "itau";
  });

  function setSpace(s: Space) {
    setSpaceState(s);
    localStorage.setItem("lv:active_space", s);
  }

  const k = useCallback(
    (baseKey: string) =>
      space === "itau" ? baseKey : baseKey.replace("lv:", "lv:pessoal:"),
    [space]
  );

  return <Ctx.Provider value={{ space, setSpace, k }}>{children}</Ctx.Provider>;
}

export function useSpace() {
  return useContext(Ctx);
}

