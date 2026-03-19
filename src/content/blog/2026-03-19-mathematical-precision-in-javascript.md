---
date: "2026-03-19T19:44:48+08:00"
slug: "mathematical-precision-in-javascript"
og_image: /images/posts/math-precision.jpg
tags:
  - javascript
  - blockchain
title: "Mathematical precision in Javascript"
---

In a world where most people don't read anymore, and content is written by or at least run through AI for edits, I still find writing out my own thoughts fairly self-entertaining. I guess it's largely because a majority of the blog posts on here were written for future me. If it happens to be of use to someone else, that's just a bonus.

Anyway, math. But first, long backstory about payments.

## Really tiny payments

The term “micropayments” was coined by [Theodor (Ted) Holm Nelson](https://www.xanadu.com.au/ted/) back in the 1960s. He had been working on [Project Xanadu](https://xanadu.com/HISTORY/). It is very interesting to look back on this project 57 years later given the state of the internet today.

> COPYRIGHT is to be handled simply within the system. Royalty will be paid automatically by the reader, or anyone making a printout, on a byte-by-byte basis; each bytesworth of royalty (or nib) is paid to the owner of its native document.  
> – [The Xanadu\* Paradigm](https://archive.org/details/xanaduparadigm00tedn) by Ted Nelson

Ted Nelson's idea was born in a time when the technology needed to implement it simply did not exist, way before the World Wide Web, and HTTP status codes. Innovation and creativity were abundant during a time when computing was no where near mainstream, and people thought about things without the shackles of profit maximization. Just my spicy take on the state of the world.

For the longest time, because of transaction fees, tiny payments just didn't make sense. Traditional payment infrastructure was built to handle large amounts, processing a 39 cent transaction probably costs more than the transaction itself, so why would anyone bother?

However, as of time of writing (we shall see how well this blog post ages), it feels like we are on the cusp of having new financial infrastructure that better suits the nature of the internet.

## Blockchains as financial rails

Blockchain technology is one of many innovations meant to modernize financial rails and payments infrastructure to better suit how the internet works. It's not the only solution, but it seems poised to become one of the most viable enhancements to existing systems.

I don't say "replacement" because my unprofessional and unqualified brain just thinks people don't like change, so the old rails will still hang around for a while. But without going into the history of blockchain technology, it is probably safe enough to say that blockchain technology brought the concept of programmable money into reality.

Although there are a handful of currencies in the Middle East that use 3 decimals (see [ISO 4217](https://en.wikipedia.org/wiki/ISO_4217)), in general, people are used to 2 decimal places in their day-to-day calculations since most currencies' have cents as their smallest unit. But when you work with blockchains, you have to wrap your mind around a lot more token decimals.

For [Ethereum Virtual Machine (EVM)](https://ethereum.org/developers/docs/evm/) chains, the standard is 18 decimals. On [Ethereum](https://ethereum.org/developers/docs/intro-to-ethereum/), the native currency is [ether](https://ethereum.org/developers/docs/intro-to-ether/) (ETH), which is used as a form of payment for transaction fees. [Wei](https://ethereum.org/developers/docs/intro-to-ether/#denominations) is the smallest unit of ether, where 1 wei = 10<sup>-18</sup> ETH.

[Solana](https://solana.com/) uses 9 decimals for its native currency, SOL. [Lamports](https://solana.com/docs/references/terminology#lamport) are the smallest denomination used to represent SOL balances and 1 lamport = 10<sup>-9</sup> SOL. And given the number of blockchains that exist, I'm sure there are a plethora of different choices for token decimals among them.

## Stablecoins poised for mainstream adoption

When I talk to my friends who are unfamiliar with cryptocurrencies, I try to explain that it is a range. On one end you have worthless (and often scammy) [memecoins](https://www.investopedia.com/meme-coin-6750312). And on the other end, you have [stablecoins](https://www.usdc.com/learn/what-is-a-stablecoin), with the most broadly used being backed by the US dollar and are essentially digital representations of the fiat currency.

<img srcset="/images/posts/math-precision/stablecoins-480.png 480w, /images/posts/math-precision/stablecoins-640.png 640w, /images/posts/math-precision/stablecoins-960.png 960w, /images/posts/math-precision/stablecoins-1280.png 1280w" sizes="(max-width: 400px) 100vw, (max-width: 960px) 75vw, 640px" src="/images/posts/math-precision/stablecoins-640.png" alt="Stablecoin supply chart from Defilama as of 15 March 2026">

In March 2026, Ethereum is widely regarded as the largest stablecoin ecosystem by onchain supply and overall infrastructure. It uses [ERC-20](https://ethereum.org/developers/docs/standards/tokens/erc-20/) as the standard for Fungible Tokens. This simply means that they have a property that makes each Token be exactly the same (in type and value) as another Token.

Many stablecoins on Ethereum use 6 decimals. Honestly, I don't know why there is such a large variety of token decimal options. Perhaps the easiest answer is, because it's possible. Who knows? But because of all these decimals flying around, I found myself using [BigInt](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt) more than I ever have before.

As part of my job, I'm building a lot of scripts and applications that use USDC and Circle's APIs. Depending on the API called, the response could contain values measured in basis points or percent values, human-readable decimal USDC or strings, native token smallest units or integer enum-like numerals. Just loads of different types of values.

<p class="no-margin">The most common conversion I end up doing is human-readable decimal USDC to subunits and back. And so I landed on these 2 helper functions:</p>

<ul>
  <li class="no-margin"><code>toUsdcSubunits()</code> to convert a USDC string into the integer amount that APIs or smart contracts expect</li>
  <li><code>formatUsdcSubunits()</code> to</li>
</ul>

### `toUsdcSubunits()`

This function is most often used when parsing user input so it's safer to take in a string, to preserve whatever the input was.

```ts
// Convert USDC to subunits (6 decimals)
function toUsdcSubunits(value: string): bigint {
  if (!/^\d+(\.\d{1,6})?$/.test(value)) {
    throw new Error(
      `Invalid USDC amount "${value}". Expected a non-negative decimal with up to 6 fractional digits.`,
    );
  }

  const [whole, decimal = ""] = value.split(".");
  return BigInt(whole) * 1_000_000n + BigInt(decimal.padEnd(6, "0"));
}
```

The regex validates the input and allows only digits before the decimal, an optional decimal point and 1–6 digits after the decimal. It doesn't allow for negatives, commas, currency symbols or extra formatting. The next line splits the whole and decimal parts at the decimal point.

Then the whole gets converted to USDC subunits in BigInt because they are exact whole number token amounts, so we avoid Javascript's infamous floating-point number handling. And the decimal part gets padded with zeroes until it is 6 characters long, because USDC is always 6 decimal places.

So 1.5 USDC gets converted to `1_500_000n`. The `n` makes it BigInt and the underscores are just to help readability.

### `formatUsdcSubunits()`

This function is most often used when I need to display a USDC value on the frontend, because nobody, or at least, not that many people find it intuitive to read `1455233n` subunits worth of USDC. The number of decimals to display is a parameter from 0–6.

```ts
function formatUsdcSubunits(value: bigint, outputDecimals = 6): string {
  if (!Number.isInteger(outputDecimals) || outputDecimals < 0 || outputDecimals > 6) {
    throw new Error(`Invalid outputDecimals "${outputDecimals}". Expected an integer from 0 to 6.`);
  }

  const negative = value < 0n;
  let absValue = negative ? -value : value;

  if (outputDecimals < 6) {
    const divisor = 10n ** BigInt(6 - outputDecimals);
    absValue = (absValue + divisor / 2n) / divisor;
  }

  const scale = 10n ** BigInt(outputDecimals);
  const whole = absValue / scale;
  const fraction = absValue % scale;

  if (outputDecimals === 0) {
    return `${negative ? "-" : ""}${whole}`;
  }

  return `${negative ? "-" : ""}${whole}.${fraction.toString().padStart(outputDecimals, "0")}`;
}
```

The first bit just checks that the provided `outputDecimals` argument is valid.

Then, check if the value is negative (`const negative = value < 0n`), because if it is, the function needs to tack on a `-` at the end. Meanwhile, work with the absolute value (`let absValue = negative ? -value : value`) to make the math easier.

If the number of decimals to be displayed is less than 6, then round the number to the intended display precision. `divisor` is the number used to reduce the precision. So if the display is meant to be 2 decimals, the `divisor` is 10<sup>4</sup> or `10_000n`, and dividing by `10_000n` shifts the number 4 places to the right in decimal terms.

`scale` is used to rebuild the final decimal string because after rounding the function needs to split the number into the whole number (`const whole= absValue / scale`) and the decimal part (`const decimal = absValue % scale`). `scale` indicates where the split should happen, and is the power of 10 that matches the number of decimal places to be shown.

If no decimals are required, just return the whole number, otherwise build out the final string by adding back the minus sign if needed, put the whole and decimal parts together and pad the decimal part with leading zeroes if required.

## I find basis points annoying. Sue me.

Actually, don't sue me. I can't afford a lawyer. But my point is, basis points make my brain hurt when I'm already juggling all these decimal points <span class="emoji" role="img" tabindex="0" aria-label="exhaling face">&#x1F62E;&#x200D;&#x1F4A8;</span>.

Basis points is a common thing in the finance industry because apparently they make small rate changes easier to talk about. Sure. If you say so.

```ts
async function calculateMaxFee(
  sourceDomain: number,
  destDomain: number,
  transferAmountUSDC: string, // USDC amount like "1" or "10.5"
) {
  // Convert USDC to subunits (6 decimals)
  const [whole, decimal = ""] = transferAmountUSDC.split(".");
  const decimal6 = (decimal + "000000").slice(0, 6);
  const transferAmount = BigInt(whole + decimal6);

  // Get current fee
  const response = await fetch(
    `https://iris-api-sandbox.circle.com/v2/burn/USDC/fees/${sourceDomain}/${destDomain}`,
  );
  const fees = await response.json();

  // Extract minimumFee for Fast Transfer (finalityThreshold 1000)
  const minimumFee = fees[0].minimumFee; // Fee in basis points

  // Calculate fee as percentage of transfer amount
  const protocolFee = (transferAmount * BigInt(Math.round(minimumFee * 100))) / 1_000_000n;

  // Add 20% buffer to protocol fee (protocolFee × 1.2) - result in subunits
  const maxFee = (protocolFee * 120n) / 100n;

  return maxFee; // denominated in USDC subunits (6 decimals)
}

// Use in your burn call
const maxFee = await calculateMaxFee(0, 1, "10.5");
```

The API returns anything between 0 and 14 bps depending on the blockchains involved in the transaction. That's why we need the `protocolFee` line which scales the value so it can be converted into an integer, makes sure it is a clean whole number before converting to BigInt, apply the fee rate to the transfer amount, then scales the result back down to the correct USDC subunit amount.

Ergh.

## Wrapping up

Anyway, this is the first non-employer blog post I've published this year. I planned to do this earlier, but I guess I only have a specific quota of word output and most of it is being spent trying to keep my job. Until AI takes over all the things.

At least CSS will still be a hobby.

## References

<ul>
  <li class="no-margin"><a href="https://financefeeds.com/crypto-decimals-meaning-how-token-precision-works/">Crypto Decimals Meaning: How Token Precision Works and Why It Matters</a></li>
  <li><a href="https://www.ecb.europa.eu/pub/pdf/other/ecb.micropaymentsimpactonnpaymentsecosystem202308~bb92cda8ce.en.pdf">A big future for small payments? Micropayments and their impact on the payment ecosystem</a></li>
</ul>
