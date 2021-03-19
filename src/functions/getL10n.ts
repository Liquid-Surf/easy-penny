
import { FluentBundle, FluentResource } from "@fluent/bundle";
import { negotiateLanguages } from "@fluent/langneg";
import { MarkupParser, ReactLocalization } from "@fluent/react";
import enGB from "../translations/en-GB.ftl";
import nlNL from "../translations/nl-NL.ftl";

export function getL10n() {
  // Store all translations as a simple object which is available 
  // synchronously and bundled with the rest of the code.
  const RESOURCES: Record<string, FluentResource> = {
    "nl-NL": new FluentResource(nlNL),
    "en-GB": new FluentResource(enGB),
  };
  
  // A generator function responsible for building the sequence 
  // of FluentBundle instances in the order of user's language
  // preferences.
  function* generateBundles(userLocales: typeof navigator.languages) {
    // Choose locales that are best for the user.
    const currentLocales = negotiateLanguages(
        userLocales as string[],
        ["en-GB", "nl-NL"],
        { defaultLocale: "en-GB" }
    );
  
    for (const locale of currentLocales) {
        const bundle = new FluentBundle(locale);
        bundle.addResource(RESOURCES[locale]);
        yield bundle;
    }
  }

  // To enable server-side rendering, all tags are converted to plain text nodes.
  // They will be upgraded to regular HTML elements in the browser:
  const parseMarkup: MarkupParser | undefined = typeof document === "undefined"
    ? (str: string) => [ { nodeName: "#text", textContent: str.replace(/\<(.*?)\>/g, "") } as Node ]
    : undefined;
  
  // The ReactLocalization instance stores and caches the sequence of generated
  // bundles. You can store it in your app's state.
  const l10n = new ReactLocalization(generateBundles(typeof navigator !== "undefined" ? navigator.languages : []), parseMarkup);
  return l10n;
}
