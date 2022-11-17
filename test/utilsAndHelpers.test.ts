import { NodeSDKConfig } from "../src/nodeSDKTypes";
import PerpetualDataHandler from "../src/perpetualDataHandler";
import { to4Chars, toBytes4, fromBytes4, fromBytes4HexString } from "../src/utils";
let pk: string = <string>process.env.PK;
let RPC: string = <string>process.env.RPC;

jest.setTimeout(150000);

let config: NodeSDKConfig;

describe("utils", () => {
  it("read config", async function () {
    config = PerpetualDataHandler.readSDKConfig("../config/defaultConfig.json");
    if (RPC != undefined) {
      config.nodeURL = RPC;
    }
  });
  it("4Chars", async () => {
    let examples = ["MATIC", "FEDORA", "A", "AEIOUAEI", "D8X", "ARmAGEDON"];
    let solutions = ["MATC", "FEDR", "A\0\0\0", "AEIO", "D8X\0", "RmGD"];
    for (let k = 0; k < examples.length; k++) {
      let sol = to4Chars(examples[k]);
      let deencoded = fromBytes4(toBytes4(examples[k]));
      let bExpect = sol == solutions[k] && sol.replace(/\0/g, "") == deencoded;
      if (!bExpect) {
        console.log("example  =", examples[k]);
        console.log("solution =", sol);
        console.log("deencoded=", deencoded);
        console.log("expected =", solutions[k]);
      }
      expect(bExpect);
    }
  });
  it("contract bytes4 to string", async () => {
    let examples = ["0x4d415443", "0x55534400", "0x45544800", "0x42544300"];
    let solutions = ["MATC", "USD", "ETH", "BTC"];
    for (let k = 0; k < examples.length; k++) {
      let sol = fromBytes4HexString(examples[k]);
      let bExpect = sol == solutions[k];
      if (!bExpect) {
        console.log("example  =", examples[k]);
        console.log("solution =", sol);
        console.log("expected =", solutions[k]);
      }
      expect(bExpect);
    }
  });
});
