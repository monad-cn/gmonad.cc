# 如何在基于 Expo 的移动应用中构建自定义深链接

URL: https://docs.monad.xyz/guides/deeplinks-using-expo

深链接是将用户直接带到移动应用或网站内特定内容的 URL，而不仅仅是启动应用的主屏幕。它们像快捷方式一样工作，能够实现更流畅的导航并改善用户体验。

在本指南中，你将学习将深链接添加到基于 [Expo](https://docs.expo.dev/) 的移动应用的基础知识。

## 什么是深链接？

深链接由三部分构成：

- **方案（Scheme）**：标识应该打开 URL 的应用的 URL 方案（示例：myapp://）。对于非标准深链接，它也可以是 https 或 http。
- **主机（Host）**：应该打开 URL 的应用的域名（示例：web-app.com）。
- **路径（Path）**：应该打开的屏幕路径（示例：/product）。如果未指定路径，用户将被带到应用的主屏幕。
深链接也可以像网页链接一样拥有参数！

示例：

```text
rnwalletapp://swap?from={token}&to={token}&amount={amount}
```

## 构建深链接

注意提示  
如果你想尝试深链接演示，可以通过克隆[此](https://github.com/monad-developers/expo-swap-template/tree/branch/deeplink?tab=readme-ov-file)仓库并切换到 `branch/deeplink` 分支来完成：

```bash
git clone https://github.com/monad-developers/expo-swap-template.git
```

```bash
git checkout branch/deeplink
```

### 定义方案

第一步是定义一个方案；你可以通过编辑 Expo 项目中的 `app.json` 文件来完成。

app.json

```json
{
  "expo": {
    "scheme": "myapp" // 或你偏好的方案
  }
}
```

警告提示  
像 `myapp://` 这样的自定义方案在 Android 或 iOS 中并不唯一。如果两个应用注册相同的方案，系统将不知道启动哪一个，或者可能启动错误的应用。使用应用特定且难以意外重复的内容。

### 监听深链接事件

在你的应用入口点（例如，`_layout.tsx` 或提供者）中，添加逻辑以：

- 处理初始深链接
- 监听深链接变化
一个好的实践是创建一个 `DeepLinkHandler` 并用它包装整个应用。

示例（在使用基于文件路由的 Expo 项目中）：

_layout.tsx app

```tsx
...

// 解析深链接并获取主机名和查询参数的函数
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
      // 解析深链接并获取参数（主机、路径、参数等...）
      const params = parseSwapDeeplink(url);
      if (params) {
        // 此处的示例使参数在应用中全局可访问，但是你可以使用 React Context 或类似的方式使参数从应用中的任何地方都可访问。
        (global as any).swapDeeplinkParams = params;
        // 基于路径或主机，你可以将用户重定向到应用中的相应屏幕
        router.replace('/');
      }
    };

    // 处理初始 URL
    Linking.getInitialURL().then(url => url && handleDeeplink(url));

    // 创建事件监听器并处理应用打开时的 URL 变化
    const subscription = Linking.addEventListener('url', event => handleDeeplink(event.url));

    // 当组件销毁时删除事件监听器（避免内存泄漏）
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

就是这样，你的应用已准备好处理基于 `hostname` 和 `queryParams` 的深链接，你可以将用户重定向到相应的屏幕。

此外，如果你使 `queryParams` 全局可访问（通过上下文或其他方式），你也可以预填充输入值！

**示例：预填充代币交换金额！**

## 测试深链接

以下是深链接在移动应用中如何工作的演示：

### 在 iOS 模拟器上测试

```bash
xcrun simctl openurl booted [deeplink]
```

示例：

```bash
xcrun simctl openurl booted "rnwalletapp://swap?from=MON&to=USDC&amount=100"
```

### 在 Android 模拟器上测试

```bash
adb shell am start -W -a android.intent.action.VIEW -d [deeplink]
```

示例：

```bash
# 重要：使用单引号包装整个命令以防止 shell 解析 & 符号
adb shell 'am start -W -a android.intent.action.VIEW -d "rnwalletapp://swap?from=MON&to=USDC&amount=100"'
```

警告提示  
如果你不使用单引号，shell 将把 `&` 解释为命令分隔符，只有第一个参数会传递给应用。

### 在物理设备上测试

你可以创建一个带有链接的简单 HTML 页面。

示例：

```html
<a href="rnwalletapp://swap?from=MON&to=USDC&amount=100">Swap MON to USDC</a>
```

## 尝试演示

如果你想尝试深链接演示，可以通过设置[此](https://github.com/monad-developers/expo-swap-template/tree/branch/deeplink?tab=readme-ov-file)仓库并切换到 `branch/deeplink` 分支来完成。

```bash
git clone https://github.com/monad-developers/expo-swap-template.git
```

```bash
git checkout branch/deeplink
```

以下是一些你可以尝试的深链接：

1. 将 MON 交换为 USDC

```text
rnwalletapp://swap?from=MON&to=USDC
```

1. 将 100 MON 交换为 USDC

```text
rnwalletapp://swap?from=MON&to=USDC&amount=100
```

1. 将 USDC 交换为 WMON

```text
rnwalletapp://swap?from=USDC&to=WMON&amount=1000
```