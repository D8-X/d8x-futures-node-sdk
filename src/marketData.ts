import {
    ExchangeInfo,
    NodeSDKConfig,
    MarginAccount,
    PoolState,
    PerpetualState,
    COLLATERAL_CURRENCY_BASE,
    COLLATERAL_CURRENCY_QUANTO,
    PERP_STATE_STR,
    ZERO_ADDRESS,
} from "./nodeSDKTypes";
import { BigNumber, BytesLike, ethers } from "ethers";
import { floatToABK64x64, ABK64x64ToFloat } from "./d8XMath";
import { fromBytes4HexString } from "./utils";
import PerpetualDataHandler from "./perpetualDataHandler";
import { SmartContractOrder, Order } from "./nodeSDKTypes";

/**
 * This class requires no private key and is blockchain read-only.
 * No gas required for the queries here.
 */
export default class MarketData extends PerpetualDataHandler {
    public constructor(config: NodeSDKConfig) {
        super(config);
    }

    public async createProxyInstance() {
        this.provider = new ethers.providers.JsonRpcProvider(this.nodeURL);
        await this.initContractsAndData(this.provider);
    }

    public async exchangeInfo(): Promise<ExchangeInfo> {
        if (this.proxyContract == null) {
            throw Error("no proxy contract initialized. Use createProxyInstance().");
        }
        return await MarketData._exchangeInfo(this.proxyContract);
    }

    /**
     * Get all open orders for a trader-address and a symbol
     * @param traderAddr address of the trader for which we get the open order
     * @param symbol symbol of the form ETH-USD-MATIC
     * @returns array of open orders and corresponding order-ids
     */
    public async openOrders(traderAddr: string, symbol: string): Promise<{ orders: Order[]; orderIds: string[] }> {
        // open orders requested only for given symbol
        let orderBookContract = this.getOrderBookContract(symbol);
        let [orders, digests] = await Promise.all([
            this.openOrdersOnOrderBook(traderAddr, orderBookContract),
            this.orderIdsOfTrader(traderAddr, orderBookContract),
        ]);
        return { orders: orders, orderIds: digests };
    }

    public async positionRisk(traderAddr: string, symbol: string): Promise<MarginAccount> {
        if (this.proxyContract == null) {
            throw Error("no proxy contract initialized. Use createProxyInstance().");
        }
        let mgnAcct = await PerpetualDataHandler.getMarginAccount(traderAddr, symbol, this.symbolToPerpStaticInfo, this.proxyContract);
        return mgnAcct;
    }

    /**
     * Query smart contract to get user orders and convert to user friendly order format
     * @param traderAddr address of trader
     * @param orderBookContract instance of order book
     * @returns array of user friendly order struct
     */
    protected async openOrdersOnOrderBook(traderAddr: string, orderBookContract: ethers.Contract): Promise<Order[]> {
        let orders: SmartContractOrder[] = await orderBookContract.getOrders(traderAddr, 0, 15);
        //eliminate empty orders and map to user friendly orders
        let userFriendlyOrders: Order[] = new Array<Order>();
        let k = 0;
        while (k < orders.length && orders[k].traderAddr != ZERO_ADDRESS) {
            userFriendlyOrders.push(PerpetualDataHandler.fromSmartContractOrder(orders[k], this.symbolToPerpStaticInfo));
            k++;
        }
        return userFriendlyOrders;
    }

    /**
     *
     * @param traderAddr address of the trader
     * @param orderBookContract instance of order book contract
     * @returns array of order-id's
     */
    protected async orderIdsOfTrader(traderAddr: string, orderBookContract: ethers.Contract): Promise<string[]> {
        let digestsRaw: string[] = await orderBookContract.limitDigestsOfTrader(traderAddr, 0, 15);
        let k: number = 0;
        let digests: string[] = [];
        while (k < digestsRaw.length && BigNumber.from(digestsRaw[k]).gt(0)) {
            digests.push(digestsRaw[k]);
            k++;
        }
        return digests;
    }

    public static async _exchangeInfo(_proxyContract: ethers.Contract): Promise<ExchangeInfo> {
        let nestedPerpetualIDs = await PerpetualDataHandler.getNestedPerpetualIds(_proxyContract);
        let info: ExchangeInfo = { pools: [] };
        const numPools = nestedPerpetualIDs.length;
        for (var j = 0; j < numPools; j++) {
            let perpetualIDs = nestedPerpetualIDs[j];
            let pool = await _proxyContract.getLiquidityPool(j + 1);
            let PoolState: PoolState = {
                isRunning: pool.isRunning,
                marginTokenAddr: pool.marginTokenAddress,
                poolShareTokenAddr: pool.shareTokenAddress,
                defaultFundCashCC: ABK64x64ToFloat(pool.fDefaultFundCashCC),
                pnlParticipantCashCC: ABK64x64ToFloat(pool.fPnLparticipantsCashCC),
                totalAMMFundCashCC: ABK64x64ToFloat(pool.fAMMFundCashCC),
                totalTargetAMMFundSizeCC: ABK64x64ToFloat(pool.fTargetAMMFundSize),
                brokerCollateralLotSize: ABK64x64ToFloat(pool.fBrokerCollateralLotSize),
                perpetuals: [],
            };
            for (var k = 0; k < perpetualIDs.length; k++) {
                let perp = await _proxyContract.getPerpetual(perpetualIDs[k]);
                let fIndexS2 = await _proxyContract.getOraclePrice([perp.S2BaseCCY, perp.S2QuoteCCY]);
                let indexS2 = ABK64x64ToFloat(fIndexS2);
                let indexS3 = 1;
                if (perp.eCollateralCurrency == COLLATERAL_CURRENCY_BASE) {
                    indexS3 = indexS2;
                } else if (perp.eCollateralCurrency == COLLATERAL_CURRENCY_QUANTO) {
                    indexS3 = ABK64x64ToFloat(await _proxyContract.getOraclePrice([perp.S3BaseCCY, perp.S3QuoteCCY]));
                }
                let markPremiumRate = ABK64x64ToFloat(perp.currentMarkPremiumRate.fPrice);
                let currentFundingRateBps = 1e4 * ABK64x64ToFloat(perp.fCurrentFundingRate);
                let state = PERP_STATE_STR[perp.state];
                let PerpetualState: PerpetualState = {
                    id: perp.id,
                    state: state,
                    baseCurrency: fromBytes4HexString(perp.S2BaseCCY),
                    quoteCurrency: fromBytes4HexString(perp.S2QuoteCCY),
                    indexPrice: indexS2,
                    collToQuoteIndexPrice: indexS3,
                    markPrice: indexS2 * (1 + markPremiumRate),
                    currentFundingRateBps: currentFundingRateBps,
                    initialMarginRate: ABK64x64ToFloat(perp.fInitialMarginRate),
                    maintenanceMarginRate: ABK64x64ToFloat(perp.fMaintenanceMarginRate),
                    openInterestBC: ABK64x64ToFloat(perp.fOpenInterest),
                    maxPositionBC: ABK64x64ToFloat(perp.fMaxPositionBC),
                };
                PoolState.perpetuals.push(PerpetualState);
            }
            info.pools.push(PoolState);
        }
        return info;
    }
}
