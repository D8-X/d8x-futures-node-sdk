import { defaultAbiCoder } from "@ethersproject/abi";
import { Signer } from "@ethersproject/abstract-signer";
import { keccak256 } from "@ethersproject/keccak256";
import { Provider, StaticJsonRpcProvider } from "@ethersproject/providers";
import { Wallet, verifyMessage } from "@ethersproject/wallet";
import { ZERO_ADDRESS } from "./constants";
import type { APIReferralCodePayload, APIReferralCodeSelectionPayload } from "./nodeSDKTypes";
import { BigNumber } from "ethers";

/**
 * This is a 'standalone' class that deals with signatures
 * required for referral codes:
 * - referrer creates a new referral code for trader (no agency involved)
 * - agency creates a new referral code for a referrer and their trader
 * - trader selects a referral code to trade with
 *
 * Note that since the back-end is chain specific, the referral code is typically bound to
 * one chain, unless the backend employs code transferrals
 */
export default class ReferralCodeSigner {
  private provider: Provider | undefined;
  private rpcURL: string;
  private signingFun: (x: string | Uint8Array) => Promise<string>;
  private address: string;

  constructor(
    signer: Signer | string | ((x: string | Uint8Array) => Promise<string>),
    address: string,
    _rpcURL: string
  ) {
    this.rpcURL = _rpcURL;
    this.address = address;
    if (typeof signer == "string") {
      const wallet = this.createSignerInstance(signer);
      this.signingFun = (x: string | Uint8Array) => wallet.signMessage(x);
    } else if (Signer.isSigner(signer)) {
      this.signingFun = (x: string | Uint8Array) => signer.signMessage(x);
    } else {
      this.signingFun = signer;
    }
  }

  public createSignerInstance(_privateKey: string): Signer {
    this.provider = new StaticJsonRpcProvider(this.rpcURL);
    const wallet = new Wallet(_privateKey);
    return wallet.connect(this.provider);
  }

  public async getSignatureForNewCode(rc: APIReferralCodePayload): Promise<string> {
    if (this.signingFun == undefined) {
      throw Error("no signer defined, call createSignerInstance()");
    }
    return await ReferralCodeSigner.getSignatureForNewCode(rc, this.signingFun);
  }

  public async getSignatureForCodeSelection(rc: APIReferralCodeSelectionPayload): Promise<string> {
    if (this.signingFun == undefined) {
      throw Error("no signer defined, call createSignerInstance()");
    }
    return await ReferralCodeSigner.getSignatureForCodeSelection(rc, this.signingFun);
  }

  public async getAddress(): Promise<string> {
    if (this.signingFun == undefined) {
      throw Error("no signer defined, call createSignerInstance()");
    }
    return this.address;
  }

  /**
   * rc.PassOnPercTDF must be in 100*percentage unit
   * @param rc APIReferralCodePayload without signature
   * @param signingFun function that signs
   * @returns signature string
   */
  public static async getSignatureForNewCode(
    rc: APIReferralCodePayload,
    signingFun: (x: string | Uint8Array) => Promise<string>
  ): Promise<string> {
    if (Math.abs(rc.PassOnPercTDF - Math.round(rc.PassOnPercTDF)) > 1e-4) {
      throw Error("rc.PassOnPercTDF must be in 100*percentage unit, e.g., 2.25% -> 225");
    }
    let digest = ReferralCodeSigner._referralCodeNewCodePayloadToMessage(rc);
    let digestBuffer = Buffer.from(digest.substring(2, digest.length), "hex");
    return await signingFun(digestBuffer);
  }

  public static async getSignatureForCodeSelection(
    rc: APIReferralCodeSelectionPayload,
    signingFun: (x: string | Uint8Array) => Promise<string>
  ): Promise<string> {
    let digest = ReferralCodeSigner._codeSelectionPayloadToMessage(rc);
    let digestBuffer = Buffer.from(digest.substring(2, digest.length), "hex");
    return await signingFun(digestBuffer);
  }

  /**
   * Create digest for referralCodePayload that is to be signed
   * @param rc payload
   * @returns the hex-string to be signed
   */
  private static _referralCodeNewCodePayloadToMessage(rc: APIReferralCodePayload): string {
    let abiCoder = defaultAbiCoder;
    const passOnPercTwoDigitsFormat = Math.round(rc.PassOnPercTDF);
    const agencyAddr = rc.agencyAddr == "" ? ZERO_ADDRESS : rc.agencyAddr;
    let digest = keccak256(
      abiCoder.encode(
        ["string", "address", "address", "uint32", "uint256"],
        [rc.code, rc.referrerAddr, agencyAddr, passOnPercTwoDigitsFormat, BigNumber.from(Math.round(rc.createdOn))]
      )
    );
    return digest;
  }

  /**
   * Create digest for APIReferralCodeSelectionPayload that is to be signed
   * @param rc payload
   * @returns the hex-string to be signed
   */
  private static _codeSelectionPayloadToMessage(rc: APIReferralCodeSelectionPayload): string {
    let abiCoder = defaultAbiCoder;
    let digest = keccak256(
      abiCoder.encode(["string", "address", "uint256"], [rc.code, rc.traderAddr, Math.round(rc.createdOn)])
    );
    return digest;
  }

  /**
   * Check whether signature is correct on payload:
   * - the referrer always signs
   * - if the agency is not an agency for this referrer, the backend will reject
   * @param rc referralcode payload with a signature
   * @returns true if correctly signed, false otherwise
   */
  public static async checkNewCodeSignature(rc: APIReferralCodePayload): Promise<boolean> {
    if (rc.signature == undefined || rc.signature == "") {
      return false;
    }
    try {
      let digest = ReferralCodeSigner._referralCodeNewCodePayloadToMessage(rc);
      let digestBuffer = Buffer.from(digest.substring(2, digest.length), "hex");
      const signerAddress = await verifyMessage(digestBuffer, rc.signature);
      return rc.referrerAddr.toLowerCase() == signerAddress.toLowerCase();
    } catch (err) {
      return false;
    }
  }

  public static async checkCodeSelectionSignature(rc: APIReferralCodeSelectionPayload): Promise<boolean> {
    if (rc.signature == undefined || rc.signature == "") {
      return false;
    }
    try {
      let digest = ReferralCodeSigner._codeSelectionPayloadToMessage(rc);
      let digestBuffer = Buffer.from(digest.substring(2, digest.length), "hex");
      const signerAddress = await verifyMessage(digestBuffer, rc.signature);
      return rc.traderAddr.toLowerCase() == signerAddress.toLowerCase();
    } catch (err) {
      return false;
    }
  }
}
