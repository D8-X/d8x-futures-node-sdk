import { BigNumber } from "@ethersproject/bignumber";
import { Buffer } from "buffer";
import { decNToFloat, floatToDec18 } from "./d8XMath";
import type { PriceFeedConfig, PriceFeedFormat, PriceFeedSubmission, PythLatestPriceFeed } from "./nodeSDKTypes";
import PerpetualDataHandler from "./perpetualDataHandler";
import Triangulator from "./triangulator";
import OnChainPxFeed from "./onChainPxFeed";
import OnChainPxFactory from "./onChainPxFactory";
/**
 * This class communicates with the REST API that provides price-data that is
 * to be submitted to the smart contracts for certain functions such as
 * trader liquidations, trade executions, change of trader margin amount.
 */
export default class PriceFeeds {
  private config: PriceFeedConfig;
  private feedEndpoints: Array<string>; //feedEndpoints[endpointId] = endpointstring
  private feedInfo: Map<string, { symbol: string; endpointId: number }>; // priceFeedId -> symbol, endpointId
  private dataHandler: PerpetualDataHandler;
  // store triangulation paths given the price feeds
  private triangulations: Map<string, [string[], boolean[]]>;
  private THRESHOLD_MARKET_CLOSED_SEC = 15; // smallest lag for which we consider the market as being closed
  private cache: Map<string, { timestamp: number; values: any }> = new Map();
  private onChainPxFeeds: Map<string, OnChainPxFeed>;
  // api formatting constants
  private PYTH = { endpoint: "/latest_price_feeds?ids[]=", separator: "&ids[]=", suffix: "" };

  constructor(dataHandler: PerpetualDataHandler, priceFeedConfigNetwork: string) {
    let configs = require("./config/priceFeedConfig.json") as PriceFeedConfig[];
    this.config = PriceFeeds._selectConfig(configs, priceFeedConfigNetwork);
    // if SDK config contains custom price feed endpoints, these override the public/default ones
    if (dataHandler.config.priceFeedEndpoints && dataHandler.config.priceFeedEndpoints.length > 0) {
      // override price feed endpoints of same type
      for (let k = 0; k < dataHandler.config.priceFeedEndpoints.length; k++) {
        for (let j = 0; j < this.config.endpoints.length; j++) {
          if (this.config.endpoints[j].type == dataHandler.config.priceFeedEndpoints[k].type) {
            this.config.endpoints[j] = dataHandler.config.priceFeedEndpoints[k];
            break;
          }
        }
      }
    }
    this.onChainPxFeeds = new Map<string, OnChainPxFeed>();
    for (let k = 0; k < this.config.ids.length; k++) {
      if (this.config.ids[k].type == "onchain") {
        let sym = this.config.ids[k].symbol;
        this.onChainPxFeeds[sym] = OnChainPxFactory.createFeed(sym);
      }
    }
    [this.feedInfo, this.feedEndpoints] = PriceFeeds._constructFeedInfo(this.config, false);
    this.dataHandler = dataHandler;
    this.triangulations = new Map<string, [string[], boolean[]]>();
  }

  /**
   * Pre-processing of triangulations for symbols, given the price feeds
   * @param symbols set of symbols we want to triangulate from price feeds
   */
  public initializeTriangulations(symbols: Set<string>) {
    let feedSymbols = new Array<string>();
    for (let [, value] of this.feedInfo) {
      feedSymbols.push(value.symbol);
    }
    for (let symbol of symbols.values()) {
      let triangulation = Triangulator.triangulate(feedSymbols, symbol);
      this.triangulations.set(symbol, triangulation);
    }
  }

  /**
   * Returns computed triangulation map
   * @returns Triangulation map
   */
  public getTriangulations() {
    return this.triangulations;
  }

  /**
   * Set pre-computed triangulation map
   */
  public setTriangulations(triangulation: Map<string, [string[], boolean[]]>) {
    this.triangulations = triangulation;
  }

