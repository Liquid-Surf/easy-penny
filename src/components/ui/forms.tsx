import { ChangeEventHandler, FC, InputHTMLAttributes } from "react";

const fieldClasses = "rounded-md p-1 focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 focus:outline-none focus:ring-opacity-50";

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> & { onChange: (val: string) => void };
export const TextField: FC<TextFieldProps> = (props) => {
  const onChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    e.preventDefault();

    props.onChange(e.target.value);
  };

  const className = `${props.className ?? ""} ${fieldClasses} border border-gray`;
  return (
    <input
      {...props}
      onChange={onChange}
      className={className}
    />
  );
};

type ButtonProps = InputHTMLAttributes<HTMLInputElement> & { value: string };
export const Button: FC<ButtonProps> = (props) => {
  const className = `${props.className ?? ""} ${fieldClasses} cursor-pointer bg-blueGray-100 focus:bg-blue-600 focus:text-white hover:bg-blue-600 hover:text-white`;
  return (
    <input
      {...props}
      type="button"
      className={className}
    />
  );
};

type SubmitButtonProps = InputHTMLAttributes<HTMLInputElement> & { value: string };
export const SubmitButton: FC<SubmitButtonProps> = (props) => {
  const className = `${props.className ?? ""} ${fieldClasses} cursor-pointer bg-blue-500 text-white focus:bg-blue-600 hover:bg-blue-600`;
  return (
    <input
      {...props}
      type="submit"
      className={className}
    />
  );
};
