"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { REPOSITORY_KEY } from "../constants";
import type { RepositoryContext as Repo } from "../types/dashboard";
import { extensionBridge } from "../services/extensionBridge";
import type { VaultSettings } from "../types/extension";

const Context = createContext<Repo | undefined>(undefined);

export function RepositoryProvider({ children }: { children: React.ReactNode }) {
  const params = useSearchParams();
  const [repo, setRepo] = useState<Repo>();

  useEffect(() => {
    const owner = params.get("owner");
    const name = params.get("repo");
    const next = owner && name ? { owner, repo: name } : (() => {
      try {
        return JSON.parse(localStorage.getItem(REPOSITORY_KEY) ?? "null") as Repo | null;
      } catch {
        return null;
      }
    })();

    if (next?.owner && next.repo) {
      localStorage.setItem(REPOSITORY_KEY, JSON.stringify(next));
      setRepo(next);
    } else {
      // Fallback: check if extension settings are already configured
      extensionBridge.ping().then((installed) => {
        if (installed) {
          extensionBridge.send<VaultSettings>("GET_SETTINGS").then((settings) => {
            if (settings && settings.owner && settings.repository) {
              const extRepo = { owner: settings.owner, repo: settings.repository };
              localStorage.setItem(REPOSITORY_KEY, JSON.stringify(extRepo));
              setRepo(extRepo);
            }
          }).catch(err => console.warn("Failed to fetch extension settings:", err));
        }
      });
    }
  }, [params]);

  return <Context.Provider value={repo}>{children}</Context.Provider>;
}

export const useRepository = () => useContext(Context);
