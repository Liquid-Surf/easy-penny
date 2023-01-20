import * as React from "react";
import { useRouter } from "next/router";
import { Loading } from "../components/Loading";
import { TurtleViewer } from "../components/viewers/TurtleViewer";
import { SWRConfig } from "swr";

const Turtle: React.FC = () => {
  const router = useRouter();
  const url = router.query.url;

  if (typeof url !== "string") {
    return <Loading />;
  }

  // We need a separate SWR cache provider because <TurtleViewer> does not parse the Resource
  // into a SolidDataset. So when the same URL is loaded in the <DatasetViewer>,
  // it shouldn't come from the <TurtleViewer>s cache:
  return (
    <SWRConfig value={{ provider: () => new Map() }}>
      <TurtleViewer url={url} />
    </SWRConfig>
  );
};

export default Turtle;
