import * as React from "react";
import { useRouter } from "next/router";
import { Explorer } from "../../components/Explorer";

const Explore: React.FC = () => {
  const router = useRouter();
  const url = (router.query.url as string[] ?? []).join("/");

  return <Explorer url={url}/>;
};

export default Explore;
