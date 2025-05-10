import * as React from "react";
import Information from "./Information/Information";
import Servers from "./Server/Servers";

export interface IAsyncAPIProps {}

const AsyncAPI: React.FunctionComponent<IAsyncAPIProps> = ({ asyncapi }) => {
  console.log(asyncapi);
  return (
    <div>
      <Information {...asyncapi.info} />
      <Servers servers={asyncapi.servers} />
    </div>
  );
};

export default AsyncAPI;
