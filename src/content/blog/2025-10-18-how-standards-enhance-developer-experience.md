---
date: "2025-10-18T09:14:50+08:00"
slug: "how-standards-enhance-developer-experience"
og_image: /images/posts/standards.jpg
tags:
  - devlife
  - specifications
  - blockchain
title: "How standards enhance the developer experience"
---

My timeline of how the web has evolved is based on CSS layout eras. If you ever came across an [earlier post](/blog/the-case-for-old-school-css) I wrote back in March, you'll know that I started out at the tail-end of the HTML tables era and the start of the floats era.

<figure>
    <figcaption>There's even more cool stuff after Grid but I can't find my source file for this graphic</figcaption>
    <img srcset="/images/posts/old-school-css/eras-480.jpg 480w, /images/posts/old-school-css/eras-640.jpg 640w, /images/posts/old-school-css/eras-960.jpg 960w, /images/posts/old-school-css/eras-1280.jpg 1280w" sizes="(max-width: 400px) 100vw, (max-width: 960px) 75vw, 640px" src="/images/posts/old-school-css/eras-640.jpg" alt="The CSS Eras">
</figure>

I had joined the industry as a paid developer the same year the [Web Standards Project](https://www.webstandards.org/) had wound down because standards were a real thing and the browser wars were over. This means I had not truly lived the wild west times of either writing a whole lot of extra code to make sure things worked in different browsers or just picked one browser and hoped for the best.

Well, now that I'm doing work in the blockchain space, I feel like I have a better understanding of how things would have been like for developers back then. When it comes to decentralised applications (dApps), [Ethereum](https://ethereum.org/what-is-ethereum/) is probably considered the foundational ecosystem, given they were the first blockchain to introduce [smart contracts](https://ethereum.org/smart-contracts/), enabling programmable financial transactions and other interesting applications.

## Little bit of background info

Ethereum has [standards](https://ethereum.org/developers/docs/standards), which are introduced as [Ethereum Improvement Proposals](https://ethereum.org/eips/) (EIPs). Conceptually they are grandchildren of the [Python Enhancement Proposals](https://peps.python.org/) (PEPs) process. Given that Ethereum has been around for a decade, it's a fairly [long list of EIPs](https://eips.ethereum.org/all) so far, and a good number are considered final.

There is a JavaScript API for Ethereum, defined by [EIP-1193: Ethereum Provider JavaScript API](https://eips.ethereum.org/EIPS/eip-1193). It describes how key management software (AKA wallets) need to expose their API via a JavaScript object, known as a "Provider". This Provider allows the application to make [Ethereum RPC](https://ethereum.org/developers/docs/apis/json-rpc/) requests and respond to state changes in the Provider’s Ethereum chain, Client, and Wallet.

At first this was fine, because the software wallet space wasn't that crowded, most people were just using [Metamask](https://metamask.io/). It's considered the first wallet that catered to a "beginner" audience, and was installed as a browser extension. But as the ecosystem expanded, the number of different wallet products also grew. It isn't uncommon to have users with multiple wallet browser extensions installed.

So if you are the developer of a dApp that makes use of the user's connected wallet, you now have a problem. Browser extension wallets would inject their Ethereum providers into the same `window.ethereum` object. And the user cannot control which Provider gets to interact with. The last wallet to load usually wins <span class="emoji" role="img" tabindex="0" aria-label="face with raised eyebrow">&#x1F928;</span>.

This problem is outlined in [EIP-6963: Multi Injected Provider Discovery](https://eips.ethereum.org/EIPS/eip-6963), which came into existence as a resolution. So between the two standards, we have a pretty good idea of how browser wallets are expected to behave. The keyword here is "expected". Look, I've been swimming around in the lake of CSS specifications for a number of years now. I learned early on that having defined in a standard is only the beginning of the journey.

## Rules seem like suggestions

I'm Malaysian, and the joke I love to make to the Singaporeans around me is, where I come from, traffic laws are less like rules and more like suggestions. Like, MAYBE you don't wanna park next to a no parking sign. Or MAYBE you should slow down when the light turns yellow. But you do you. In this day and age, I realise I must explicitly say this is a JOKE. Please obey traffic laws when you come to Malaysia.

The point is, even though the standard exists, the browser wallet extension makers aren't forced to implement it within a specific deadline after the standard is made final. There generally are no hard deadlines for specification implementation. For example, Firefox just started [supporting View Transitions](https://www.firefox.com/en-US/firefox/144.0/releasenotes/) 4 days ago. Chrome released in early March 2023, and Safari released in mid September 2024.

That being said, standards and specifications are great, because it allows for a predictable interface when developers want to build atop such foundational elements. The start of most dApp user journeys involves the user clicking a "Connect Wallet" button to connect their browser wallet to the application and perform blockchain transactions, i.e. record state changes onto the blockchain.

The technical details of building a connect wallet interface I will cover in a separate post, but I just wanted to provide a description of how the experience was like with a picture. It's worth a thousand words.

<img src="/images/posts/standards/console-log.png" srcset="/images/posts/standards/console-log@2x.png 2x" alt="Console errors showing wallets fighting each other">

Granted I did have more than the normal number of browser wallets installed at the same time and most users probably don't do this (maybe). Call it a stress test. Web standards for HTML, CSS and JavaScript are focused on end-user interaction with the browser, and I was very used to thinking along those lines. However, for the Ethereum standards, it is more focused on the wallet interacting with the blockchain. In that sense, the dApp interacting with the wallet is one level away.

An example would be disconnecting your wallet from the dApp. The `disconnect` event outlined in EIP-1193 is meant for the wallet to indicate that it has lost its connection to the blockchain, and not for indicating the user disconnecting their wallet from the application. So the issue I ran into was the scenario where someone wanted to switch to a different wallet to interact with my application, and I kept getting stuck with the old wallet provider.

Libraries like [Wagmi](https://wagmi.sh/) provide a layer of abstraction for [connecting wallets](https://wagmi.sh/react/guides/connect-wallet) which simulates disconnection behaviour with [a shim](https://wagmi.sh/react/api/connectors/injected#shimdisconnect). Metamask has its own API that exposes a [`wallet_revokePermissions`](https://docs.metamask.io/wallet/reference/json-rpc-methods/wallet_revokepermissions) for developers to use, and there are some standard proposals like [ERC-7715: Grant Permissions from Wallets](https://eips.ethereum.org/EIPS/eip-7715) that could alleviate the problem eventually.

## Wrapping up

It seems to me that this space of developing dApps is similar to the earlier days of the web where the entire ecosystem is still trying to nail down things that are worth standardising across the board. Which is giving me a taste of what it must have been like building websites back in the day of the browser wars.

Now I don't think I'm even experiencing half the exasperation, but it is giving me a greater appreciation of the work so many people have done to make web standards a thing. Today, I can happily build sites with the reassurance that it will almost always behave the same across browsers, and that's not something to be taken for granted.

Web pioneers, I salute you. <span class="emoji" role="img" tabindex="0" aria-label="saluting face">&#x1FAE1;</span>  
Thank you for paving the way for the rest of us.
