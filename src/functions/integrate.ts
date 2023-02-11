// These functions are useful for putting Penny in "integrate" mode,
// i.e. preinstalled on a Pod as its native interface.

export function isIntegrated(): boolean {
  return process.env.NEXT_PUBLIC_MODE === "integrate";
}

export function getExplorePath(url: string, hash?: string): string {
  const hashFragment = hash ? `#${hash}` : "";
  const targetUrl = new URL(url);
  return isIntegrated()
    ? // If running on the Pod, the target URL is on the app's own domain:
      targetUrl.pathname //+ targetUrl.search + hashFragment
    : // Otherwise, we have to pass the full target URL via a parameter:
      `/explore/?url=${encodeURIComponent(url)}` + hashFragment;
}

export function getAssetLink(assetPath: string): string {
  return isIntegrated() ? `/server-ui${assetPath}` : assetPath;
}

function getImageUrl(imageName: string): {};

async function getProfilePict(webid: string, file: string): string | null {
  const profileContainer = webid.split("/").slice(0, -1).join("/") + "/";
  const imgLocation = profileContainer + file;
  return await fetch(imgLocation, { method: "HEAD" })
    .then((response) => {
      if (response.ok) {
        return imgLocation;
      } else {
        return null;
      }
    })
    .catch((error) => null);
}

export function getAvatarPict(webid: string) {
  return getProfilePict(webid, "profile.png");
}
export function getBackgroundPict(webid: string) {
  return getProfilePict(webid, "background.png");
}
