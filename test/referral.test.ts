import { JsonRpcProvider } from "@ethersproject/providers";
import { ethers } from "ethers";
import { APIReferralCodeSelectionPayload } from "../src/nodeSDKTypes";
import PerpetualDataHandler from "../src/perpetualDataHandler";
import ReferralCodeSigner from "../src/referralCodeSigner";

let pk: string;
let RPC: string;
let wallet: ethers.Wallet;
let codeSigner: ReferralCodeSigner;
let rc: APIReferralCodeSelectionPayload;

jest.setTimeout(150000);

describe("referralCodeSigner", () => {
  beforeAll(() => {
    pk = <string>process.env.PK;
    if (pk == undefined) {
      throw new Error('PK not defined: export PK="pk-without-0x-prefix"');
    }
    RPC = <string>process.env.RPC;
    const config = PerpetualDataHandler.readSDKConfig("zkevmTestnet");
    if (RPC != undefined) {
      config.nodeURL = RPC;
    } else {
      RPC = config.nodeURL;
    }
    wallet = new ethers.Wallet(pk);
    rc = {
      code: "ABCD",
      traderAddr: wallet.address,
      createdOn: 1696166434,
      signature: "",
    };
  });

  it("init with pk", async () => {
    codeSigner = new ReferralCodeSigner(pk, wallet.address, RPC);
    let S = await codeSigner.getSignatureForCodeSelection(rc);
    console.log(S);
    rc.signature = S;
    if (!(await ReferralCodeSigner.checkCodeSelectionSignature(rc))) {
      throw Error("ops didn't fly");
    }
  });

  it("init with signer", async () => {
    const signer = wallet.connect(new JsonRpcProvider(RPC));
    codeSigner = new ReferralCodeSigner(signer, wallet.address, RPC);
    let S = await codeSigner.getSignatureForCodeSelection(rc);
    console.log(S);
  });

  it("init with signing function", async () => {
    const signer = wallet.connect(new JsonRpcProvider(RPC));
    const signingFun = (x: string | Uint8Array) => signer.signMessage(x);
    codeSigner = new ReferralCodeSigner(signingFun, wallet.address, RPC);
    let S = await codeSigner.getSignatureForCodeSelection(rc);
    console.log(S);
  });
});
