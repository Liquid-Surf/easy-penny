import { useSessionInfo } from "./sessionInfo";
import { CachedResource, useResource } from "./resource";

export function useProfileDoc(): CachedResource | null {
  const sessionInfo = useSessionInfo();
  const profileDoc = useResource(sessionInfo?.webId ?? null);

  return profileDoc;
}
