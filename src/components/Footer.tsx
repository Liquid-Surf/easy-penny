import Link from "next/link";
import { VscTwitter } from "react-icons/vsc";
import { SiMastodon, SiGitlab } from "react-icons/si";
import { getExplorePath } from "../functions/integrate";
import { useLocalization } from "@fluent/react";
import { ClientLocalized } from "./ClientLocalized";


export const Footer = (props: Props) => {
  const { l10n } = useLocalization();

  return (
    <>
        <footer className="px-8 py-14">
          <div className="flex items-center space-x-3 justify-center border-gray-50 border-t-2 pt-10 text-gray-700">
            <ClientLocalized
              id="footer-author"
              elems={{
                "author-link": (
                  <a
                    href="https://VincentTunru.com"
                    className="border-gray-700 border-b-2 hover:text-gray-900 hover:border-b-4 focus:outline-none focus:bg-gray-700 focus:text-white"
                  />
                ),
              }}
            >
              <span>By Vincent Tunru.</span>
            </ClientLocalized>
            <a
              href="https://gitlab.com/liquid-solid/ui/"
              title={l10n.getString("gitlab-tooltip")}
              className="text-gray-500 p-2 border-2 border-white rounded hover:text-gray-700 hover:border-gray-700 focus:outline-none focus:text-gray-700 focus:border-gray-700"
            >
              <SiGitlab aria-label={l10n.getString("gitlab-label")} />
            </a>
          </div>
        </footer>
    </>
  );
};


