import { FC } from "react";
import { useSessionInfo } from "../../hooks/sessionInfo";

interface Props {
  type?: JSX.Element;
  options?: Array<{
    element: JSX.Element;
    callback: () => void;
    loggedIn?: boolean;
  }>;
}

export const ObjectViewer: FC<Props> = (props) => {
  const sessionInfo = useSessionInfo();

  const type = props.type
    ? <div className="flex-shrink flex flex-col justify-center">
        <div className="p-2 mr-1 text-coolGray-500 w-10">
          {props.type}
        </div>
      </div>
    : null;

  const options = props.options
    ? (
      <ul className="flex-shrink flex">
        {props.options.filter(option => !option.loggedIn || !!sessionInfo).map((option, i) => (
          <li
            key={`objectOption${i}`}
          >
            <button
              onClick={(e) => {e.preventDefault(); option.callback()}}
              className="ml-1 border-2 border-coolGray-50 hover:bg-coolGray-700 hover:text-white p-3 rounded-lg block focus:border-coolGray-700 focus:outline-none"
            >
              {option.element}
            </button>
          </li>
        ))}
      </ul>
    )
    : null;

  return (
    <div className="flex p-2">
      {type}
      <div className="flex-grow bg-white p-2 rounded-lg">
        {props.children}
      </div>
      {options}
    </div>
  );
};