  /**
   * Get required information to be able to submit a blockchain transaction with price-update
   * such as trade execution, liquidation
   * @param symbol symbol of perpetual, e.g., BTC-USD-MATIC
   * @returns PriceFeedSubmission, index prices, market closed information
   */
  public async fetchFeedPriceInfoAndIndicesForPerpetual(
    symbol: string
  ): Promise<{ submission: PriceFeedSubmission; pxS2S3: [number, number]; mktClosed: [boolean, boolean] }> {
    let indexSymbols = this.dataHandler.getIndexSymbols(symbol);
    // fetch prices from required price-feeds (REST)
    let submission: PriceFeedSubmission = await this.fetchLatestFeedPriceInfoForPerpetual(symbol);
    // calculate index-prices from price-feeds
    let [_idxPrices, _mktClosed] = this.calculateTriangulatedPricesFromFeedInfo(
      indexSymbols.filter((x) => x != ""),
      submission
    );
    let idxPrices: [number, number] = [_idxPrices[0], 0];
    let mktClosed: [boolean, boolean] = [_mktClosed[0], false];
    if (idxPrices.length > 1) {
      idxPrices[1] = _idxPrices[1];
      mktClosed[1] = _mktClosed[1];
    }
    return { submission: submission, pxS2S3: idxPrices, mktClosed: mktClosed };
  }

  /**
   * Get all prices/isMarketClosed for the provided symbols via
   * "latest_price_feeds" and triangulation. Triangulation must be defined in config, unless
   * it is a direct price feed.
   * @returns map of feed-price symbol to price/isMarketClosed
   */
  public async fetchPrices(symbols: string[]): Promise<Map<string, [number, boolean]>> {
    let feedPrices = await this.fetchAllFeedPrices();
    let [prices, mktClosed] = this.triangulatePricesFromFeedPrices(symbols, feedPrices);
    let symMap = new Map<string, [number, boolean]>();
    for (let k = 0; k < symbols.length; k++) {
      symMap.set(symbols[k], [prices[k], mktClosed[k]]);
    }
    return symMap;
  }

  /**
   * Get index prices and market closed information for the given perpetual
   * @param symbol perpetual symbol such as ETH-USD-MATIC
   * @returns Index prices and market closed information
   */
  public async fetchPricesForPerpetual(symbol: string): Promise<{ idxPrices: number[]; mktClosed: boolean[] }> {
    let indexSymbols = this.dataHandler.getIndexSymbols(symbol).filter((x) => x != "");
    // determine relevant price feeds
    let feedSymbols = new Array<string>();
    for (let sym of indexSymbols) {
      if (sym != "") {
        let triang: [string[], boolean[]] | undefined = this.triangulations.get(sym);
        if (triang == undefined) {
          // no triangulation defined, so symbol must be a feed (unless misconfigured)
          feedSymbols.push(sym);
        } else {
          // push all required feeds to array
          triang[0].map((feedSym) => feedSymbols.push(feedSym));
        }
      }
    }
    // get all feed prices
    let feedPrices = await this.fetchFeedPrices(feedSymbols);
    // triangulate
    let [prices, mktClosed] = this.triangulatePricesFromFeedPrices(indexSymbols, feedPrices);
    // ensure we return an array of 2 in all cases
    if (prices.length == 1) {
      prices.push(0);
      mktClosed.push(false);
    }
    return { idxPrices: prices, mktClosed: mktClosed };
  }

