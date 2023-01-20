import { useReducedMotion } from "framer-motion";
import { FC } from "react";
import { VscLoading } from "react-icons/vsc";

export const Spinner: FC = () => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <>Loading…</>;
  }

  return (
    <>
      <VscLoading aria-label="Loading…" size="2em" className="animate-spin" />
    </>
  );
};
