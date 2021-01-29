import { UrlString } from "@inrupt/solid-client";
import { FC, Fragment } from "react";
import Link from "next/link";
import { MdEdit } from "react-icons/md";
import { getExplorePath } from "../functions/integrate";
import { NotIntegrated } from "./integrated/NotIntegrated";

interface Props {
  location: UrlString;
  onEdit: () => void;
}

export const LocationBar: FC<Props> = (props) => {
  const url = new URL(props.location);

  const pathParts = url.pathname.split("/");
  const pathElements = pathParts.map((resourceName, i) => {
    let pathUrl = url.origin + pathParts.slice(0, i + 1).join("/");
    if (pathUrl.length < props.location.length) {
      pathUrl += "/";
    }
    const locationUrl = new URL(props.location);
    locationUrl.hash = "";
    const isCurrent = pathUrl === locationUrl.href || pathUrl === locationUrl.href + "/";
    const activeFileNameClass = isCurrent ? "font-bold" : "hidden lg:inline"
    const activeSeparatorClass = isCurrent ? "" : "hidden lg:inline"
    return (
      <Fragment key={pathUrl + "_fragment"}>
        <span key={pathUrl + "_separator"} className={`mx-1 ${activeSeparatorClass}`}>/</span>
        <wbr key={pathUrl + "_lineBreakOpportinity"}/>
        <Link
          key={pathUrl + "_breadcrumb"}
          href={getExplorePath(pathUrl)}
        >
          <a key={pathUrl + "_breadcrumbLink"} className={`focus:underline focus:text-coolGray-700 focus:outline-none break-words ${activeFileNameClass}`}>{resourceName}</a>
        </Link>
      </Fragment>
    );
  }).slice(1, url.pathname.endsWith("/") ? pathParts.length - 1 : pathParts.length);

  let parentPath = url.pathname.endsWith("/")
    ? url.pathname.substring(0, url.pathname.substring(0, url.pathname.length - 1).lastIndexOf("/") + 1)
    : url.pathname.substring(0, url.pathname.lastIndexOf("/") + 1);
  if (parentPath === "/") {
    // The origin does not have a trailing slash to indicate that it's a Container:
    parentPath = "";
  }

  // On small screens, we display a "go to parent" link rather than the full path,
  // unless we're at the origin, of course.
  const parentNavigatorClass = pathElements.length >= 1
    ? "lg:hidden"
    : "hidden";
  const originClass = pathElements.length >= 1
    ? "hidden lg:inline"
    : "font-bold";

  return (
    <>
      <div className="flex items-center space-x-2">
        <span>
          <Link href={getExplorePath(url.origin + parentPath)}>
            <a
              className={`${parentNavigatorClass} focus:underline focus:text-coolGray-700 focus:outline-none break-words`}
              aria-hidden="true"
            >
              &hellip;
            </a>
          </Link>
          <Link key={url.origin + "_breadcrumb"} href={getExplorePath(url.origin)}>
            <a className={`${originClass} focus:underline focus:text-coolGray-700 focus:outline-none`}>{url.hostname}</a>
          </Link>
          {pathElements}
          <NotIntegrated>
            <button
              onClick={(e) => {e.preventDefault(); props.onEdit()}}
              title="View another Resource"
              className="text-coolGray-400 hover:text-coolGray-700 focus:text-coolGray-700 p-2 focus:outline-none focus:ring-2 focus:ring-coolGray-700 rounded"
            >
              <MdEdit aria-label="Change Resource URL"/>
            </button>
          </NotIntegrated>
        </span>
      </div>
    </>
  );
};