  /**
   * Fetch the provided feed prices and bool whether market is closed or open
   * - requires the feeds to be defined in priceFeedConfig.json
   * - if symbols undefined, all feeds are queried
   * @param symbols array of feed-price symbols (e.g., [btc-usd, eth-usd]) or undefined
   * @returns mapping symbol-> [price, isMarketClosed]
   */
  public async fetchFeedPrices(symbols?: string[]): Promise<Map<string, [number, boolean]>> {
    let queries = new Array<string>(this.feedEndpoints.length);
    let suffixes = new Array<string>(queries.length);
    let symbolsOfEndpoint: string[][] = [];
    for (let j = 0; j < queries.length; j++) {
      symbolsOfEndpoint.push([]);
    }
    let onChainSyms: string[] = [];
    for (let k = 0; k < this.config.ids.length; k++) {
      let currFeed = this.config.ids[k];
      if (symbols != undefined && !symbols.includes(currFeed.symbol)) {
        continue;
      }
      if (currFeed.type == "onchain") {
        onChainSyms.push(currFeed.symbol);
        continue;
      }
      const apiFormat = { pyth: this.PYTH, odin: this.PYTH }[currFeed.type];
      if (apiFormat === undefined) {
        throw new Error(`API format for ${currFeed} unknown.`);
      }
      // feedInfo: Map<string, {symbol:string, endpointId: number}>; // priceFeedId -> symbol, endpointId
      let endpointId = this.feedInfo.get(currFeed.id)!.endpointId;
      symbolsOfEndpoint[endpointId].push(currFeed.symbol);
      if (queries[endpointId] == undefined) {
        // each id can have a different endpoint, but we cluster
        // the queries into one per endpoint
        queries[endpointId] = this.feedEndpoints[endpointId] + apiFormat.endpoint + currFeed.id;
        suffixes[endpointId] = apiFormat.suffix;
      } else {
        queries[endpointId] = queries[endpointId] + apiFormat.separator + currFeed.id;
      }
    }
    let onChainPromise = this.queryOnChainPxFeeds(onChainSyms);
    let resultPrices = new Map<string, [number, boolean]>();
    for (let k = 0; k < queries.length; k++) {
      if (queries[k] == undefined) {
        continue;
      }
      if (queries[k] == "onchain") {
      }
      let [, pxInfo]: [string[], PriceFeedFormat[]] = await this.fetchPriceQuery(queries[k] + suffixes[k]);
      let tsSecNow = Math.round(Date.now() / 1000);
      for (let j = 0; j < pxInfo.length; j++) {
        let price = decNToFloat(BigNumber.from(pxInfo[j].price), -pxInfo[j].expo);
        let isMarketClosed = tsSecNow - pxInfo[j].publish_time > this.THRESHOLD_MARKET_CLOSED_SEC;
        resultPrices.set(symbolsOfEndpoint[k][j], [price, isMarketClosed]);
      }
    }
    let onChPxs = await onChainPromise;
    for (let k = 0; k < onChainSyms.length; k++) {
      let sym = onChainSyms[k];
      resultPrices.set(sym, [onChPxs[k], false]);
    }
    return resultPrices;
  }

  private async queryOnChainPxFeeds(symbols: string[]) {
    let prices: number[] = new Array<number>();
    for (let k = 0; k < symbols.length; k++) {
      let sym = symbols[k];
      let price = await this.onChainPxFeeds[sym].getPrice();
      prices.push(price);
    }
    return prices;
  }

  /**
   * Get all configured feed prices via "latest_price_feeds"
   * @returns map of feed-price symbol to price/isMarketClosed
   */
  public async fetchAllFeedPrices(): Promise<Map<string, [number, boolean]>> {
    return this.fetchFeedPrices();
  }

  /**
   * Get the latest prices for a given perpetual from the offchain oracle
   * networks
   * @param symbol perpetual symbol of the form BTC-USD-MATIC
   * @returns array of price feed updates that can be submitted to the smart contract
   * and corresponding price information
   */
  public async fetchLatestFeedPriceInfoForPerpetual(symbol: string): Promise<PriceFeedSubmission> {
    let feedIds = this.dataHandler.getPriceIds(symbol);
    let queries = new Array<string>(this.feedEndpoints.length);
    // we need to preserve the order of the price feeds
    let orderEndpointNumber = new Array<number>();
    // count how many prices per endpoint
    let idCountPriceFeeds = new Array<number>(this.feedEndpoints.length);
    let symbols = new Array<string>();
    for (let k = 0; k < feedIds.length; k++) {
      let info = this.feedInfo.get(feedIds[k]);
      if (info == undefined) {
        throw new Error(`priceFeeds: config for symbol ${symbol} insufficient`);
      }
      let id = info.endpointId;
      symbols.push(info.symbol);
      if (queries[id] == undefined) {
        // each id can have a different endpoint, but we cluster
        // the queries into one per endpoint
        queries[id] = this.feedEndpoints[id] + "/latest_price_feeds?binary=true&";
        idCountPriceFeeds[id] = 0;
      }
      queries[id] = queries[id] + "ids[]=" + feedIds[k] + "&";
      orderEndpointNumber.push(id * 100 + idCountPriceFeeds[id]);
      idCountPriceFeeds[id] = idCountPriceFeeds[id] + 1;
    }

    let data;
    try {
      data = await Promise.all(
        queries.map(async (q) => {
          if (q != undefined) {
            return this.fetchVAAQuery(q);
          } else {
            return [[], []];
          }
        })
      );
    } catch (error) {
      // try switching endpoints and re-query
      console.log("fetchVAAQuery failed, selecting random price feed endpoint...");
      [this.feedInfo, this.feedEndpoints] = PriceFeeds._constructFeedInfo(this.config, true);
      data = await Promise.all(
        queries.map(async (q) => {
          if (q != undefined) {
            return this.fetchVAAQuery(q);
          } else {
            return [[], []];
          }
        })
      );
      console.log("success");
    }

    // re-order arrays so we preserve the order of the feeds
    const priceFeedUpdates = new Array<string>();
    const prices = new Array<number>();
    const mktClosed = new Array<boolean>();
    const timestamps = new Array<number>();
    const tsSecNow = Math.round(Date.now() / 1000);
    for (let k = 0; k < orderEndpointNumber.length; k++) {
      let endpointId = Math.floor(orderEndpointNumber[k] / 100);
      let idWithinEndpoint = orderEndpointNumber[k] - 100 * endpointId;
      priceFeedUpdates.push(data[endpointId][0][idWithinEndpoint]);
      let pxInfo: PriceFeedFormat = data[endpointId][1][idWithinEndpoint];
      let price = decNToFloat(BigNumber.from(pxInfo.price), -pxInfo.expo);
      let isMarketClosed = tsSecNow - pxInfo.publish_time > this.THRESHOLD_MARKET_CLOSED_SEC;
      mktClosed.push(isMarketClosed);
      prices.push(price);
      timestamps.push(pxInfo.publish_time);
    }

    return {
      symbols: symbols,
      priceFeedVaas: priceFeedUpdates,
      prices: prices,
      isMarketClosed: mktClosed,
      timestamps: timestamps,
    };
  }

