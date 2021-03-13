import { FetchError } from "@inrupt/solid-client";
import { FC } from "react";
import { ConnectForm } from "../session/ConnectForm";
import { LoggedOut } from "../session/LoggedOut";

interface Props {
  error?: Error;
}

export const FetchErrorViewer: FC<Props> = (props) => {
  if (!props.error) {
    return null;
  }

  if (!(props.error instanceof FetchError)) {
    return <>An unknown error occurred.</>;
  }

  if (props.error.statusCode === 401) {
    return (
      <>
        <div className="bg-red-100 border-red-600 border-2 rounded p-5">
          You do not have permission to view this Resource.
        </div>
        <LoggedOut>
          <div className="pt-10">
            <div className="shadow p-5">
              <ConnectForm/>
            </div>
          </div>
        </LoggedOut>
      </>
    );
  }

  if (props.error.statusCode === 404) {
    return (
      <>
        <div className="bg-red-100 border-red-600 border-2 rounded p-5">
          This Resource does not exist.
        </div>
      </>
    );
  }

  return <>An unknown error ({props.error.statusCode}) occurred.</>;
};