import { decNToFloat } from "./d8XMath";
import { sleepForSec } from "./utils";
import OnChainPxFeed from "./onChainPxFeed";
import { Contract, Provider } from "ethers";

/**
 * OnChainPxFeedAngle: get STUSD-USDC exchange rate
 */
export default class OnChainPxFeedAngle extends OnChainPxFeed {
  private delayMs = 5000;
  private fetchInProgress = false;

  public constructor(rpcs: string[]) {
    super(rpcs);
  }

  protected override async fetchPrice(delay: boolean): Promise<void> {
    if (!this.fetchInProgress) {
      this.fetchInProgress = true;
      this.lastResponseTs = Date.now();
      let hasErr = false;
      for (let trial = 0; trial < this.rpcs.length; trial++) {
        try {
          this.lastPx = await STUSDToUSDC(this.provider);
          break;
        } catch (err) {
          console.log(`onChainPxSources error ${this.rpcs[this.lastRpc]}: retrying with other rpc`);
          hasErr = true;
        }
        this.setRpc();
      }
      if (hasErr) {
        console.log("onChainPxSources not successful");
      }

      if (delay) {
        await sleepForSec(this.delayMs / 1000);
      }
      this.fetchInProgress = false;
    }
  }
}

/**
 * Gets the price of one Angle stUSD in USDC from
 * on-chain
 * @param provider arbitrum provider
 * @returns STUSD-USDC
 */
export async function STUSDToUSDC(provider: Provider): Promise<number> {
  // ABIs for IERC4626 and ITransmuter contracts
  const ierc4626ABI = ["function previewMint(uint256) external view returns (uint256)"];
  const iTransmuterABI = ["function quoteOut(uint256, address, address) external view returns (uint256)"];
  // addresses
  const STUSD = "0x0022228a2cc5E7eF0274A7Baa600d44da5aB5776"; //stUSD, savings
  const USDC = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831"; //native USDC, 6 decimals
  const USDA = "0x0000206329b97DB379d5E1Bf586BbDB969C63274"; //USDA on Arbitrum, 18 decimals
  const transmuterAddr = "0xD253b62108d1831aEd298Fc2434A5A8e4E418053"; //for USDA, arbitrum

  // execute
  const ierc4626Contract = new Contract(STUSD, ierc4626ABI, provider);
  const iTransmuterContract = new Contract(transmuterAddr, iTransmuterABI, provider);

  // Call previewMint to get amountUSDA
  const ONE_STUSD = 10n ** 18n; // BigNumber.from(10).pow(BigNumber.from(18));
  const amountUSDA: bigint = await ierc4626Contract.previewMint(ONE_STUSD);

  // Call quoteOut to get amountIn
  const amountUSDC: bigint = await iTransmuterContract.quoteOut(amountUSDA, USDC, USDA);

  return decNToFloat(amountUSDC, 6);
}