  /**
   * Extract pair-prices from underlying price feeds via triangulation
   * The function either needs a direct price feed or a defined triangulation to succesfully
   * return a triangulated price
   * @param symbols array of pairs for which we want prices, e.g., [BTC-USDC, ETH-USD]
   * @param feeds data obtained via fetchLatestFeedPriceInfo or fetchLatestFeedPrices
   * @returns array of prices with same order as symbols
   */
  public calculateTriangulatedPricesFromFeedInfo(symbols: string[], feeds: PriceFeedSubmission): [number[], boolean[]] {
    let priceMap = new Map<string, [number, boolean]>();
    for (let j = 0; j < feeds.prices.length; j++) {
      priceMap.set(feeds.symbols[j], [feeds.prices[j], feeds.isMarketClosed[j]]);
    }
    return this.triangulatePricesFromFeedPrices(symbols, priceMap);
  }
  /**
   * Extract pair-prices from underlying price feeds via triangulation
   * The function either needs a direct price feed or a defined triangulation to succesfully
   * return a triangulated price
   * @param symbols array of pairs for which we want prices, e.g., [BTC-USDC, ETH-USD]
   * @param feeds data obtained via fetchLatestFeedPriceInfo or fetchLatestFeedPrices
   * @returns array of prices with same order as symbols
   */
  public triangulatePricesFromFeedPrices(
    symbols: string[],
    feedPriceMap: Map<string, [number, boolean]>
  ): [number[], boolean[]] {
    let prices = new Array<number>();
    let mktClosed = new Array<boolean>();
    for (let k = 0; k < symbols.length; k++) {
      let sym = symbols[k] as string;
      let triangulation: [string[], boolean[]] | undefined = this.triangulations.get(sym);
      if (triangulation == undefined) {
        let feedPrice = feedPriceMap.get(sym);
        if (feedPrice == undefined) {
          throw new Error(`PriceFeeds: no triangulation defined for ${sym}`);
        } else {
          prices.push(feedPrice[0]); //price
          mktClosed.push(feedPrice[1]); //market closed?
          continue;
        }
      }
      let [px, isMktClosed]: [number, boolean] = Triangulator.calculateTriangulatedPrice(triangulation, feedPriceMap);
      prices.push(px);
      mktClosed.push(isMktClosed);
    }
    return [prices, mktClosed];
  }

