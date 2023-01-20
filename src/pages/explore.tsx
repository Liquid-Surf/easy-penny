import * as React from "react";
import { useRouter } from "next/router";
import { Explorer } from "../components/Explorer";
import { Loading } from "../components/Loading";

const Explore: React.FC = () => {
  const router = useRouter();
  const url = router.query.url;

  if (typeof url !== "string") {
    return <Loading />;
  }

  return <Explorer url={url} />;
};

export default Explore;
