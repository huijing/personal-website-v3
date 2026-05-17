---
date: "2026-05-17T09:44:48+08:00"
slug: "building-a-connect-wallet-button"
og_image: /images/posts/wallet-connect.jpg
tags:
  - javascript
  - html
  - css
  - blockchain
title: "Building a connect wallet button"
---

Back in October last year, I briefly wrote about my [thoughts about standards](/blog/how-standards-enhance-developer-experience). Given the almost entirety of my career was around the web, and I cared a lot about specifications and standards, I gravitated toward learning about [Ethereum Improvement Proposals](https://ethereum.org/eips/) (EIPs), which are the mechanism for how new standards are introduced in the [Ethereum](https://ethereum.org/what-is-ethereum/) eco-system.

## The UX of blockchain technology

Honestly, it's not the best. Without getting into my actual thoughts about finance as a concept, I'll just say that the experience is akin to when the first personal computers came out in the 1970s, and the people who got into them needed keen interest and technical skill to get them to work.

Things also move really fast in this space, and there already seems to be a consensus that blockchain technology was not meant for humans, but for AI agents to transact with each other at sub-second speed. But that's another topic altogether. This will never become a crypto/blockchain blog, I just happen to work with blockchain technology for now and it turns out, there are [JavaScript APIs in Ethereum](https://eips.ethereum.org/EIPS/eip-1193).

Yes, I'm sure some of you are making a face, and thinking, is there no escape from JavaScript, well, you could try [Solana](https://solana.com/), which is written in Rust? Today, I'm going to talk about building a Connect Wallet button, based on the [EIP-6963: Multi Injected Provider Discovery](https://eips.ethereum.org/EIPS/eip-6963), and of course it will include the most important (IMHO) styling with CSS.

## What wallet, why connect?

Given that browser-based wallets are among the most common types of crypto wallet, having a “Connect Wallet” button on your application is becoming an expectation among users.

With so many different wallets available, and users often having multiple wallets installed at the same time, developers were facing a major issue where multiple wallet browser extensions were all injecting their Ethereum providers into the same `window.ethereum` window object.

[EIP-6963: Multi Injected Provider Discovery](https://eips.ethereum.org/EIPS/eip-6963) was developed to resolve this problem and it was accepted as a standard in Oct 2023. The proposed solution introduces a set of window events which provide two-way communication between the wallet and the application.

So we're going to be doing the barebones of implementing EIP-6963 on a web page, and providing a Connect Wallet button that triggers a modal with a list of all the detected wallets in the user’s browser.

The user will be able to select their wallet of choice and connect to it, upon which the wallet address will be displayed so the user is aware which wallet is connected. And toss in some way to display error messages on the interface when something goes wrong.

GitHub repository is at: [https://github.com/huijing/connect-wallet-btn](https://github.com/huijing/connect-wallet-btn), if you are even remotely interested in running it yourself.

## Interfaces for EIP-6963 providers

And yes, we are doing this in TypeScript.

```ts
type EIP1193ProviderEvent = "accountsChanged" | "disconnect";

interface EIP1193Provider {
  request(args: { method: string; params?: unknown[] | object }): Promise<unknown>;
  on?(event: EIP1193ProviderEvent, listener: (...args: unknown[]) => void): void;
  removeListener?(event: EIP1193ProviderEvent, listener: (...args: unknown[]) => void): void;
  disconnect?(): Promise<unknown>;
}

interface EIP6963ProviderInfo {
  uuid: string;
  name: string;
  icon: string;
  rdns: string;
}

interface EIP6963ProviderDetail {
  info: EIP6963ProviderInfo;
  provider: EIP1193Provider;
}

interface EIP6963AnnounceProviderEvent extends Event {
  detail: EIP6963ProviderDetail;
}
```

## Wallet discovery

Wallets are discovered by listening for the "`eip6963:announceProvider`" event. Discovered wallets are stored in `state.discoveredProviders`, which is an array used to keep track of the detected wallet providers. The `renderWallets()` renders the wallet selection dialog.

```ts
const state = {
  ...,
  discoveredProviders: [] as EIP6963ProviderDetail[],
};

window.addEventListener("eip6963:announceProvider", (event) => {
  const { detail } = event;

  if (state.discoveredProviders.some((wallet) => wallet.provider === detail.provider)) {
    return;
  }

  state.discoveredProviders.push(detail);
  renderWallets();
});

window.dispatchEvent(new Event("eip6963:requestProvider"));
```

Each time the "`eip6963:announceProvider`" event is fired, the listener reads the wallet information from the `detail` property of the event payload.

We check if the provider is already in the array, and if not, we push the detail object into the array. Our application asks all available wallets to announce themselves by dispatching a "`eip6963:requestProvider`" event that compatible wallets will respond to.

## Wallet selection

The discovered wallets array can be used to build a UI component for wallet selection, like a modal. With the [`dialog` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog) now having [Baseline](https://web-platform-dx.github.io/web-features/) support, there is a native HTML method for creating modals, and methods to style the modal via CSS.

```html
<dialog open closedby="any">
  <form method="dialog">
    <p>Connect a wallet</p>
    <button type="button" class="btn-wallet">
      <img class="wallet-icon" alt="Phantom" src="ICON_FROM_PROVIDER" />
      <span>Phantom</span>
    </button>
    <button type="button" class="btn-wallet">
      <img class="wallet-icon" alt="Trust Wallet" src="ICON_FROM_PROVIDER" />
      <span>Trust Wallet</span>
    </button>
    <button type="button" class="btn-wallet">
      <img class="wallet-icon" alt="MetaMask" src="ICON_FROM_PROVIDER" />
      <span>MetaMask</span>
    </button>
    <button type="button" class="btn-cancel">Cancel</button>
  </form>
</dialog>
```

```css
/* Wallet modal */
dialog {
  margin: auto;
  min-width: 20rem;
}

dialog form {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

:modal {
  background-image: linear-gradient(to bottom left, rgb(252, 250, 255), rgb(248, 252, 255));
  border: 2px solid rgb(26, 163, 255);
  border-radius: 0.5rem;
  box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.1);
}

dialog[open] {
  animation: slideDown 0.5s ease normal;
}
@keyframes slideDown {
  from {
    transform: translateY(-50%);
  }
  to {
    transform: translateY(0%);
  }
}

dialog form p {
  font-weight: 700;
}

.wallet-icon {
  width: 1.5em;
  height: 1.5em;
}

.btn-wallet {
  border: 2px solid rgb(26, 163, 255);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: white;
  font-size: larger;
}
```

The advantage of using a `dialog` element is that you get keyboard controls, like hitting escape or clicking outside the modal to close the dialog, out-of-the-box. We can query the `form` element in the `dialog` element to insert wallet buttons based on the providers discovered through EIP-6963.

```ts
const dialog = document.querySelector<HTMLDialogElement>("dialog")!;
const walletForm = dialog.querySelector<HTMLFormElement>("form")!;
const cancelButton = walletForm.querySelector<HTMLButtonElement>(".btn-cancel")!;

dialog.setAttribute("closedby", "any");
dialog.addEventListener("close", () => {
  if (dialog.returnValue !== "selected") {
    showError({ message: "User rejected the request." });
  }
});

function renderWallets() {
  walletForm.querySelectorAll("[data-wallet-entry]").forEach((node) => {
    node.remove();
  });

  if (state.discoveredProviders.length === 0) {
    const empty = document.createElement("div");
    empty.dataset.walletEntry = "empty";
    empty.textContent = "No supported wallets detected.";
    walletForm.insertBefore(empty, cancelButton);
    return;
  }

  for (const { info, provider } of state.discoveredProviders) {
    const button = document.createElement("button");
    button.dataset.walletEntry = "option";
    button.type = "button";
    button.className = "btn-wallet";
    button.addEventListener("click", () => {
      void connectWith(provider);
    });

    if (info.icon) {
      const icon = document.createElement("img");
      icon.className = "wallet-icon";
      icon.src = info.icon;
      icon.alt = info.name;
      button.append(icon);
    }

    const label = document.createElement("span");
    label.textContent = info.name || info.rdns || info.uuid;
    button.append(label);

    walletForm.insertBefore(button, cancelButton);
  }
}
```

Each wallet button needs a click handler to initiate the connection flow. The selected provider is passed into `connectWith(provider)`, which requests accounts from the wallet. If the request succeeds, the app stores the connected provider and wallet address in state.

```ts
const state = {
  ...,
  address: null as string | null,
};

async function connectWith(provider: EIP1193Provider) {
  try {
    const accounts = await provider.request({ method: "eth_requestAccounts" });

    if (Array.isArray(accounts) && typeof accounts[0] === "string") {
      bindProvider(provider);
      state.address = accounts[0];
      renderConnectArea();
    }
  } catch (error) {
    showError(toWalletError(error));
  } finally {
    dialog.close("selected");
  }
}
```

As an enhancement, we can consider displaying the wallet address of the connected wallet. The wallet address can be obtained directly from the wallet provider using [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193) methods. We can also add event listeners to react to wallet behaviours like account changing or disconnection.

```ts
function bindProvider(provider: EIP1193Provider | null) {
  if (state.currentProvider?.removeListener) {
    state.currentProvider.removeListener("accountsChanged", handleAccountsChanged);
    state.currentProvider.removeListener("disconnect", resetConnectionState);
  }

  state.currentProvider = provider;

  if (provider?.on) {
    provider.on("accountsChanged", handleAccountsChanged);
    provider.on("disconnect", resetConnectionState);
  }
}

function handleAccountsChanged(accounts: unknown) {
  if (!Array.isArray(accounts) || typeof accounts[0] !== "string") {
    resetConnectionState();
    return;
  }

  state.address = accounts[0];
  renderConnectArea();
}
```

## Disconnecting a wallet

Disconnecting a wallet is more tricky than it seems. This is because EIP-1193 does not define a standard wallet disconnect flow. Connecting an application generally means giving a site permission to read accounts, but removing that permission depends on the wallet implementation. The most reliable method is still having the user revoke the permission from the wallet UI directly.

Wallets handle disconnection differently. Some expose a `disconnect()` method, some support revoking permissions, and some require the user to disconnect from the wallet UI directly. For this vanilla implementation, we can make a best effort to handle these patterns and fall back to asking the user to disconnect in the browser wallet extension when needed:

```ts
async function disconnect() {
  const provider = state.currentProvider;

  if (!provider) {
    showError({ message: "No provider set" });
    return;
  }

  try {
    if (typeof provider.disconnect === "function") {
      await withTimeout(provider.disconnect());
    } else {
      await withTimeout(
        provider.request({
          method: "wallet_revokePermissions",
          params: [{ eth_accounts: {} }],
        }),
      );
    }

    const accounts = await withTimeout(provider.request({ method: "eth_accounts" }), 1000).catch(
      () => null,
    );

    if (Array.isArray(accounts) && accounts.length > 0) {
      resetConnectionState();
      showError(
        { message: "Disconnect from your browser wallet extension to fully sign out." },
        "warn",
      );
      return;
    }

    resetConnectionState();
  } catch (error) {
    const walletError = toWalletError(error);

    if (walletError.code === -32601) {
      resetConnectionState();
      showError(
        { message: "Disconnect from your browser wallet extension to fully sign out." },
        "warn",
      );
      return;
    }

    resetConnectionState();
    showError(walletError);
  }
}
```

## Optional: Error notifications

Another UX consideration is having any error messages be displayed to the user. There are a number of ways to do this, but the decision would largely depend on the overall design of the layout of the application. A common pattern is via a [Toast](https://open-ui.org/components/toast.research/) component, where the message is displayed briefly then disappears after a short while.

```ts
type ToastLevel = "error" | "warn";

function showError(error: WalletError, level: ToastLevel = "error") {
  const message = error.message.replace(/\nVersion:[\s\S]*$/, "");
  const prefix = level === "warn" ? "Wallet warning:" : "Wallet error:";
  const details = error.code === undefined ? [prefix, message] : [prefix, error.code, message];

  if (level === "warn") {
    console.warn(...details);
  } else {
    console.error(...details);
  }

  const existing = document.querySelector(".toast-message");
  existing?.remove();

  if (state.toastTimer) {
    window.clearTimeout(state.toastTimer);
  }

  const toast = document.createElement("div");
  toast.className = "toast-message";
  toast.textContent = message;
  document.body.append(toast);

  state.toastTimer = window.setTimeout(() => {
    toast.remove();
    state.toastTimer = undefined;
  }, 3000);
}
```

## Wrapping up

Well, I'm back in DevRel, although I have repeatedly admitted to my colleagues, I still feel I'm more Dev than Rel. We'll see how this goes.

I'm happy to sneak in vanilla web development wherever I can. And try to keep my job in the process. I do like paying my bills on time.

Let's all stay safe together, my friends.
