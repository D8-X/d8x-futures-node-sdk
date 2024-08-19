import { JsonRpcProvider, Wallet } from "ethers";
import { APIReferralCodeSelectionPayload, APIReferPayload, APIReferralCodePayload } from "../src/nodeSDKTypes";
import PerpetualDataHandler from "../src/perpetualDataHandler";
import ReferralCodeSigner from "../src/referralCodeSigner";

let pk: string;
let RPC: string;
let wallet: Wallet;
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
    const config = PerpetualDataHandler.readSDKConfig("cardona");
    if (RPC != undefined) {
      config.nodeURL = RPC;
    } else {
      RPC = config.nodeURL;
    }
    wallet = new Wallet(pk);
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
    if (!ReferralCodeSigner.checkCodeSelectionSignature(rc)) {
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
  it("signature for new code", async () => {
    let rcp: APIReferralCodePayload = {
      code: "ABCD",
      referrerAddr: wallet.address,
      createdOn: 1696166434,
      passOnPercTDF: 333,
      signature: "",
    };
    codeSigner = new ReferralCodeSigner(pk, wallet.address, RPC);
    let S = await codeSigner.getSignatureForNewCode(rcp);
    rcp.signature = S;
    console.log("new code");
    console.log(rcp);
  });
  it("signature for new referral", async () => {
    let rcp: APIReferPayload = {
      parentAddr: wallet.address,
      referToAddr: "0x863ad9ce46acf07fd9390147b619893461036194",
      passOnPercTDF: 225,
      createdOn: 1696166434,
      signature: "",
    };
    codeSigner = new ReferralCodeSigner(pk, wallet.address, RPC);
    let S = await codeSigner.getSignatureForNewReferral(rcp);
    rcp.signature = S;
    console.log("new referral = ", rcp);
  });
  it("signature for code selection", async () => {
    let ts = Math.round(Date.now() / 1000);
    let rcp: APIReferralCodeSelectionPayload = {
      code: "DOUBLE_AG",
      traderAddr: wallet.address,
      createdOn: ts,
      signature: "",
    };
    codeSigner = new ReferralCodeSigner(pk, wallet.address, RPC);
    let S = await codeSigner.getSignatureForCodeSelection(rcp);
    rcp.signature = S;
    console.log(rcp);
  });
});
