import { Buffer } from "buffer";
import { decNToFloat, floatToDec18 } from "./d8XMath";
import type {
  PriceFeedConfig,
  PriceFeedEndpoints,
  PriceFeedEndpointsOptionalWrite,
  PriceFeedFormat,
  PriceFeedSubmission,
  PythV2LatestPriceFeed,
  IdxPriceInfo,
  PredMktPriceInfo,
} from "./nodeSDKTypes";
import PerpetualDataHandler from "./perpetualDataHandler";
import Triangulator from "./triangulator";
import OnChainPxFeed from "./onChainPxFeed";
import OnChainPxFactory from "./onChainPxFactory";
import PolyMktsPxFeed from "./polyMktsPxFeed";
import { sleepForSec } from "./utils";
/**
 * This class communicates with the REST API that provides price-data that is
 * to be submitted to the smart contracts for certain functions such as
 * trader liquidations, trade executions, change of trader margin amount.
 */
export default class PriceFeeds {
  private config: PriceFeedConfig | undefined;
  private priceFeedConfigNetwork: string;
  // Read only price info endpoints. Used by default. feedEndpoints[endpointId]
  // = endpointstring
  public feedEndpoints: Array<string> = [];
  // Endpoints which are used to fetch prices for submissions
  public writeFeedEndpoints: Array<string> = [];
  private feedInfo: Map<string, { symbol: string; endpointId: number }[]>; // priceFeedId -> [symbol, endpointId]
  private dataHandler: PerpetualDataHandler;
  // store triangulation paths given the price feeds
  private triangulations: Map<string, [string[], boolean[]]>;
  private THRESHOLD_MARKET_CLOSED_SEC = 15; // smallest lag for which we consider the market as being closed
  private cache: Map<string, { timestamp: number; values: any }> = new Map();
  private onChainPxFeeds: Map<string, OnChainPxFeed>;
  // api formatting constants
  private PYTH = { endpoint: "/v2/updates/price/latest?encoding=base64&ids[]=", separator: "&ids[]=", suffix: "" };

  private polyMktsPxFeed: PolyMktsPxFeed | undefined;

  constructor(dataHandler: PerpetualDataHandler, priceFeedConfigNetwork: string) {
    this.priceFeedConfigNetwork = priceFeedConfigNetwork;
    this.onChainPxFeeds = new Map<string, OnChainPxFeed>();
    this.dataHandler = dataHandler;
    this.triangulations = new Map<string, [string[], boolean[]]>();
    this.feedInfo = new Map<string, { symbol: string; endpointId: number }[]>();
  }

  /**
   * initialization function. Gathers config from config-hub if url
   * specified
   */
  public async init() {
    let configs: PriceFeedConfig[];
    const configSrc = this.dataHandler.config.configSource;
    if (configSrc == "" || configSrc == undefined) {
      // embedded config
      configs = require("./config/priceFeedConfig.json") as PriceFeedConfig[];
    } else {
      //load remote config
      const res = await fetch(configSrc + "/priceFeedConfig.json");
      if (res.status !== 200) {
        throw new Error(`failed to fetch priceFeedConfig status code: ${res.status}`);
      }
      if (!res.ok) {
        throw new Error(`failed to fetch config (${res.status}): ${res.statusText} ${configSrc}`);
      }
      configs = await res.json();
    }
    this.config = PriceFeeds._selectConfig(configs, this.priceFeedConfigNetwork);

    // if SDK config contains custom price feed endpoints, these override the
    // public/default ones
    if (this.dataHandler.config.priceFeedEndpoints && this.dataHandler.config.priceFeedEndpoints.length > 0) {
      this.config.endpoints = PriceFeeds.overridePriceEndpointsOfSameType(
        this.config.endpoints,
        this.dataHandler.config.priceFeedEndpoints
      );
    }
    for (let k = 0; k < this.config.ids.length; k++) {
      if (this.config.ids[k].type == "onchain") {
        let sym = this.config.ids[k].symbol;
        this.onChainPxFeeds.set(sym, OnChainPxFactory.createFeed(sym)!);
      }
    }
    [this.feedInfo, this.feedEndpoints, this.writeFeedEndpoints] = PriceFeeds._constructFeedInfo(this.config, false);
    // Deny providing no endpoints
    if (this.feedEndpoints.length == 0) {
      throw new Error("PriceFeeds: no endpoints provided in config");
    }
    if (this.writeFeedEndpoints.length == 0) {
      throw new Error("PriceFeeds: no writeEndpoints provided in config");
    }
    this.polyMktsPxFeed = new PolyMktsPxFeed(this.config);
  }

