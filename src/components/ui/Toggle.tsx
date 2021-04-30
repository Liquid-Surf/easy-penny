import { VisuallyHidden } from '@react-aria/visually-hidden';
import { useToggleState } from '@react-stately/toggle';
import { useFocusRing } from '@react-aria/focus';
import { useSwitch } from '@react-aria/switch';
import { ChangeEventHandler, FC, useRef } from 'react';

interface Props {
  onChange: (on: boolean) => void;
  toggled: boolean;
}
export const Toggle: FC<Props> = (props) => {
  let state = useToggleState({ isSelected: props.toggled });
  let ref = useRef<HTMLInputElement>(null);
  let {inputProps} = useSwitch(props, state, ref);
  let {isFocusVisible, focusProps} = useFocusRing();
  state.setSelected(props.toggled);

  const onChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    event.preventDefault();

    props.onChange(event.target.checked);
  };

  return (
    <label className="cursor-pointer flex items-center group">
      <VisuallyHidden>
        <input {...inputProps} {...focusProps} ref={ref} onChange={onChange} />
      </VisuallyHidden>
      <div className={`${
          state.isSelected ? "bg-coolGray-700 ring-lightBlue-50 group-hover:bg-coolGray-500" : "bg-gray-200 ring-coolGray-700 group-hover:bg-coolGray-300"
        } ${
          isFocusVisible ? "ring-4" : "ring-0"
        } cursor-pointer relative inline-flex items-center h-6 rounded-xl w-11`}>
        <span
          className={`${
            state.isSelected ? "translate-x-6 rtl:-translate-x-6" : "translate-x-1 rtl:-translate-x-1"
          } inline-block w-4 h-4 transform motion-safe:transition-transform duration-100 bg-white rounded-xl`}
        />
      </div>
      <span className="pl-2">{props.children}</span>
    </label>
  );
};
