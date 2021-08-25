import { useLocalization } from "@fluent/react";
import { useBeforeUnload } from "./beforeUnload";

export function useNavigationBlock(messageOrToggle: string | boolean) {
  const { l10n } = useLocalization();

	const beforeUnloadHandler: EventListener | undefined = (messageOrToggle !== false)
		? (event) => {
			event.preventDefault();
			if (typeof messageOrToggle === "string") {
				return l10n.getString(messageOrToggle);
			}
		}
		: undefined;

	return useBeforeUnload(beforeUnloadHandler);
}
