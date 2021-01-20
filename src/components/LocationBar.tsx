import { UrlString } from "@inrupt/solid-client";
import { FC, Fragment } from "react";
import Link from "next/link";
import { MdEdit } from "react-icons/md";

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
    const activeClass = pathUrl === locationUrl.href || pathUrl === locationUrl.href + "/" ? "font-bold" : ""
    return (
      <Fragment key={pathUrl + "_fragment"}>
        <span key={pathUrl + "_separator"} className="mx-1">/</span>
        <wbr key={pathUrl + "_lineBreakOpportinity"}/>
        <Link
          key={pathUrl + "_breadcrumb"}
          href={`/explore/${encodeURIComponent(pathUrl)}`}
        >
          <a key={pathUrl + "_breadcrumbLink"} className={`focus:underline focus:text-coolGray-700 focus:outline-none break-words ${activeClass}`}>{resourceName}</a>
        </Link>
      </Fragment>
    );
  }).slice(1, url.pathname.endsWith("/") ? pathParts.length - 1 : pathParts.length);

  return (
    <>
      <div className="flex items-center space-x-2">
        <span>
          <Link key={url.origin + "_breadcrumb"} href={`/explore/${encodeURIComponent(url.origin)}/`}>
            <a className="focus:underline focus:text-coolGray-700 focus:outline-none">{url.hostname}</a>
          </Link>
          {pathElements}
        </span>
        <button
          onClick={(e) => {e.preventDefault(); props.onEdit()}}
          title="View another Resource"
          className="text-coolGray-400 hover:text-coolGray-700 focus:text-coolGray-700 p-2 focus:outline-none focus:ring-2 focus:ring-coolGray-700 rounded"
        >
          <MdEdit aria-label="Change Resource URL"/>
        </button>
      </div>
    </>
  );
};