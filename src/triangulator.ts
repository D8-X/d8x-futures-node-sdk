export default class Triangulator {
  /**
   * Find all possible triangulation paths
   * @param ccyBase array of base currencies ['BTC', 'ETH', 'MATIC', ...]
   * @param ccyQuote array of quote currencies corresponding to base ['USD', 'USD', ...]
   * @param pair pair we want to calculate, e.g. BTC-USDC
   * @returns array of different paths for which multiplication leads to
   *  desired pair, e.g. [['MATIC-USD'], ['MATIC-ETH', 'ETH-USD']]
   */
  public static findPath(ccyBase: string[], ccyQuote: string[], pair: string): Array<Array<string>> {
    let [base, quote] = pair.split("-");
    let paths = new Array<Array<string>>();
    for (let k = 0; k < ccyBase.length; k++) {
      let currentPath: string[] = [];
      if (ccyBase[k] == base) {
        currentPath.push(ccyBase[k] + "-" + ccyQuote[k]);
        if (ccyQuote[k] == quote) {
          // we are done
          paths.push(currentPath);
        } else {
          // find path for ccyQuote[k]-quote without the currency
          let newBase = new Array<string>();
          let newQuote = new Array<string>();
          for (let j = 0; j < ccyBase.length; j++) {
            if (j != k && ccyQuote[j] + "-" + ccyBase[j] != ccyBase[k] + "-" + ccyQuote[k]) {
              newBase.push(ccyBase[j]);
              newQuote.push(ccyQuote[j]);
            }
          }
          let recPaths = Triangulator.findPath(newBase, newQuote, ccyQuote[k] + "-" + quote);
          for (let j = 0; j < recPaths.length; j++) {
            paths.push(currentPath.concat(recPaths[j]));
          }
        }
      }
    }
    return paths;
  }

  /**
   * Calculate the triangulated price from underlying prices
   * @param triangulation triangulation of with symbol and is-inverted flag 
   * @param feedIdxPrices map of symbol to price
   * @returns triangulated price (scalar), true if market closed or price unavailable
   */
  public static calculateTriangulatedPrice(triangulation: [string[], boolean[]], feedIdxPrices: Map<string, [number, boolean]>) : [number,boolean] {
    let px = 1;
    let isOpen = true;
    for (let j = 0; j < triangulation[0].length; j++) {
      let pxFeed : [number, boolean]|undefined = feedIdxPrices.get(triangulation[0][j]);
      if (pxFeed == undefined) {
        // no price available for given index
        return [-1, true];
      }
      px = triangulation[1][j] ? px / pxFeed[0] : px * pxFeed[0];
      let isClosed = pxFeed[1];
      isOpen = isOpen && !isClosed;
    }
    return [px, !isOpen];
  }

  /**
   * Finds shortest path and returns indices required and whether to divide or not
   * @example triangulate BTC-USDC:  [ [ 'BTC-USD', 'USDC-USD' ], [ false, true ] ]
   * @param ccyArr array of available indices (e.g. from websocket)
   * @param symbol symbol we are looking for (e.g. MATIC-USDC)
   * @returns shortest path with given indices, array whether we have to divide (true) or multiply
   *  to arrive at the desired price
   */
  public static triangulate(ccyArr: string[], symbol: string): [string[], boolean[]] {
    let ccyBase = ccyArr.map((x) => x.split("-")[0]);
    let ccyQuote = ccyArr.map((x) => x.split("-")[1]);
    let p = Triangulator.findPath(ccyBase.concat(ccyQuote), ccyQuote.concat(ccyBase), symbol);
    if (p.length == 0) {
      return [[], []];
    }
    let len = p.map((x) => x.length);
    let minLen = 100;
    let minIdx = -1;
    for (let j = 0; j < p.length; j++) {
      if (len[j] < minLen) {
        minLen = len[j];
        minIdx = j;
        if (minLen == 1) {
          break;
        }
      }
    }
    let path = p[minIdx];
    let invert = new Array<boolean>();
    let indexPath = new Array<string>();
    for (let k = 0; k < path.length; k++) {
      if (ccyArr.includes(path[k], 0)) {
        indexPath.push(path[k]);
        invert.push(false);
      } else {
        let inv = path[k].split("-");
        indexPath.push(inv[1] + "-" + inv[0]);
        invert.push(true);
      }
    }

    return [indexPath, invert];
  }
}
