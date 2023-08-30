import { defaultAbiCoder } from "@ethersproject/abi";
import { BigNumber } from "ethers";
import { ethers } from "ethers";
import { Wallet } from "@ethersproject/wallet";
import TraderDigests from "../src/traderDigests";
import { BUY_SIDE, ORDER_TYPE_MARKET, Order, SmartContractOrder, MASK_MARKET_ORDER } from "../src/nodeSDKTypes";
import { ABDK29ToFloat, ABK64x64ToFloat, floatToABK64x64 } from "../src/d8XMath";
import { Provider, StaticJsonRpcProvider } from "@ethersproject/providers";
import { Bytes, concat } from "@ethersproject/bytes";
import { keccak256 } from "@ethersproject/keccak256";
import { toUtf8Bytes } from "@ethersproject/strings";

async function BrokerDigest(
  chainId: number,
  proxyAddress: string,
  brokerFeeTbps: number,
  iPerpetualId: number,
  traderAddr: string,
  iDeadline: number
): Promise<[string, string, string]> {
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
  let provider = new StaticJsonRpcProvider("https://polygon-mumbai.gateway.tenderly.co");
  const wallet = new Wallet(pk);
  let signer = wallet.connect(provider);
  let toHash = hashMessage(digestBuffer);
  console.log("hash=", toHash);
  let signature = await signer.signMessage(digestBuffer);
  console.log("sig=", signature);
  console.log("wallet addr=", wallet.address);

  let addr = ethers.utils.recoverAddress(digestBuffer, signature);
  let addr2 = ethers.utils.verifyMessage(digestBuffer, signature);
  let addr3 = ethers.utils.verifyMessage(digest, signature);
  return [signature, digest, wallet.address];
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
}

async function brokerDigest() {
  let [sig, dgst, addr] = await BrokerDigest(
    80001,
    "0xCdd7C9e07689d1B3D558A714fAa5Cc4B6bA654bD",
    410,
    10001,
    "0x9d5aaB428e98678d0E645ea4AeBd25f744341a05",
    1691249493
  );
  console.log("Sig = ", sig);
  console.log("Digest = ", dgst);
  let dgstB = Buffer.from(dgst.substring(2, dgst.length), "hex");
  let recoveredAddr1 = ethers.utils.verifyMessage(dgstB, sig);
  let recoveredAddr = ethers.utils.recoverAddress(dgst, sig);
  console.log("recovered1 = ", recoveredAddr1);
  //console.log("recovered = ", recoveredAddr);
  console.log("addr = ", addr);
}

async function brokerDigest2() {
  let sig =
    "0x8b42c7be1f20e8bffc4c13eb2263e56a72d89eafb3d424bfa708b652ff9ec54e5c340ba94c5214dd169b9b66ed97af20546efea849deb9e0c627a99f92c30bce1c";
  let dgst = "0x67ea569dd56486634411bee7c5ea9e6d28da78fb70ba8c1f830aa4e74f0a65c9";
  console.log("Sig = ", sig);
  console.log("Digest = ", dgst);
  let recoveredAddr = ethers.utils.recoverAddress(dgst, sig);
  console.log("recovered = ", recoveredAddr);
}

async function brokerDigest3() {
  let [sig, dgst, addr] = await BrokerDigest(
    80001,
    "0xCdd7C9e07689d1B3D558A714fAa5Cc4B6bA654bD",
    60,
    10001,
    "0x9d5aaB428e98678d0E645ea4AeBd25f744341a05",
    1688347462
  );

  console.log("Sig = ", sig);
  console.log("Digest = ", dgst);
  let dgstB = Buffer.from(dgst.substring(2, dgst.length), "hex");
  let recoveredAddr = ethers.utils.verifyMessage(dgstB, sig);
  console.log("recovered = ", recoveredAddr);
}
//main();
//brokerDigest();
//brokerDigest2();
brokerDigest3();
