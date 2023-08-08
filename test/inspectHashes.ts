import { defaultAbiCoder } from "@ethersproject/abi";
import { Bytes, concat } from "@ethersproject/bytes";
import { keccak256 } from "@ethersproject/keccak256";
import { StaticJsonRpcProvider } from "@ethersproject/providers";
import { toUtf8Bytes } from "@ethersproject/strings";
import { Wallet } from "@ethersproject/wallet";
import { ethers } from "ethers";
import { BUY_SIDE, MASK_MARKET_ORDER, ORDER_TYPE_MARKET } from "../src/constants";
import { floatToABK64x64 } from "../src/d8XMath";
import { Order, SmartContractOrder } from "../src/nodeSDKTypes";
import TraderDigests from "../src/traderDigests";
async function BrokerDigest(
  chainId: number,
  proxyAddress: string,
  brokerFeeTbps: number,
  iPerpetualId: number,
  traderAddr: string,
  iDeadline: number
): Promise<string> {
  const NAME = "Perpetual Trade Manager";
  const DOMAIN_TYPEHASH = keccak256(Buffer.from("EIP712Domain(string name,uint256 chainId,address verifyingContract)"));
  let abiCoder = defaultAbiCoder;
  let domainSeparator = keccak256(
    abiCoder.encode(
      ["bytes32", "bytes32", "uint256", "address"],
      [DOMAIN_TYPEHASH, keccak256(Buffer.from(NAME)), chainId, proxyAddress]
    )
  );
  //
  const TRADE_BROKER_TYPEHASH = keccak256(
    Buffer.from("Order(uint24 iPerpetualId,uint16 brokerFeeTbps,address traderAddr,uint32 iDeadline)")
  );

  let structHash = keccak256(
    abiCoder.encode(
      ["bytes32", "uint24", "uint16", "address", "uint64"],
      [TRADE_BROKER_TYPEHASH, iPerpetualId, brokerFeeTbps, traderAddr, iDeadline]
    )
  );

  let digest = keccak256(abiCoder.encode(["bytes32", "bytes32"], [domainSeparator, structHash]));
  let digestBuffer = Buffer.from(digest.substring(2, digest.length), "hex");

  // get private key
  let pk: string = <string>process.env.PK;
  let provider = new StaticJsonRpcProvider("https://polygon-mumbai.blockpi.network/v1/rpc/public");
  const wallet = new Wallet(pk);
  let signer = wallet.connect(provider);
  let toHash = hashMessage(digestBuffer);
  console.log("hash=", toHash);
  let signature = await signer.signMessage(digestBuffer);
  console.log("sig=", signature);
  return signature;
}

export const messagePrefix = "\x19Ethereum Signed Message:\n";

export function hashMessage(message: Bytes | string): string {
  if (typeof message === "string") {
    message = toUtf8Bytes(message);
  }
  let tmp = concat([toUtf8Bytes(messagePrefix), toUtf8Bytes(String(message.length)), message]);
  console.log("message to hash=", tmp);
  return keccak256(concat([toUtf8Bytes(messagePrefix), toUtf8Bytes(String(message.length)), message]));
}

function toSCOrder(order: Order, traderAddr: string): SmartContractOrder {
  const perpetualId = 100001;
  let smOrder: SmartContractOrder = {
    flags: order.type == ORDER_TYPE_MARKET ? MASK_MARKET_ORDER : NaN,
    iPerpetualId: perpetualId,
    brokerFeeTbps: order.brokerFeeTbps == undefined ? 0 : order.brokerFeeTbps,
    traderAddr: traderAddr,
    brokerAddr: order.brokerAddr == undefined ? ethers.constants.AddressZero : order.brokerAddr,
    executorAddr: ethers.constants.AddressZero,
    brokerSignature: [],
    fAmount: floatToABK64x64(order.quantity),
    fLimitPrice: floatToABK64x64(order.limitPrice!),
    fTriggerPrice: floatToABK64x64(order.stopPrice!),
    leverageTDR: Math.round(100 * order.leverage!),
    iDeadline: Math.round(order.deadline!),
    submittedTimestamp: Math.round(order.submittedTimestamp!),
    executionTimestamp: Math.round(order.executionTimestamp!),
  };
  return smOrder;
}
async function main() {
  console.log("ABDK 15 = ", floatToABK64x64(15).toString());
  let order: Order = {
    symbol: "ETH-USD-MATIC",
    side: BUY_SIDE,
    type: ORDER_TYPE_MARKET,
    quantity: 15,
    reduceOnly: false,
    limitPrice: 0,
    keepPositionLvg: false,
    brokerFeeTbps: 0,
    brokerAddr: undefined,
    brokerSignature: undefined,
    stopPrice: 0,
    leverage: 5,
    deadline: 1684863656,
    submittedTimestamp: 1684263656,
    executionTimestamp: 1684263656,
  };
  const traderAddr = "0x9d5aaB428e98678d0E645ea4AeBd25f744341a05";
  let scOrder = toSCOrder(order, traderAddr);
  let digestTool = new TraderDigests();
  let chainId = 80001;
  let proxyAddr = "0x7Fb76c91e4950bD48Ed1C812EdE98A5Db96cb4e7";
  let digest = await digestTool.createDigest(scOrder, chainId, true, proxyAddr);
  console.log("digest=", digest);
  let digestBuffer = Buffer.from(digest.substring(2, digest.length), "hex");
  //let signature = await signer.signMessage(digestBuffer);

  //let [signature, digest] = await this._createSignature(scOrder, chainId, true, signer, proxyContract.address);
  /*
  const NAME = "Perpetual Trade Manager";
  let domainBuf = Buffer.from("EIP712Domain(string name,uint256 chainId,address verifyingContract)");
  const DOMAIN_TYPEHASH = keccak256(domainBuf);
  /* let domainSeparator = keccak256(
    defaultAbiCoder.encode(
      ["bytes32", "bytes32", "uint256", "address"],
      [DOMAIN_TYPEHASH, keccak256(Buffer.from(NAME)), 1001, proxyAddress]
    )
  );
  let V = defaultAbiCoder.encode(
    ["uint256", "address", "int256", "bytes32"],
    [123, "0x9d5aaB428e98678d0E645ea4AeBd25f744341a05", -1211, DOMAIN_TYPEHASH]
  );
  console.log(V);*/
  let dgst = await BrokerDigest(
    80001,
    "0x7Fb76c91e4950bD48Ed1C812EdE98A5Db96cb4e7",
    110,
    10001,
    "0x9d5aaB428e98678d0E645ea4AeBd25f744341a05",
    1684863656
  );
  console.log("Digest = ", dgst);
}
main();
