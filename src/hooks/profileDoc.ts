import { LoadedCachedDataset, useDataset } from "./dataset";
import { useSessionInfo } from "./sessionInfo";

export function useProfileDoc(): LoadedCachedDataset | null {
  const sessionInfo = useSessionInfo();
  const profileDoc = useDataset(sessionInfo?.webId ?? null);

  return profileDoc;
}
