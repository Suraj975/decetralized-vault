import React, { useState } from "react";

import CeramicClient from "@ceramicnetwork/http-client";
import ThreeIdResolver from "@ceramicnetwork/3id-did-resolver";

import { EthereumAuthProvider, ThreeIdConnect } from "@3id/connect";
import { DID } from "dids";
import * as IPFS from "ipfs-core";

export const endpoint = "https://ceramic-clay.3boxlabs.com";

export const useIpfs = () => {
  const [ipfs, setIpfs] = useState();

  React.useEffect(() => {
    const getIpfsInstance = async () => {
      const data = await IPFS.create({ repo: "ok" + Math.random() });
      setIpfs(data);
    };
    if (!ipfs) {
      getIpfsInstance();
    }
  }, []);

  return ipfs;
};

export async function connect() {
  if (!window) return;
  const addresses = await window.ethereum.request({
    method: "eth_requestAccounts",
  });
  return addresses;
}

export const useAccountCeramicConnection = async (config, setConfig) => {
  if (config) return;
  const [address] = await connect();
  const ceramic = new CeramicClient(endpoint);
  const threeIdConnect = new ThreeIdConnect();
  const getData = async () => {
    const provider = new EthereumAuthProvider(window.ethereum, address);
    await threeIdConnect.connect(provider);
    const did = new DID({
      provider: threeIdConnect.getDidProvider(),
      resolver: {
        ...ThreeIdResolver.getResolver(ceramic),
      },
    });

    ceramic.setDID(did);
    await ceramic.did.authenticate();
    setConfig({ ceramic, did, address });
  };
  await getData();
};