  public getConfig(): PriceFeedConfig {
    if (this.config == undefined) {
      throw Error("init() required");
    }
    return this.config;
  }
  // overridePriceEndpointsOfSameType overrides endpoints of config with same
  // type endpoints provided by user and returns the updated price feed
  // endpoints list.
  public static overridePriceEndpointsOfSameType(
    configEndpoints: PriceFeedEndpoints,
    userProvidedEndpoints: PriceFeedEndpointsOptionalWrite
  ): PriceFeedEndpoints {
    let result = configEndpoints;
    for (let k = 0; k < userProvidedEndpoints.length; k++) {
      for (let j = 0; j < result.length; j++) {
        if (result[j].type == userProvidedEndpoints[k].type) {
          // read only endpoints
          if (userProvidedEndpoints[k].endpoints.length > 0) {
            result[j].endpoints = userProvidedEndpoints[k].endpoints;
            for (let i = 0; i < result[j].endpoints.length; i++) {
              result[j].endpoints[i] = PriceFeeds.trimEndpoint(result[j].endpoints[i]);
            }
          }

          // write endpoints
          if (
            userProvidedEndpoints[k].writeEndpoints !== undefined &&
            userProvidedEndpoints[k].writeEndpoints!.length > 0
          ) {
            result[j].writeEndpoints = userProvidedEndpoints[k].writeEndpoints!;
            for (let i = 0; i < result[j].writeEndpoints.length; i++) {
              result[j].writeEndpoints[i] = PriceFeeds.trimEndpoint(result[j].writeEndpoints[i]);
            }
          }

          break;
        }
      }
    }
    return result;
  }

  /**
   * We cut last / or legacy url format /api/ if any
   * @param endp endpoint string
   * @returns trimmed string
   */
  public static trimEndpoint(endp: string): string {
    // cut last /
    let regex = new RegExp("/$");
    endp = endp.replace(regex, "");
    regex = new RegExp("/api$");
    endp = endp.replace(regex, "");
    return endp;
  }

