import { useSessionInfo } from "./sessionInfo";
import { CachedDataset, useDataset } from "./resource";

export function useProfileDoc(): CachedDataset | null {
  const sessionInfo = useSessionInfo();
  const profileDoc = useDataset(sessionInfo?.webId ?? null);

  return profileDoc;
}
