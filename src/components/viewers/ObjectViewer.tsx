import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  type?: JSX.Element;
  options?: Array<{
    element: JSX.Element;
    callback: () => void;
    when?: boolean;
  }>;
}

export const ObjectViewer = (props: Props) => {
  const type = props.type ? (
    <div className="flex-shrink flex flex-col justify-center">
      <div className="p-2 mr-1 text-gray-500 w-10">{props.type}</div>
    </div>
  ) : null;

  const options = props.options ? (
    <ul className="flex-shrink flex">
      {props.options
        .filter((option) => typeof option.when === "undefined" || option.when)
        .map((option, i) => (
          <li key={`objectOption${i}`}>
            <button
              onClick={(e) => {
                e.preventDefault();
                option.callback();
              }}
              className="ml-1 border-2 border-gray-50 hover:bg-gray-700 hover:text-white p-3 rounded-lg block focus:border-gray-700 focus:outline-none"
            >
              {option.element}
            </button>
          </li>
        ))}
    </ul>
  ) : null;

  return (
    <div className="flex p-2">
      {type}
      <div className="flex-grow overflow-x-auto w-0 bg-white p-2 rounded-lg">
        {props.children}
      </div>
      {options}
    </div>
  );
};
