import {
  AbiCoder,
  JsonRpcProvider,
  keccak256,
  Provider,
  Signer,
  TypedDataDomain,
  TypedDataField,
  verifyMessage,
  verifyTypedData,
  Wallet,
} from "ethers";
import {
  APIReferPayload,
  APIReferralCodePayload,
  APIReferralCodeSelectionPayload,
  referralDomain,
  referralTypes,
} from "./nodeSDKTypes";

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
  private signingFun: ((x: string | Uint8Array) => Promise<string>) | undefined;
  private signingTypedDataFun:
    | ((
        domain: TypedDataDomain,
        types: Record<string, TypedDataField[]>,
        value: Record<string, any>
      ) => Promise<string>)
    | undefined;
  private address: string;

  constructor(
    signer:
      | Signer
      | string
      | ((x: string | Uint8Array) => Promise<string>)
      | ((
          domain: TypedDataDomain,
          types: Record<string, TypedDataField[]>,
          value: Record<string, any>
        ) => Promise<string>),
    address: string,
    _rpcURL: string
  ) {
    this.rpcURL = _rpcURL;
    this.address = address;
    if (typeof signer == "string") {
      const wallet = this.createSignerInstance(signer);
      this.signingFun = (x: string | Uint8Array) => wallet.signMessage(x);
      this.signingTypedDataFun = (
        domain: TypedDataDomain,
        types: Record<string, TypedDataField[]>,
        value: Record<string, any>
      ) => wallet.signTypedData(domain, types, value);
    } else if ("signMessage" in signer) {
      this.signingFun = (x: string | Uint8Array) => signer.signMessage(x);
      this.signingTypedDataFun = (
        domain: TypedDataDomain,
        types: Record<string, TypedDataField[]>,
        value: Record<string, any>
      ) => signer.signTypedData(domain, types, value);
    } else if (signer.length === 1) {
      this.signingFun = signer as (x: string | Uint8Array) => Promise<string>;
    } else {
      this.signingTypedDataFun = signer as (
        domain: TypedDataDomain,
        types: Record<string, TypedDataField[]>,
        value: Record<string, any>
      ) => Promise<string>;
    }
  }

  public createSignerInstance(_privateKey: string): Signer {
    this.provider = new JsonRpcProvider(this.rpcURL);
    const wallet = new Wallet(_privateKey);
    wallet.connect(this.provider);
    this.signingFun = (x: string | Uint8Array) => wallet.signMessage(x);
    this.signingTypedDataFun = (
      domain: TypedDataDomain,
      types: Record<string, TypedDataField[]>,
      value: Record<string, any>
    ) => wallet.signTypedData(domain, types, value);
    return wallet;
  }

  public async getSignatureForNewReferral(rp: APIReferPayload): Promise<string> {
    if (this.signingTypedDataFun != undefined) {
      return await this.signingTypedDataFun(
        referralDomain,
        {
          NewReferral: referralTypes.NewReferral,
        },
        ReferralCodeSigner.newReferralPayloadToTypedData(rp)
      );
    } else if (this.signingFun != undefined) {
      return await ReferralCodeSigner.getSignatureForNewReferral(rp, this.signingFun);
    } else {
      throw Error("no signer defined, call createSignerInstance()");
    }
  }

  public async getSignatureForNewCode(rc: APIReferralCodePayload): Promise<string> {
    if (this.signingTypedDataFun != undefined) {
      return await this.signingTypedDataFun(
        referralDomain,
        {
          NewCode: referralTypes.NewCode,
        },
        ReferralCodeSigner.referralCodeNewCodePayloadToTypedData(rc)
      );
    } else if (this.signingFun != undefined) {
      return await ReferralCodeSigner.getSignatureForNewCode(rc, this.signingFun);
    } else {
      throw Error("no signer defined, call createSignerInstance()");
    }
  }

  public async getSignatureForCodeSelection(rc: APIReferralCodeSelectionPayload): Promise<string> {
    if (this.signingTypedDataFun != undefined) {
      return await this.signingTypedDataFun(
        referralDomain,
        {
          CodeSelection: referralTypes.CodeSelection,
        },
        ReferralCodeSigner.codeSelectionPayloadToTypedData(rc)
      );
    } else if (this.signingFun != undefined) {
      return await ReferralCodeSigner.getSignatureForCodeSelection(rc, this.signingFun);
    } else {
      throw Error("no signer defined, call createSignerInstance()");
    }
  }

  public async getAddress(): Promise<string> {
    if (this.signingFun == undefined) {
      throw Error("no signer defined, call createSignerInstance()");
    }
    return this.address;
  }

  /**
   * New agency/broker to agency referral
   * rc.PassOnPercTDF must be in 100*percentage unit
   * @param rc payload to sign
   * @param signingFun signing function
   * @returns signature
   */
  public static async getSignatureForNewReferral(
    rp: APIReferPayload,
    signingFun: (x: string | Uint8Array) => Promise<string>
  ): Promise<string> {
    if (Math.abs(rp.passOnPercTDF - Math.round(rp.passOnPercTDF)) > 1e-4) {
      throw Error("PassOnPercTDF must be in 100*percentage unit, e.g., 2.25% -> 225");
    }
    let digest = ReferralCodeSigner._referralNewToMessage(rp);
    let digestBuffer = Buffer.from(digest.substring(2, digest.length), "hex");
    return await signingFun(digestBuffer);
  }

  /**
   * New code
   * rc.PassOnPercTDF must be in 100*percentage unit
   * @param rc APIReferralCodePayload without signature
   * @param signingFun function that signs
   * @returns signature string
   */
  public static async getSignatureForNewCode(
    rc: APIReferralCodePayload,
    signingFun: (x: string | Uint8Array) => Promise<string>
  ): Promise<string> {
    if (Math.abs(rc.passOnPercTDF - Math.round(rc.passOnPercTDF)) > 1e-4) {
      throw Error("PassOnPercTDF must be in 100*percentage unit, e.g., 2.25% -> 225");
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

  private static _referralNewToMessage(rc: APIReferPayload): string {
    let abiCoder = new AbiCoder();
    const passOnPercTwoDigitsFormat = Math.round(rc.passOnPercTDF);
    let digest = keccak256(
      abiCoder.encode(
        ["address", "address", "uint32", "uint256"],
        [rc.parentAddr, rc.referToAddr, passOnPercTwoDigitsFormat, Math.round(rc.createdOn)]
      )
    );
    return digest;
  }

  /**
   * Convert payload to data struct to sign
   * @param rc payload
   * @returns typed data
   */
  public static newReferralPayloadToTypedData(rc: APIReferPayload) {
    return {
      ParentAddr: rc.parentAddr as `0x${string}`,
      ReferToAddr: rc.referToAddr as `0x${string}`,
      PassOnPercTDF: Math.round(rc.passOnPercTDF),
      CreatedOn: BigInt(Math.round(rc.createdOn)),
    };
  }

  /**
   * Create digest for referralCodePayload that is to be signed
   * @param rc payload
   * @returns the hex-string to be signed
   */
  private static _referralCodeNewCodePayloadToMessage(rc: APIReferralCodePayload): string {
    let abiCoder = new AbiCoder();
    const passOnPercTwoDigitsFormat = Math.round(rc.passOnPercTDF);
    let digest = keccak256(
      abiCoder.encode(
        ["string", "address", "uint32", "uint256"],
        [rc.code, rc.referrerAddr, passOnPercTwoDigitsFormat, Math.round(rc.createdOn)]
      )
    );
    return digest;
  }

  /**
   * Convert payload to data struct to sign
   * @param rc payload
   * @returns typed data
   */
  public static referralCodeNewCodePayloadToTypedData(rc: APIReferralCodePayload) {
    return {
      Code: rc.code,
      ReferrerAddr: rc.referrerAddr as `0x${string}`,
      PassOnPercTDF: Math.round(rc.passOnPercTDF),
      CreatedOn: BigInt(Math.round(rc.createdOn)),
    };
  }

  /**
   * Create digest for APIReferralCodeSelectionPayload that is to be signed
   * @param rc payload
   * @returns the hex-string to be signed
   */
  private static _codeSelectionPayloadToMessage(rc: APIReferralCodeSelectionPayload): string {
    let abiCoder = new AbiCoder();
    let digest = keccak256(
      abiCoder.encode(["string", "address", "uint256"], [rc.code, rc.traderAddr, Math.round(rc.createdOn)])
    );
    return digest;
  }

  /**
   * Convert payload to data struct to sign
   * @param rc payload
   * @returns typed data
   */
  public static codeSelectionPayloadToTypedData(rc: APIReferralCodeSelectionPayload) {
    return {
      Code: rc.code,
      TraderAddr: rc.traderAddr as `0x${string}`,
      CreatedOn: BigInt(Math.round(rc.createdOn)),
    };
  }

  /**
   * Check whether signature is correct on payload:
   * - the referrer always signs
   * - if the agency is not an agency for this referrer, the backend will reject
   * @param rc referralcode payload with a signature
   * @returns true if correctly signed, false otherwise
   */
  public static checkNewCodeSignature(rc: APIReferralCodePayload) {
    if (rc.signature == undefined || rc.signature == "") {
      return false;
    }
    try {
      // typed-data (^2.x.x)
      const typedData = ReferralCodeSigner.referralCodeNewCodePayloadToTypedData(rc);
      const signerAddress = verifyTypedData(
        referralDomain,
        { NewCode: referralTypes.NewCode },
        typedData,
        rc.signature
      );
      return rc.referrerAddr.toLowerCase() == signerAddress.toLowerCase();
    } catch (err) {
      console.log(err);
      // digest (1.x.x)
      try {
        let digest = ReferralCodeSigner._referralCodeNewCodePayloadToMessage(rc);
        let digestBuffer = Buffer.from(digest.substring(2, digest.length), "hex");
        const signerAddress = verifyMessage(digestBuffer, rc.signature);
        return rc.referrerAddr.toLowerCase() == signerAddress.toLowerCase();
      } catch (err) {
        console.log(err);
        return false;
      }
    }
  }

  public static checkCodeSelectionSignature(rc: APIReferralCodeSelectionPayload) {
    if (rc.signature == undefined || rc.signature == "") {
      return false;
    }
    try {
      // typed-data (^2.x.x)
      const typedData = ReferralCodeSigner.codeSelectionPayloadToTypedData(rc);
      const signerAddress = verifyTypedData(
        referralDomain,
        { CodeSelection: referralTypes.CodeSelection },
        typedData,
        rc.signature
      );
      return rc.traderAddr.toLowerCase() == signerAddress.toLowerCase();
    } catch (err) {
      console.log(err);
      // digest (1.x.x)
      try {
        let digest = ReferralCodeSigner._codeSelectionPayloadToMessage(rc);
        let digestBuffer = Buffer.from(digest.substring(2, digest.length), "hex");
        const signerAddress = verifyMessage(digestBuffer, rc.signature);
        return rc.traderAddr.toLowerCase() == signerAddress.toLowerCase();
      } catch (err) {
        return false;
      }
    }
  }
}
