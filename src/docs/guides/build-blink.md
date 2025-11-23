# How to build a donation blink

URL: https://docs.monad.xyz/guides/blinks-guide

In this guide, you will learn how to build a [Blink](https://www.dialect.to/) that allows people to donate MON with a single click.

## Prerequisites

- Code Editor of your choice ( [Cursor](https://www.cursor.com/) or [Visual Studio Code](https://code.visualstudio.com/) recommended).
- [Node](https://nodejs.org/en/download) 18.x.x or above.
- Basic TypeScript knowledge.
- Testnet MON ( [Faucet](https://testnet.monad.xyz) ).

## Initial setup

### Initialize the project

```bash
npx create-next-app@14 blink-starter-monad && cd blink-starter-monad
```

**When prompted, configure your project with these settings:**

- 鉁� Ok to proceed? 鈫� Yes
- 鉁� Would you like to use TypeScript? 鈫� Yes
- 鉁� Would you like to use ESLint? 鈫� Yes
- 鉁� Would you like to use Tailwind CSS? 鈫� Yes
- 鉁� Would you like your code inside a `src/` directory? 鈫� Yes
- 鉁� Would you like to use App Router? 鈫� Yes
- 鉁� Would you like to customize the import alias ( `@/*` by default)? 鈫� No

### Install dependencies

```bash
npm install @solana/actions wagmi viem@2.x
```

### Start development server

The development server is used to start a local test environment that runs on your computer. It is perfect to test and develop your blink, before you ship it to production.

```bash
npm run dev
```

## Building the Blink

Now that we have our basic setup finished, it is time to start building the blink.

### Create an endpoint

To write a blink provider, you have to create an endpoint. Thanks to NextJS, this all works pretty straightforward. All you have to do is to create the following folder structure:

```text
src/
鈹斺攢鈹€ app/
    鈹斺攢鈹€ api/
            鈹斺攢鈹€ actions/
                鈹斺攢鈹€ donate-mon/
                    鈹斺攢鈹€ route.ts
```

### Create actions.json

Create a route in `app` folder for the `actions.json` file which will be hosted in the root directory of our application. This file is needed to tell other applications which blink providers are available on your website. **Think of it as a sitemap for blinks.**

You can read more about the [actions.json](https://docs.dialect.to/documentation/actions/specification/actions.json) in the official [Dialect documentation](https://docs.dialect.to/documentation/actions/specification/actions.json) .

```text
src/
鈹斺攢鈹€ app/
    鈹斺攢鈹€ actions.json/
        鈹斺攢鈹€ route.ts
```

route.ts src > app > actions.json

```js
import { ACTIONS_CORS_HEADERS, ActionsJson } from "@solana/actions";

export const GET = async () => {
  const payload: ActionsJson = {
    rules: [
      // map all root level routes to an action
      {
        pathPattern: "/*",
        apiPath: "/api/actions/*",
      },
      // idempotent rule as the fallback
      {
        pathPattern: "/api/actions/**",
        apiPath: "/api/actions/**",
      },
    ],
  };

  return Response.json(payload, {
    headers: ACTIONS_CORS_HEADERS,
  });
};

// DO NOT FORGET TO INCLUDE THE `OPTIONS` HTTP METHOD
// THIS WILL ENSURE CORS WORKS FOR BLINKS
export const OPTIONS = GET;
```

### Add an image for the blink

Every blink has an image that is rendered on top. If you have your image already hosted somewhere, you can skip this step but if you haven't you can just create a `public` folder in your `NextJS` project and paste an image there.

In our example we will paste a file called `donate-mon.png` into this public folder. You can right-click and save the image below.

![donate-mon](/assets/images/donate-mon-edb8311848894b2ec7edae30bcaadaad.png)

![image](/assets/images/1-c444ef3a9462501ae42703a600d0e3ee.png)

### OPTIONS endpoint and headers

This enables CORS for cross-origin requests and standard headers for the API endpoints. This is standard configuration you do for every Blink.

route.ts src > app > api > actions > donate-mon

```js
// CAIP-2 format for Monad
const blockchain = `eip155:10143`;

// Create headers with CAIP blockchain ID
const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers":
  "Content-Type, x-blockchain-ids, x-action-version",
  "Content-Type": "application/json",
  "x-blockchain-ids": blockchain,
  "x-action-version": "2.0",
};

// OPTIONS endpoint is required for CORS preflight requests
// Your Blink won't render if you don't add this
export const OPTIONS = async () => {
  return new Response(null, { headers });
};
```

### GET endpoint

`GET` returns the Blink metadata and UI configuration.

It describes:

- How the Action appears in Blink clients
- What parameters users need to provide
- How the Action should be executed
route.ts src > app > api > actions > donate-mon

```js
import {
  ActionGetResponse,
} from "@solana/actions";

// GET endpoint returns the Blink metadata (JSON) and UI configuration
export const GET = async (req: Request) => {
  // This JSON is used to render the Blink UI
  const response: ActionGetResponse = {
    type: "action",
    icon: `${new URL("/donate-mon.png", req.url).toString()}`,
    label: "1 MON",
    title: "Donate MON",
    description:
      "This Blink demonstrates how to donate MON on the Monad blockchain. It is a part of the official Blink Starter Guides by Dialect Labs.  \n\nLearn how to build this Blink: https://dialect.to/docs/guides/donate-mon",
    // Links is used if you have multiple actions or if you need more than one params
    links: {
      actions: [
        {
          // Defines this as a blockchain transaction
          type: "transaction",
          label: "0.01 MON",
          // This is the endpoint for the POST request
          href: `/api/actions/donate-mon?amount=0.01`,
        },
        {
          type: "transaction",
          label: "0.05 MON",
          href: `/api/actions/donate-mon?amount=0.05`,
        },
        {
          type: "transaction",
          label: "0.1 MON",
          href: `/api/actions/donate-mon?amount=0.1`,
        },
        {
          // Example for a custom input field
          type: "transaction",
          href: `/api/actions/donate-mon?amount={amount}`,
          label: "Donate",
          parameters: [
            {
              name: "amount",
              label: "Enter a custom MON amount",
              type: "number",
            },
          ],
        },
      ],
    },
  };

  // Return the response with proper headers
  return new Response(JSON.stringify(response), {
    status: 200,
    headers,
  });
};
```

### Testing the Blink

Visit [dial.to](https://dial.to) and type in the link to your blink to see if it works. If your server runs on localhost:3000 the url should be like this: `http://localhost:3000/api/actions/donate-mon`

info
[dial.to](https://dial.to) currently supports only GET previews for EVM. To test your POST endpoint, we need to build a Blink Client.

![testing blink](/assets/images/2-45cfc9833636a2f6c3123d5267cd9cf8.png)

### POST endpoint

`POST` handles the actual MON transfer transaction.

#### POST request to the endpoint

Create the post request structure and add the necessary imports as well as the `donationWallet` on top of the file.

route.ts src > app > api > actions > donate-mon

```js
// Update the imports
import { ActionGetResponse, ActionPostResponse } from "@solana/actions";
import { serialize } from "wagmi";
import { parseEther } from "viem";

// Wallet address that will receive the donations
const donationWallet = `<RECEIVER_ADDRESS>`;

// POST endpoint handles the actual transaction creation
export const POST = async (req: Request) => {
  try {
  
  // Code that goes here is in the next step
  
  } catch (error) {
    // Log and return an error response
    console.error("Error processing request:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers,
    });
  }
};
```

#### Extract data from request

The request contains the URL and the account (PublicKey) from the payer.

route.ts src > app > api > actions > donate-mon

```js
// POST endpoint handles the actual transaction creation
export const POST = async (req: Request) => {
  try {
    // Step 1
    // Extract amount from URL
    const url = new URL(req.url);
    const amount = url.searchParams.get("amount");

    if (!amount) {
        throw new Error("Amount is required");
    }

  } catch (error) {
    // Error handling
  }
}
```

#### Create the transaction

Create a new transaction with all the necessary data and add it below in the `POST` request.

route.ts src > app > api > actions > donate-mon

```js
// POST endpoint handles the actual transaction creation
export const POST = async (req: Request) => {
  try {

    // ... previous code from step
    
    // Build the transaction
    const transaction = {
        to: donationWallet,
        value: parseEther(amount).toString(),
        chainId: 10143,
    };

    const transactionJson = serialize(transaction);
  
  } catch (error) {
    // Error handling
  }
}
```

#### Return the transaction in response.

Create `ActionPostResponse` and return it to the client.

route.ts src > app > api > actions > donate-mon

```ts
export const POST = async (req: Request) => {
  try {
    // ... previous code from step 1 and 2
    
    // Build ActionPostResponse
    const response: ActionPostResponse = {
        type: "transaction",
        transaction: transactionJson,
        message: "Donate MON",
    };

    // Return the response with proper headers
    return new Response(JSON.stringify(response), {
        status: 200,
        headers,
    });

  } catch (error) {
    // Error handling
  }
}
```

### Full code in `route.ts`

route.ts src > app > api > actions > donate-mon

```ts
import { ActionGetResponse, ActionPostResponse } from "@solana/actions";
import { serialize } from "wagmi";
import { parseEther } from "viem";

// CAIP-2 format for Monad
const blockchain = `eip155:10143`;

// Wallet address that will receive the donations
const donationWallet = `<RECEIVER_ADDRESS>`;

// Create headers with CAIP blockchain ID
const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers":
  "Content-Type, x-blockchain-ids, x-action-version",
  "Content-Type": "application/json",
  "x-blockchain-ids": blockchain,
  "x-action-version": "2.0",
};

// OPTIONS endpoint is required for CORS preflight requests
// Your Blink won't render if you don't add this
export const OPTIONS = async () => {
  return new Response(null, { headers });
};

// GET endpoint returns the Blink metadata (JSON) and UI configuration
export const GET = async (req: Request) => {
  // This JSON is used to render the Blink UI
  const response: ActionGetResponse = {
    type: "action",
    icon: `${new URL("/donate-mon.png", req.url).toString()}`,
    label: "1 MON",
    title: "Donate MON",
    description:
      "This Blink demonstrates how to donate MON on the Monad blockchain. It is a part of the official Blink Starter Guides by Dialect Labs.  \n\nLearn how to build this Blink: https://dialect.to/docs/guides/donate-mon",
    // Links is used if you have multiple actions or if you need more than one params
    links: {
      actions: [
        {
          // Defines this as a blockchain transaction
          type: "transaction",
          label: "0.01 MON",
          // This is the endpoint for the POST request
          href: `/api/actions/donate-mon?amount=0.01`,
        },
        {
          type: "transaction",
          label: "0.05 MON",
          href: `/api/actions/donate-mon?amount=0.05`,
        },
        {
          type: "transaction",
          label: "0.1 MON",
          href: `/api/actions/donate-mon?amount=0.1`,
        },
        {
          // Example for a custom input field
          type: "transaction",
          href: `/api/actions/donate-mon?amount={amount}`,
          label: "Donate",
          parameters: [
            {
              name: "amount",
              label: "Enter a custom MON amount",
              type: "number",
            },
          ],
        },
      ],
    },
  };

  // Return the response with proper headers
  return new Response(JSON.stringify(response), {
    status: 200,
    headers,
  });
};

// POST endpoint handles the actual transaction creation
export const POST = async (req: Request) => {
    try {
      // Extract amount from URL
      const url = new URL(req.url);
      const amount = url.searchParams.get("amount");

      if (!amount) {
          throw new Error("Amount is required");
      }

      // Build the transaction
      const transaction = {
          to: donationWallet,
          value: parseEther(amount).toString(),
          chainId: 10143,
      };

      const transactionJson = serialize(transaction);

      // Build ActionPostResponse
      const response: ActionPostResponse = {
          type: "transaction",
          transaction: transactionJson,
          message: "Donate MON",
      };

      // Return the response with proper headers
      return new Response(JSON.stringify(response), {
          status: 200,
          headers,
      });
    } catch (error) {
      // Log and return an error response
      console.error("Error processing request:", error);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers,
      });
  }
};
```

At this point the Blink is ready, but we need a Blink client since [dial.to](https://dial.to) does not support EVM wallets.

## Implementing the Blink client

In this step you will learn to implement the blink client, which is the visual representation of a blink.

### Install dependencies

```bash
npm install connectkit @tanstack/react-query @dialectlabs/blinks
```

### Implement the provider

The provider is necessary to trigger wallet actions in the blink.

### Create config for `WagmiProvider`

This file is used to set the proper configurations for the `WagmiProvider` in the next step.

config.ts src

```ts
import { http, createConfig } from "wagmi";
import { monadTestnet } from "wagmi/chains";

export const config = createConfig({
  chains: [monadTestnet],
  transports: {
    [monadTestnet.id]: http(),
  },
});
```

### Create the wallet connection context providers

Create the provider that we can use to wrap around our app. Don't forget to use the `"use client";` at the top of the file if you are in a NextJS project.

info
In this project, we are using [ConnectKit](https://docs.family.co/connectkit) but you can use other alternatives as well (Eg: [RainbowKit](https://www.rainbowkit.com/) )

provider.tsx src

```tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider } from "connectkit";
import { type PropsWithChildren } from "react";
import { WagmiProvider } from "wagmi";
import { config } from "@/config";

const queryClient = new QueryClient();

export const Providers = ({ children }: PropsWithChildren) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>{children}</ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
```

### Wrap the app with context provider

If you want your provider to be accessible throughout your app, it is recommended to wrap it around the `children` element in your `layout.tsx` .

layout.tsx src > app

```tsx
// additional import
import { Providers } from "@/provider";

// other code in the file ...

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
          <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### Using the `Blink` component

Now that we have everything wrapped, we can start with the implementation of the blink renderer. To do so open the `page.tsx` file in your `/src/app` folder.

page.tsx src > app

```tsx
"use client";

import {
  Blink,
  useBlink,
  useActionsRegistryInterval,
} from "@dialectlabs/blinks";

import "@dialectlabs/blinks/index.css";

import { useEvmWagmiAdapter } from "@dialectlabs/blinks/hooks/evm";

import { ConnectKitButton, useModal } from "connectkit";

export default function Home() {
  // Actions registry interval
  useActionsRegistryInterval();

  // ConnectKit modal
  const { setOpen } = useModal();

  // Wagmi adapter, used to connect to the wallet
  const { adapter } = useEvmWagmiAdapter({
    onConnectWalletRequest: async () => {
      setOpen(true);
    },
  });

  // Action we want to execute in the Blink
  const { blink, isLoading } = useBlink({
    url: "evm-action:http://localhost:3000/api/actions/donate-mon",
  });

  return (
    <main className="flex flex-col items-center justify-center">
      <ConnectKitButton />
      <div className="w-1/2 lg:px-4 lg:p-8">
        {isLoading || !blink ? (
          <span>Loading</span>
        ) : (
          // Blink component, used to execute the action
          <Blink blink={blink} adapter={adapter} securityLevel="all" />
        )}
      </div>
    </main>
  );
}
```

### Make a transaction

That's it. To test it, visit [localhost:3000](http://localhost:3000) and click on a button or enter a custom amount that you want to donate.

![blink client](/assets/images/3-d36ed0ec501b4e794e39389b9c8a6c93.png)

## Conclusion

In this tutorial, you learned how you can create a blink that sends MON to another wallet from scratch using a `NextJS` project. Besides the basic project setup there were two important things that we built.

The first thing was the blink provider. This provider works as an API for the blink and handles how the blink is rendered in the fronend ( `GET` request) and executes the blockchain transaction ( `POST` request).

The second implementation was the blink client. This client serves as the visual representation of the blink and is what the user sees and uses to interact with the blink provider.

These are two separate parts, which means you can build a blink without worrying about the client implementation and you can implement clients for existing blinks without the need to build your own blink.