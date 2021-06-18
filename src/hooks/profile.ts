import { getThing, setThing, Thing, ThingPersisted } from "@inrupt/solid-client";
import { useCallback } from "react";
import { useSessionInfo } from "./sessionInfo";
import { useProfileDoc } from "./profileDoc";
import { isLoadedDataset } from "./dataset";

export function useProfile(): { data: ThingPersisted, save: (profile: Thing) => void } | null {
  const sessionInfo = useSessionInfo();
  const profileDoc = useProfileDoc();

  const update = useCallback((profile: Thing) => {
    if (!profileDoc || !isLoadedDataset(profileDoc)) {
      return;
    }

    const updatedProfileDoc = setThing(profileDoc.data, profile);
    profileDoc.save(updatedProfileDoc);
  }, [profileDoc]);

  if (profileDoc === null || !isLoadedDataset(profileDoc) || typeof sessionInfo?.webId === "undefined") {
    return null;
  }

  const profile = getThing(profileDoc.data, sessionInfo.webId);
  if (profile === null) {
    return null;
  }

  return {
    data: profile,
    save: update,
  };
}
