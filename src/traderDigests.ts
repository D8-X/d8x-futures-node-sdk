import { defaultAbiCoder } from "@ethersproject/abi";
import { concat } from "@ethersproject/bytes";
import { keccak256 } from "@ethersproject/keccak256";
import { toUtf8Bytes } from "@ethersproject/strings";
import { Buffer } from "buffer";
import { SmartContractOrder } from "./nodeSDKTypes";

export default class TraderDigests {
  /**
   * Creates an order-id from the digest. Order-id is the 'digest' used in the smart contract.
   * @param digest  created with _createDigest
   * @returns orderId string
   * @ignore
   */
  public createOrderId(digest: string): string {
    let digestBuffer = Buffer.from(digest.substring(2, digest.length), "hex");
    const messagePrefix = "\x19Ethereum Signed Message:\n";
    let tmp = concat([toUtf8Bytes(messagePrefix), toUtf8Bytes(String(digestBuffer.length)), digestBuffer]);
    // see: https://github.com/ethers-io/ethers.js/blob/c80fcddf50a9023486e9f9acb1848aba4c19f7b6/packages/hash/src.ts/message.ts#L7
    return keccak256(tmp);
  }

  /**
   * Creates a digest (order-id)
   * @param order         smart-contract-type order
   * @param chainId       chainId of network
   * @param isNewOrder    true unless we cancel
   * @param signer        ethereum-type wallet
   * @param proxyAddress  address of the contract
   * @returns digest
   * @ignore
   */
  public createDigest(order: SmartContractOrder, chainId: number, isNewOrder: boolean, proxyAddress: string): string {
    const NAME = "Perpetual Trade Manager";
    const DOMAIN_TYPEHASH = keccak256(
      Buffer.from("EIP712Domain(string name,uint256 chainId,address verifyingContract)")
    );
    let domainSeparator = keccak256(
      defaultAbiCoder.encode(
        ["bytes32", "bytes32", "uint256", "address"],
        [DOMAIN_TYPEHASH, keccak256(Buffer.from(NAME)), chainId, proxyAddress]
      )
    );
    const TRADE_ORDER_TYPEHASH = keccak256(
      Buffer.from(
        "Order(uint24 iPerpetualId,uint16 brokerFeeTbps,address traderAddr,address brokerAddr,int128 fAmount,int128 fLimitPrice,int128 fTriggerPrice,uint32 iDeadline,uint32 flags,uint16 leverageTDR,uint32 executionTimestamp)"
      )
    );
    let structHash = keccak256(
      defaultAbiCoder.encode(
        [
          "bytes32",
          "uint24",
          "uint16",
          "address",
          "address",
          "int128",
          "int128",
          "int128",
          "uint64",
          "uint32",
          "uint16",
          "uint64",
        ],
        [
          TRADE_ORDER_TYPEHASH,
          order.iPerpetualId,
          order.brokerFeeTbps,
          order.traderAddr,
          order.brokerAddr,
          order.fAmount,
          order.fLimitPrice,
          order.fTriggerPrice,
          order.iDeadline,
          order.flags,
          order.leverageTDR,
          order.executionTimestamp,
        ]
      )
    );
    let digest = keccak256(
      defaultAbiCoder.encode(["bytes32", "bytes32", "bool"], [domainSeparator, structHash, isNewOrder])
    );
    return digest;
  }
}
