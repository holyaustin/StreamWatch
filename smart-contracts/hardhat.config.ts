import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require('dotenv').config();


const config: HardhatUserConfig = {
  solidity: "0.8.30",
  networks: {
    somnia: {
      url: "https://dream-rpc.somnia.network",
      accounts: [ process.env.PRIVATE_KEY as string],
    },
  },
  sourcify: {
    enabled: false,
  },
  etherscan: {
    apiKey: {
      somnia: "empty",
    },
    customChains: [
      {
        network: "somnia",
        chainId: 50312,
        urls: {
          apiURL: "https://shannon-explorer.somnia.network/api",
          browserURL: "https://shannon-explorer.somnia.network",
        },
      },
    ],
  },
};
export default config;