<a name="AccountTrade"></a>

## AccountTrade
<p>Account and Trade
This class requires a private key and executes smart-contract interaction that
require gas-payments.</p>

**Kind**: global class  

* [AccountTrade](#AccountTrade)
    * [new AccountTrade(config, privateKey)](#new_AccountTrade_new)
    * [.order(order)](#AccountTrade+order) ⇒
    * [._order(order, traderAddr, symbolToPerpetualMap, proxyContract, orderBookContract, chainId, signer, gasLimit)](#AccountTrade+_order) ⇒
    * [._createSignature(order, chainId, isNewOrder, signer, proxyAddress)](#AccountTrade+_createSignature) ⇒

<a name="new_AccountTrade_new"></a>

### new AccountTrade(config, privateKey)
<p>Constructor</p>


| Param | Description |
| --- | --- |
| config | <p>configuration</p> |
| privateKey | <p>private key of account that trades</p> |

<a name="AccountTrade+order"></a>

### accountTrade.order(order) ⇒
<p>Order/Trade</p>

**Kind**: instance method of [<code>AccountTrade</code>](#AccountTrade)  
**Returns**: <p>transaction hash</p>  

| Param | Description |
| --- | --- |
| order | <p>order struct</p> |

<a name="AccountTrade+_order"></a>

### accountTrade.\_order(order, traderAddr, symbolToPerpetualMap, proxyContract, orderBookContract, chainId, signer, gasLimit) ⇒
<p>Static order function</p>

**Kind**: instance method of [<code>AccountTrade</code>](#AccountTrade)  
**Returns**: <p>transaction hash</p>  

| Param | Description |
| --- | --- |
| order | <p>order type (not SmartContractOrder but Order)</p> |
| traderAddr | <p>trader address</p> |
| symbolToPerpetualMap | <p>maps the symbol (MATIC-USD-MATIC)-type format to the perpetual id</p> |
| proxyContract | <p>contract instance of D8X perpetuals</p> |
| orderBookContract | <p>order book contract or null</p> |
| chainId | <p>chain Id of network</p> |
| signer | <p>instance of ethers wallet that can write</p> |
| gasLimit | <p>gas limit to be used for the trade</p> |

<a name="AccountTrade+_createSignature"></a>

### accountTrade.\_createSignature(order, chainId, isNewOrder, signer, proxyAddress) ⇒
<p>Creates a signature</p>

**Kind**: instance method of [<code>AccountTrade</code>](#AccountTrade)  
**Returns**: <p>signature as string</p>  

| Param | Description |
| --- | --- |
| order | <p>smart-contract-type order</p> |
| chainId | <p>chainId of network</p> |
| isNewOrder | <p>true unless we cancel</p> |
| signer | <p>ethereum-type wallet</p> |
| proxyAddress | <p>address of the contract</p> |

