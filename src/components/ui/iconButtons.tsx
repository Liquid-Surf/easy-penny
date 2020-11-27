import { FC, HTMLAttributes } from "react";
import { MdClose } from "react-icons/md";

export const CloseButton: FC<HTMLAttributes<HTMLButtonElement>> = (props) => {
  const className = `text-2xl p-2 rounded border-2 border-white hover:border-blueGray-200 focus:border-blueGray-200 ${props.className ?? ""}`;

  return (
    <button
      aria-label="Close"
      {...props}
      className={className}
    ><MdClose/></button>
  );
};
