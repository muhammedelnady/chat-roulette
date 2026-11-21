/** @format */

import { defaultShouldDehydrateMutation } from "@tanstack/react-query";
import {
  PersistQueryClientProvider,
  type PersistQueryClientOptions,
} from "@tanstack/react-query-persist-client";
import React from "react";

import { log } from "@/src/infrastructure/logging/logger";

import { DEFAULT_GC_TIME, queryClient, queryPersister } from "./queryClient";

export interface QueryProviderProps {
  readonly children: React.ReactNode;
}

const persistOptions: Omit<PersistQueryClientOptions, "queryClient"> = {
  persister: queryPersister,
  maxAge: DEFAULT_GC_TIME,
  buster: "1.0.0",
  dehydrateOptions: {
    shouldDehydrateQuery: (query) => query.gcTime !== 0,
    shouldDehydrateMutation: (mutation) => defaultShouldDehydrateMutation(mutation),
  },
};

export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={persistOptions}
      onSuccess={() => {
        log.info("[QueryClient] Hydrated from MMKV -> resuming paused mutations");
        void queryClient.resumePausedMutations();
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
