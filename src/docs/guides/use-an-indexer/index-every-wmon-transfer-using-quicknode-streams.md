# How to index every WMON transfer using QuickNode Streams

URL: https://docs.monad.xyz/guides/indexers/quicknode-streams

In this guide, you will learn how to use QuickNode Streams to index every [WMON](https://testnet.monadvision.com/token/0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701) transfer, including internal transactions, on Monad Testnet.

## What is QuickNode Streams?

[QuickNode Streams](https://www.quicknode.com/docs/streams/getting-started) is a web3 data streaming solution supporting real-time and historical Monad data that offers:

- **Reliable Data Delivery** - Exactly-once, guaranteed delivery, seamlessly integrating with your data lake. Streams ensures every block, receipt, or trace is delivered exactly-once in the order of dataset finality, preventing issues like corrupt or missing data
- **Real-Time Data Consistency** - Consistent, live data streaming
- **Efficient Historical Data Handling** - Configurable date ranges and destinations for streamlined historical data management
- **Easy Integration** - Simple setup through a user-friendly interface
- **Transparent User Experience** - Clear logging, metrics, and usage tracking

## Setup Guide

### 1. Initial setup

1. Sign up for [QuickNode](https://dashboard.quicknode.com/?prompt=signup) and log into your dashboard.
2. Click on "Streams" in the left sidebar.
![QuickNode Dashboard](/assets/images/1-e44c6a49a03ba48444f2c82f45f81b06.png)

1. Click on "Create Stream".
![Create Stream Button](/assets/images/2-0475f9d7f84bf980bfd61938d6b923ef.png)

### 2. Configure Stream range

1. Give your stream a name. In this example we will name it `monad-quicknode-stream` .
2. In the "Network" section, select `Monad` from the dropdown.
3. In the "Stream Start" section you can choose to start the stream from the latest block or from a specific block number.
![Stream Configuration](/assets/images/3-4f724774cb60c4b933ecfdf708fe56b7.png)

1. In the "Stream End" section you can choose to end the stream until manually paused or at a specific block number.
2. In the "Latest block delay" section, you can set a block number as a delay in receiving data. For this guide we will receive data as soon as it is available.

For example: If the block delay is `3` , you will receive data only when there is **new data available** for `3` blocks including latest block, this helps in case there is a reorg.
3. In the "Restream on reorg" section you can decide if you would like to get updated data restreamed in case of a reorg. For this guide we will keep this off.
4. Once done click "Next".
![Additional Settings](/assets/images/4-1ec6aca440c17ab3d4d3e780a4e1e8e8.png)

### 3. Set up dataset

1. In the "Dataset" dropdown you can select the dataset of your choice according to the use case. For this guide we will select `Block with Receipts` since we want to filter logs with events emitted by WMON contract.

- Optional: Enable "Batch messages" to receive multiple blocks in a single message. This can be useful when the stream is not starting from the latest block.
![Dataset Selection](/assets/images/5-db2bcd4dceb4210f1afcdff5bfe5e976.png)

1. Feel free to test it out by entering a block number and clicking "Fetch payload".
![Raw Payload Example](/assets/images/6-003111519bce304d2f52f0ff69f3a5a4.png)

### 4. Create WMON Transfer filter

1. In the "Modify the stream payload" section, you can define filters by clicking **"Customize your payload"** . For this guide, we will filter to only retrieve receipts involving WMON transfers.
![modify stream image](/assets/images/7-1393c3b984c2c78a1b29878b95999683.png)

1. QuickNode has a set of filter templates. Select the **Decoded ERC20 transfers** template:
![image for filter](/assets/images/8-c798283fcc88e8e7b43857d095cf3155.png)

1. The editor will appear:
![image of filter editor](/assets/images/9-8dbd25c196f63f7d54d62072658f8db1.png)

The current filter allows all ERC20 transfers through. Replace the filter code with:

```js
function main(stream) {  
  const erc20Abi = `[{
    "anonymous": false,
    "inputs": [
      {"indexed": true, "type": "address", "name": "from"},
      {"indexed": true, "type": "address", "name": "to"},
      {"indexed": false, "type": "uint256", "name": "value"}
    ],
    "name": "Transfer",
    "type": "event"
  }]`;
  
  const data = stream.data ? stream.data : stream;
  
  // Decodes logs from the receipts that match the Transfer event ABI
  var result = decodeEVMReceipts(data[0].receipts, [erc20Abi]);
  
  // Filter for receipts with decoded logs
  result = result.filter(receipt => {
        // Check if there are any ERC20 transfers
        if(receipt.decodedLogs) {
            // Check if there are any WMON transfers
            receipt.decodedLogs = receipt.decodedLogs.filter(log => log.address == "0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701");
            
            // Return receipt if there logs which indicate a WMON transfer.
            return receipt.decodedLogs.length > 0;
        }

        // Return nothing if there are no ERC20 transfers.
        return false;
    });
  
  return { result };
}
```

1. Test the filter with "Run test"
![run test image](/assets/images/10-581e33b351b314a24b2f236fcd8443a7.png)

1. "Save & close" to save the filter.
![save &amp; close image](/assets/images/11-0c6109073814911fdfe898b6882362d9.png)

1. Click "Next"

### 5. Set up Stream destination

For this guide we will keep the stream destination simple and use `Webhook` as the "Destination Type".

1. Let's use a site like [Svix Play](https://www.svix.com/play/) to quickly get a webhook and test the stream.
![svix play image](/assets/images/12-7c47a21d187cd2a9ebe9e225a8bcf7eb.png)

1. Copy the webhook url from Svix Play:
![svix play copy url image](/assets/images/13-5a98140ef7def4905f19c6ee7673d7c4.png)

1. In QuickNode:

- Select `Webhook` as destination type
- Paste your webhook URL
- We can keep the rest of the settings as default
![webhook dropdown image](/assets/images/14-db08e8eba828bff26f6b01091e3da874.png)

1. Click on "Check Connection" to test the webhook url. Check if you received the "PING" message in the Svix Play dashboard.
![check connection image](/assets/images/15-3068daa0ac05f6de73942dbab0eb64c6.png)

![ping message image](/assets/images/16-f9ec583f8fe88c01fdbc0ea604924420.png)

1. Click "Send Payload" to send a test payload to the webhook.
![add send payload image](/assets/images/17-6c8de643bde3065f405d9a55939f38e2.png)

![svix payload image](/assets/images/18-e5e77d3b84736ca6ec9a1e5f658b3831.png)

1. Finally click "Create a Stream" to create the stream.
![create stream image](/assets/images/19-09c29dd2b50693670d95a9088ebd5022.png)

### 6. Launch and Monitor

You should now be able to see the stream delivering the messages to the webhook!

![stream delivering image](/assets/images/20-5360727c8e272af09ad198b0ebedad3a.png)

![svix streaming receiving message video](/assets/images/1-d404d7aa9fbb1e12dc07a1be19570e2d.gif)

You can pause the stream by clicking the switch in the top right corner.

![pause switch image](/assets/images/21-97162eac1d96a635487439bdda885524.png)

## Next Steps

- Monitor your stream's performance in the QuickNode dashboard
- Adjust filter parameters as needed
- Connect to your production webhook endpoint when ready
Your stream will now track all WMON transfers until manually paused or until reaching your specified end block.