  /**
   * Queries the REST endpoint and returns parsed VAA price data
   * @param query query price-info from endpoint
   * @returns vaa and price info
   */
  private async fetchVAAQuery(query: string): Promise<[string[], PriceFeedFormat[]]> {
    const headers = { headers: { "Content-Type": "application/json" } };
    let response = await fetch(query, headers);
    if (!response.ok) {
      throw new Error(`Failed to fetch posts (${response.status}): ${response.statusText}`);
    }
    let values = (await response.json()) as Array<PythLatestPriceFeed>;
    const priceFeedUpdates = new Array<string>();
    const px = new Array<PriceFeedFormat>();
    for (let k = 0; k < values.length; k++) {
      const vaa = values[k].vaa;
      priceFeedUpdates.push("0x" + Buffer.from(vaa, "base64").toString("hex"));
      px.push(values[k].price);
    }
    return [priceFeedUpdates, px];
  }

  /**
   * Queries the REST endpoint and returns parsed price data
   * @param query query price-info from endpoint
   * @returns vaa and price info
   */
  public async fetchPriceQuery(query: string): Promise<[string[], PriceFeedFormat[]]> {
    let values: any;
    const cached = this.cache.get(query);
    const tsNow = Date.now() / 1_000;
    if (cached && cached.timestamp + 2 > tsNow) {
      // less than two seconds have passed since the last query - no need to query again
      values = cached.values;
    } else {
      const headers = { headers: { "Content-Type": "application/json" } };
      let response = await fetch(query, headers);
      if (!response.ok) {
        throw new Error(`Failed to fetch posts (${response.status}): ${response.statusText}`);
      }
      values = await response.json();
      this.cache.set(query, { timestamp: tsNow, values: values });
    }
    const priceFeedUpdates = new Array<string>();
    const px = new Array<PriceFeedFormat>();
    const keys = Array.isArray(values) ? [] : Object.keys(values);
    if (keys.length > 0) {
      for (const k of keys) {
        priceFeedUpdates.push("0x");
        px.push({
          conf: BigNumber.from(0),
          expo: -18,
          price: floatToDec18(values[k].value),
          publish_time: values[k].timestamp,
        });
      }
    } else {
      for (let k = 0; k < values.length; k++) {
        priceFeedUpdates.push("0x" + Buffer.from(values[k].id, "base64").toString("hex"));
        px.push(values[k].price as PriceFeedFormat);
      }
    }
    return [priceFeedUpdates, px];
  }

  /**
   * Searches for configuration for given network
   * @param configs pricefeed configuration from json
   * @param network e.g. testnet
   * @returns selected configuration
   */
  static _selectConfig(configs: PriceFeedConfig[], network: string): PriceFeedConfig {
    let k = 0;
    while (k < configs.length) {
      if (configs[k].network == network) {
        return configs[k];
      }
      k = k + 1;
    }
    throw new Error(`PriceFeeds: config not found for network ${network}`);
  }

  /**
   * Wraps configuration into convenient data-structure
   * @param config configuration for the selected network
   * @returns feedInfo-map and endPoints-array
   */
  static _constructFeedInfo(
    config: PriceFeedConfig,
    shuffleEndpoints: boolean
  ): [Map<string, { symbol: string; endpointId: number }>, string[]] {
    let feed = new Map<string, { symbol: string; endpointId: number }>();
    let endpointId = -1;
    let type = "";
    let feedEndpoints = new Array<string>();

    for (let k = 0; k < config.endpoints.length; k++) {
      const L = config.endpoints[k].endpoints.length;
      let endpointNr = !shuffleEndpoints ? 0 : 1 + Math.floor(Math.random() * (L - 1));
      // if config has only one endpoint:
      endpointNr = Math.min(endpointNr, L - 1);
      feedEndpoints.push(config.endpoints[k].endpoints[endpointNr]);
    }
    for (let k = 0; k < config.ids.length; k++) {
      if (type != config.ids[k].type) {
        type = config.ids[k].type;
        let j = 0;
        while (j < config.endpoints.length) {
          if (config.endpoints[j].type == type) {
            endpointId = j;
            j = config.endpoints.length;
          }
          j++;
        }
        if (config.endpoints[endpointId].type != type) {
          throw new Error(`priceFeeds: no enpoint found for ${type} check priceFeedConfig`);
        }
      }
      feed.set(config.ids[k].id, { symbol: config.ids[k].symbol.toUpperCase(), endpointId: endpointId });
    }
    return [feed, feedEndpoints];
  }
}
