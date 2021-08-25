import { getEffectiveAccess } from "@inrupt/solid-client";
import { FC } from "react";
import { hasAccess } from "../functions/hasAccess";

interface Props {
  access: Array<keyof ReturnType<typeof getEffectiveAccess>['user']>;
  resource: Parameters<typeof getEffectiveAccess>[0];
};

export const HasAccess: FC<Props> = (props) => {
  const hasRequiredAccess = hasAccess(props.resource, props.access);

  if (!hasRequiredAccess) {
    return null;
  }

  return <>{props.children}</>;
};
