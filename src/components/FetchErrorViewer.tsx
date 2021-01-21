import { FetchError } from "@inrupt/solid-client";
import { FC } from "react";
import { ConnectForm } from "./ConnectForm";
import { LoggedOut } from "./LoggedOut";

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
        <div className="bg-red-700 text-white p-5">
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

  return <>An unknown error ({props.error.statusCode}) occurred.</>;
};