  /**
   * Pre-processing of triangulations for symbols, given the price feeds
   * @param symbols set of symbols we want to triangulate from price feeds
   */
  public initializeTriangulations(symbols: Set<string>) {
    let feedSymbols = new Array<string>();
    for (let [, value] of this.feedInfo) {
      for (let j = 0; j < value.length; j++) {
        feedSymbols.push(value[j].symbol);
      }
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
   * Get required information to be able to submit a blockchain transaction with
   * price-update such as trade execution, liquidation. Uses write price feed endpoints.
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
   * "latest_price_feeds" and triangulation. Triangulation must be defined in
   * config, unless it is a direct price feed. Uses read endpoints.
   * @param symbol perpetual symbol of the form BTC-USD-MATIC
   * @returns map of feed-price symbol to price/isMarketClosed
   */
  public async fetchPrices(symbols: string[]): Promise<Map<string, [number, boolean]>> {
    let feedPrices = await this.fetchAllFeedPrices();
    let [prices, mktClosed] = this.triangulatePricesFromFeedPrices(symbols, feedPrices);
    let symMap = new Map<string, [number, boolean]>();
    for (let k = 0; k < symbols.length; k++) {
      symMap.set(symbols[k], [prices[k], mktClosed[k]]);
    }
    // set emas
    for (const key of feedPrices.keys()) {
      if (!key.includes(":ema")) {
        continue;
      }
      let p = feedPrices.get(key);
      symMap.set(key, p!);
    }
    return symMap;
  }

  /**
   * Get index prices and market closed information for the given perpetual
   * @param symbol perpetual symbol such as ETH-USD-MATIC
   * @returns Index prices and market closed information; for prediction markets also
   * ema, confidence, and order book parameters.
   */
  public async fetchPricesForPerpetual(symbol: string): Promise<IdxPriceInfo> {
    if (this.polyMktsPxFeed == undefined) {
      throw Error("init() required");
    }
    let indexSymbols = this.dataHandler.getIndexSymbols(symbol).filter((x) => x != "");
    if (this.dataHandler.isPredictionMarket(symbol)) {
      let priceObj = (await this.polyMktsPxFeed.fetchPricesForSyms([indexSymbols[0]]))[0];
      const s3map = await this.fetchFeedPrices([indexSymbols[1]]);
      const s3 = s3map.get(indexSymbols[1])!;
      return {
        s2: priceObj.s2,
        s3: s3[0],
        ema: priceObj.ema,
        s2MktClosed: priceObj.s2MktClosed,
        s3MktClosed: s3[1],
        conf: priceObj.conf,
        predMktCLOBParams: priceObj.predMktCLOBParams,
      } as IdxPriceInfo;
    }
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
    return {
      s2: prices[0],
      s3: prices[1],
      ema: prices[0],
      s2MktClosed: mktClosed[0],
      s3MktClosed: mktClosed[1],
      conf: BigInt(0),
      predMktCLOBParams: BigInt(0),
    } as IdxPriceInfo;
  }

  /**
   * Fetch the provided feed prices and bool whether market is closed or open
   * - requires the feeds to be defined in priceFeedConfig.json
   * - if symbols undefined, all feeds are queried
   * - vaas are not of interest here, therefore only readonly price feed
   *   endpoints are used
   * @param symbols array of feed-price symbols (e.g., [btc-usd, eth-usd]) or
   * undefined
   * @returns mapping symbol-> [price, isMarketClosed], also has an entry
   * <symbol>:ema for each polymarket symbol that maps to the ema price
   */
  public async fetchFeedPrices(symbols?: string[]): Promise<Map<string, [number, boolean]>> {
    if (this.config == undefined) {
      throw Error("init() required");
    }
    let queries = new Array<string>(this.feedEndpoints.length);
    let suffixes = new Array<string>(queries.length);
    let symbolsOfEndpoint: string[][] = [];
    for (let j = 0; j < queries.length; j++) {
      symbolsOfEndpoint.push([]);
    }
    let onChainSyms: string[] = [];
    let polyMktSyms: string[] = [];
    for (let k = 0; k < this.config.ids.length; k++) {
      let currFeed = this.config.ids[k];
      if (symbols != undefined && !symbols.includes(currFeed.symbol)) {
        continue;
      }
      if (currFeed.type == "onchain") {
        onChainSyms.push(currFeed.symbol);
        continue;
      }
      if (currFeed.type == "polymarket") {
        polyMktSyms.push(currFeed.symbol);
        continue;
      }
      const apiFormat = { pyth: this.PYTH, odin: this.PYTH }[currFeed.type];
      if (apiFormat === undefined) {
        throw new Error(`API format for ${currFeed} unknown.`);
      }
      // feedInfo: Map<string, {symbol:string, endpointId: number}[]>; // priceFeedId -> (symbol, endpointId)[]
      let endpointId = this.feedInfo.get(currFeed.id)![0].endpointId;
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
    let polyMktsPromise = this.queryPolyMktsPxFeeds(polyMktSyms);
    let resultPrices = new Map<string, [number, boolean]>();
    for (let k = 0; k < queries.length; k++) {
      if (queries[k] == undefined) {
        continue;
      }
      let [, pxInfo]: [string[], PriceFeedFormat[]] = await this.fetchPriceQuery(queries[k] + suffixes[k]);
      let tsSecNow = Math.round(Date.now() / 1000);
      for (let j = 0; j < pxInfo.length; j++) {
        let price = decNToFloat(BigInt(pxInfo[j].price), -pxInfo[j].expo);
        let isMarketClosed = tsSecNow - pxInfo[j].publish_time > this.THRESHOLD_MARKET_CLOSED_SEC;
        resultPrices.set(symbolsOfEndpoint[k][j], [price, isMarketClosed]);
      }
    }
    let onChPxs = await onChainPromise;
    for (let k = 0; k < onChainSyms.length; k++) {
      let sym = onChainSyms[k];
      resultPrices.set(sym, [onChPxs[k], false]);
    }
    let polyPxs = await polyMktsPromise;
    for (let k = 0; k < polyPxs.length; k++) {
      let sym = polyMktSyms[k];
      if (polyPxs[k] == undefined) {
        continue;
      }
      resultPrices.set(sym, [polyPxs[k]!.s2, polyPxs[k]!.s2MktClosed]);
      resultPrices.set(sym + ":ema", [polyPxs[k]!.ema, polyPxs[k]!.s2MktClosed]);
    }
    return resultPrices;
  }

  private async queryOnChainPxFeeds(symbols: string[]) {
    let prices: number[] = new Array<number>();
    for (let k = 0; k < symbols.length; k++) {
      let sym = symbols[k];
      const feed = this.onChainPxFeeds.get(sym);
      let price = await feed!.getPrice();
      prices.push(price);
    }
    return prices;
  }

  // returns an array with two values per symbol: price, ema
  private async queryPolyMktsPxFeeds(symbols: string[]) {
    if (this.polyMktsPxFeed == undefined) {
      throw Error("init() required");
    }
    let prices;
    let trial = 0;
    while (true) {
      try {
        prices = await this.polyMktsPxFeed.fetchPricesForSyms(symbols);
      } catch (error) {
        if (trial > 4) {
          throw error;
        }
        console.log("fetchPriceForSym failed for " + symbols);
        console.log(error);
        trial++;
        await sleepForSec(1); //seconds
        continue;
      }
      break;
    }
    return prices;
  }

  /**
   * Get all configured feed prices via "latest_price_feeds".
   * @returns map of feed-price symbol to price/isMarketClosed
   */
  public async fetchAllFeedPrices(): Promise<Map<string, [number, boolean]>> {
    return this.fetchFeedPrices();
  }

  /**
   * Get the latest prices for a given perpetual from the offchain oracle
   * networks. Uses write price feed endpoints.
   * @param symbol perpetual symbol of the form BTC-USD-MATIC
   * @returns array of price feed updates that can be submitted to the smart
   * contract and corresponding price information
   */
  public async fetchLatestFeedPriceInfoForPerpetual(symbol: string): Promise<PriceFeedSubmission> {
    if (this.config == undefined) {
      throw Error("init() required");
    }
    // get the feedIds that the contract uses
    let feedIds = this.dataHandler.getPriceIds(symbol);
    let queries = new Array<string>();
    let symbols = new Map<string, string[]>();
    for (let k = 0; k < feedIds.length; k++) {
      let info = this.feedInfo.get(feedIds[k]);
      if (info == undefined) {
        throw new Error(`priceFeeds: config for symbol ${symbol} insufficient`);
      }
      // we use the first endpoint for a given symbol even if there is another symbol with the same id
      let idx = info[0].endpointId;
      let feedId = feedIds[k];
      queries.push(this.writeFeedEndpoints[idx] + "/v2/updates/price/latest?encoding=base64&ids[]=" + feedId);

      for (let j = 0; j < info.length; j++) {
        if (symbols.has(feedId)) {
          let v = symbols.get(feedId);
          v!.push(info[j].symbol);
          symbols.set(feedId, v!);
        } else {
          symbols.set(feedId, [info[j].symbol]);
        }
      }
    }

    let data;
    try {
      data = await Promise.all(
        queries.map(async (q) => {
          if (q != undefined) {
            return this.fetchVAAQuery(q);
          } else {
            return { vaas: [], prices: [] };
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
            return { vaas: [], prices: [] };
          }
        })
      );
      console.log("success");
    }

    const priceFeedUpdates = new Array<string>();
    const prices = new Array<number>();
    const mktClosed = new Array<boolean>();
    const timestamps = new Array<number>();
    const tsSecNow = Math.round(Date.now() / 1000);
    for (let k = 0; k < feedIds.length; k++) {
      let pxInfo: PriceFeedFormat = data[k].prices[0];
      let price = decNToFloat(BigInt(pxInfo.price), -pxInfo.expo);
      prices.push(price);
      priceFeedUpdates.push(data[k].vaas[0]);
      let isMarketClosed = tsSecNow - pxInfo.publish_time > this.THRESHOLD_MARKET_CLOSED_SEC;
      mktClosed.push(isMarketClosed);
      timestamps.push(pxInfo.publish_time);
    }
    return {
      symbols: symbols,
      ids: feedIds,
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
      const syms = feeds.symbols.get(feeds.ids[j]);
      if (syms == undefined) {
        console.log("calculateTriangulatedPricesFromFeedInfo: could not find symbol for id ", feeds.ids[j]);
        continue;
      }
      for (let k = 0; k < syms.length; k++) {
        // add price feed for all symbols that use this id
        priceMap.set(syms[k], [feeds.prices[j], feeds.isMarketClosed[j]]);
      }
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
   * We expect one single id in the query,
   * otherwise the VAA is a compressed VAA for all prices which is not suited
   * for the smart contracts
   * @param query query price-info from endpoint
   * @returns vaa and price info
   */
  private async fetchVAAQuery(query: string): Promise<{ vaas: string[]; prices: PriceFeedFormat[] }> {
    const headers = { headers: { "Content-Type": "application/json" } };
    let response = await fetch(query, headers);
    if (!response.ok) {
      throw new Error(`Failed to fetch posts (${response.status}): ${response.statusText} ${query}`);
    }
    let values = (await response.json()) as PythV2LatestPriceFeed;
    const vaas = new Array<string>();
    const prices = new Array<PriceFeedFormat>();
    for (let k = 0; k < values.parsed.length; k++) {
      // see also fetchPriceQuery for idx
      const idx = k % values.binary.data.length;
      vaas.push("0x" + Buffer.from(values.binary.data[idx], "base64").toString("hex"));
      prices.push(values.parsed[k].price);
    }
    return { vaas, prices };
  }

  /**
   * Queries the REST endpoint and returns parsed price data
   * @param query query price-info from endpoint
   * @returns vaa and price info
   */
  public async fetchPriceQuery(query: string): Promise<[string[], PriceFeedFormat[]]> {
    let values: PythV2LatestPriceFeed;
    const cached = this.cache.get(query);
    const tsNow = Date.now() / 1_000;
    if (cached && cached.timestamp + 1 > tsNow) {
      // less than one second has passed since the last query - no need to query again
      values = cached.values;
    } else {
      const headers = { headers: { "Content-Type": "application/json" } };
      let response = await fetch(query, headers);
      if (!response.ok) {
        throw new Error(`Failed to fetch posts (${response.status}): ${response.statusText} query:${query}`);
      }
      values = await response.json();
      this.cache.set(query, { timestamp: tsNow, values: values });
    }
    const priceFeedUpdates = new Array<string>();
    const px = new Array<PriceFeedFormat>();
    for (let k = 0; k < values.parsed.length; k++) {
      // pyth v2 only provides one compressed vaa when querying multiple prices.
      // contracts can only use separate ones. In case we get only one vaa,
      // here we add the single vaa in each price-update
      const idx = k % values.binary.data.length;
      priceFeedUpdates.push("0x" + Buffer.from(values.binary.data[idx], "base64").toString("hex"));
      px.push(values.parsed[k].price as PriceFeedFormat);
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
  ): [Map<string, { symbol: string; endpointId: number }[]>, string[], string[]] {
    let feed = new Map<string, [{ symbol: string; endpointId: number }]>();
    let endpointId = -1;
    let type = "";
    let feedEndpoints = new Array<string>();
    let writeFeedEndpoints = new Array<string>();

    for (let k = 0; k < config.endpoints.length; k++) {
      const L = config.endpoints[k].endpoints.length;
      let endpointNr = !shuffleEndpoints ? 0 : 1 + Math.floor(Math.random() * (L - 1));
      // if config has only one endpoint:
      endpointNr = Math.min(endpointNr, L - 1);
      feedEndpoints.push(config.endpoints[k].endpoints[endpointNr]);

      // write endpoints
      const n = config.endpoints[k].writeEndpoints.length;
      const useEndpoint = Math.min(!shuffleEndpoints ? 0 : 1 + Math.floor(Math.random() * (n - 1)), n - 1);
      writeFeedEndpoints.push(config.endpoints[k].writeEndpoints[useEndpoint]);
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
          throw new Error(`priceFeeds: no endpoint found for ${type} check priceFeedConfig`);
        }
      }
      // one id can have multiple symbols pointing to it
      const id = config.ids[k].id;
      const item = { symbol: config.ids[k].symbol.toUpperCase(), endpointId: endpointId };
      if (feed.has(id)) {
        feed.get(id)?.push(item);
      } else {
        feed.set(id, [item]);
      }
    }
    return [feed, feedEndpoints, writeFeedEndpoints];
  }
}
