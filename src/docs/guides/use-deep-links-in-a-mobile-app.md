# How to build custom deep links in an Expo-based mobile app

URL: https://docs.monad.xyz/guides/deeplinks-using-expo

Deep links are URLs that take users directly to specific content within a mobile app or website, rather than just launching the app's home screen. They work like shortcuts, enabling smoother navigation and improving user experience.

In this guide, you will learn the basics of adding deep links into your [Expo](https://docs.expo.dev/) -based mobile app.

## What are deep links?

Deep link is constructed by three parts:

- **Scheme** : The URL scheme that identifies the app that should open the URL (example: myapp://). It can also be https or http for non-standard deep links.
- **Host** : The domain name of the app that should open the URL (example: web-app.com).
- **Path** : The path to the screen that should be opened (example: /product). If the path isn't specified, the user is taken to the home screen of the app.
Deep links can also have params just like web links!

Example:

```text
rnwalletapp://swap?from={token}&to={token}&amount={amount}
```

## Building a deep link

note
If you'd like to try a deep link demo you can do by cloning [this](https://github.com/monad-developers/expo-swap-template/tree/branch/deeplink?tab=readme-ov-file) repo and switching to the `branch/deeplink` branch:

```bash
git clone https://github.com/monad-developers/expo-swap-template.git
```

```bash
git checkout branch/deeplink
```

### Defining the scheme

The first step is to define a scheme; you can do so by editing the `app.json` file in the Expo project.

app.json

```json
{
  "expo": {
    "scheme": "myapp" // or your preferred scheme
  }
}
```

warning
Custom schemes like `myapp://` are not unique across Android or iOS. If two apps register the same scheme, the system won't know which one to launch, or it might launch the wrong one. Use something app-specific and hard to accidentally duplicate.

### Listening for deep link events

In your app entrypoint (e.g., `_layout.tsx` or a provider), add logic to:

- Handle initial deep link
- Listen for deep link changes
A good practice is to create a `DeepLinkHandler` and wrap the entire app with it.

Example (in an Expo project using File-based routing):

_layout.tsx app

```tsx
...

// Function to parse the deep link and get the hostname and queryParams
function parseSwapDeeplink(url: string): SwapDeeplinkParams | null {
  try {
    const { hostname, queryParams } = Linking.parse(url);
    
    if (hostname !== 'swap' || !queryParams) {
      return null;
    }

    return {
      from: queryParams.from as string | undefined,
      to: queryParams.to as string | undefined,
      amount: queryParams.amount as string | undefined,
    };
  } catch (error) {
    console.error('Error parsing deeplink:', error);
    return null;
  }
}

function DeeplinkHandler({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  
  useEffect(() => {
    
    const handleDeeplink = (url: string) => {
      // Parse the deep link and get the params (host, path, params etc...)
      const params = parseSwapDeeplink(url);
      if (params) {
        // The example here makes the params globally accessible in the app, however you can use React Context or similar to make the params accessible from anywhere in the app.
        (global as any).swapDeeplinkParams = params;
        // Based on the path or host you can redirect the user to the respective screen in the app 
        router.replace('/');
      }
    };

    // Handle initial URL
    Linking.getInitialURL().then(url => url && handleDeeplink(url));

    // Create an event listener and handle URL changes while app is open
    const subscription = Linking.addEventListener('url', event => handleDeeplink(event.url));

    // Removes the event listener when the component is destroyed (avoids memory leaks)
    return () => subscription.remove();
  }, [router]);

  return <>{children}</>;
}

export default function Layout() {
    ...

    return (
        <DeeplinkHandler>
            <App />
        </DeeplinkHandler>
    );
 }
```

That's it, your app is ready to handle deep links based on the `hostname` and `queryParams` you can redirect the user to the respective screens.

Additionally if you make the `queryParams` accessible globally (via context or some other way) you can prefill input values too!

**Example: Prefilling token swap amounts!**

## Testing the deep link

Here's a demo of how deep links work in a mobile app:

### Testing on iOS simulator

```bash
xcrun simctl openurl booted [deeplink]
```

Example:

```bash
xcrun simctl openurl booted "rnwalletapp://swap?from=MON&to=USDC&amount=100"
```

### Testing on Android emulator

```bash
adb shell am start -W -a android.intent.action.VIEW -d [deeplink]
```

Example:

```bash
# Important: Use single quotes to wrap the entire command to prevent shell from parsing & symbols
adb shell 'am start -W -a android.intent.action.VIEW -d "rnwalletapp://swap?from=MON&to=USDC&amount=100"'
```

warning
If you don't use single quotes, the shell will interpret `&` as a command separator, and only the first parameter will be passed to the app.

### Testing on a physical device

You can create a simple HTML page with links.

Example:

```html
<a href="rnwalletapp://swap?from=MON&to=USDC&amount=100">Swap MON to USDC</a>
```

## Try out the demo

If you'd like to try a deep link demo you can do by setting up [this](https://github.com/monad-developers/expo-swap-template/tree/branch/deeplink?tab=readme-ov-file) repo and switch to the `branch/deeplink` branch.

```bash
git clone https://github.com/monad-developers/expo-swap-template.git
```

```bash
git checkout branch/deeplink
```

Here are some deep links you can try:

1. Swap MON to USDC

```text
rnwalletapp://swap?from=MON&to=USDC
```

1. Swap 100 MON to USDC

```text
rnwalletapp://swap?from=MON&to=USDC&amount=100
```

1. Swap USDC to WMON

```text
rnwalletapp://swap?from=USDC&to=WMON&amount=1000
```