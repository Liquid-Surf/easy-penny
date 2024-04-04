import Link from "next/link";
import { VscTwitter } from "react-icons/vsc";
import { SiMastodon, SiGitlab } from "react-icons/si";
import { getExplorePath } from "../functions/integrate";
import { useL10n } from "../hooks/l10n";
import { ClientLocalized } from "./ClientLocalized";

interface Props {}

export const Footer = (props: Props) => {
  const l10n = useL10n();

  return (
    <>
      <footer className="px-8 py-14">
        <div className="flex items-center justify-center space-x-3 border-t-2 border-gray-50 pt-10 text-gray-700">
          <ClientLocalized
            id="footer-author"
            elems={{
              "author-link": (
                <a
                  href="https://VincentTunru.com"
                  className="border-b-2 border-gray-700 hover:border-b-4 hover:text-gray-900 focus:bg-gray-700 focus:text-white focus:outline-none"
                />
              ),
            }}
          >
            <span>By Vincent Tunru.</span>
          </ClientLocalized>
          <a
            href="https://gitlab.com/liquid-solid/ui/"
            title={l10n.getString("gitlab-tooltip")}
            className="rounded border-2 border-white p-2 text-gray-500 hover:border-gray-700 hover:text-gray-700 focus:border-gray-700 focus:text-gray-700 focus:outline-none"
          >
            <SiGitlab aria-label={l10n.getString("gitlab-label")} />
          </a>
        </div>
      </footer>
    </>
  );
};
