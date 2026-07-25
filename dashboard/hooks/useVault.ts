"use client";
import { useQuery } from "@tanstack/react-query";
import { githubVault } from "../services/githubVault";
import type { RepositoryContext } from "../types/dashboard";

export const useVault = (repository?: RepositoryContext) => {
  const query = useQuery({
    queryKey: ["vault", repository],
    queryFn: () => githubVault.getVault(repository!),
    enabled: Boolean(repository),
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
  return { ...query, data: query.data as import("../types/dashboard").VaultData };
};

export const useProblem = (repository: RepositoryContext | undefined, folder?: string, language?: string) =>
  useQuery({
    queryKey: ["metadata", repository, folder, language],
    queryFn: () => githubVault.getProblem(repository!, folder!, language),
    enabled: Boolean(repository && folder),
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
