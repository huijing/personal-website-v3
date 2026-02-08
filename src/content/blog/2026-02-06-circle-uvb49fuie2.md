---
date: "2026-02-06T09:22:50+08:00"
external_site: circle
external_url: https://www.circle.com/blog/choosing-between-circle-gateway-and-cctp-with-forwarding-service-for-crosschain-usdc
noindex: true
tags:
  - circle
  - javascript
title: "Choosing Between Circle Gateway and CCTP with Forwarding Service for Crosschain USDC"
---

In today’s multichain ecosystem, [USDC](https://www.circle.com/usdc) liquidity is siloed across networks with competing strengths. Ethereum remains the bedrock for deep institutional settlement; Solana leads in low-cost, high-velocity trading; and Layer-2s like Arbitrum, Base, and Polygon host the bulk of high-throughput DeFi. For builders, the challenge is no longer just choosing a chain, it is reconciling this fragmented liquidity with the demands of their applications.

Emerging [high-performance environments like Arc](https://www.arc.network/), which is designed around sub-second finality and autonomous execution, highlights the gap between where capital sits and where logic runs. Whether settling global trades or powering autonomous AI agents, capital must move as efficiently as the onchain logic that governs it within the digital economy.

To bridge this gap, Circle provides two liquidity primitives: [**Circle Gateway**](https://developers.circle.com/gateway) for instant, aggregated liquidity and **[CCTP](https://developers.circle.com/cctp) with [Circle Forwarding Service](https://developers.circle.com/cctp/concepts/forwarding-service)** for automated, low-friction crosschain settlement. Understanding the technical trade-offs between these two is key to architecting workflows that strategically balance latency, settlement guarantees, and capital efficiency.

## Technical Comparison: Gateway vs. CCTP with Forwarding Service

Choosing between these primitives depends on how you want your users to experience a crosschain transfer. The Forwarding Service focuses on simplifying crosschain transfers for users with existing USDC balances. Gateway focuses on minimizing the friction of crosschain movement by treating USDC as a unified, global asset.

To determine which option to implement in your project, consider these four key factors:

1. **Transaction Latency (Speed of Transfer)**
   - Gateway: **Sub-second access**. Because liquidity is pre-finalized, transfers behave like local transactions, aligning with the sub-second finality of execution environments like Arc. This makes Gateway suitable for workflows where latency is a first-order constraint.
   - CCTP with Forwarding Service: **Seconds** (bounded by source-chain finality). The Forwarding Service optimizes for automated completion rather than speed: transfers wait for finality on the source chain, then complete without requiring additional user or developer action. This makes it well-suited for non-urgent flows such as payouts, settlements, or bulk rebalancing.
2. **Capital Efficiency (Liquidity Flow)**
   - Gateway: **Aggregated**. Gateway consolidates USDC held across multiple chains into a unified balance that can be accessed through a single minting operation. This aggregation model removes the need to manage per-chain balances or coordinate individual crosschain transfers, making it well-suited for large-scale capital management and frequent reuse.
   - CCTP with Forwarding Service: **Linear**. The Forwarding Service moves USDC along a one-to-one path from a source chain to a destination chain. Each transfer is independent and amount-specific, making this model appropriate for discrete payments, deposits, or settlement flows where capital does not need to remain globally accessible.
3. **User Onboarding (Initial Setup)**
   - Gateway: **Multi-step**. To access instant crosschain transfers, users must first deposit USDC into a Gateway Wallet and wait for finality. This model is well-suited to applications where users transact repeatedly and can amortize the initial setup cost over time.
   - CCTP with Forwarding Service: **Single-step**. Transfers can be initiated directly from any standard wallet holding USDC on a supported source chain. Because no prior deposit or destination-chain setup is required, this model works well as an entry point for users interacting with an ecosystem for the first time.

4. **Implementation Model (Developer Effort)**
   - Gateway: **Pull-based**. Developers submit intent-based requests via an offchain API to access USDC from a unified Gateway balance. This backend-centric model allows applications to programmatically control when and where liquidity is materialized across chains.
   - CCTP with Forwarding Service: **Push-based**. Developers extend a standard onchain transfer with a forwarding hook. This contract-centric model initiates cross-chain settlement directly from the source chain and integrates cleanly into existing frontend transaction flows.

## Implementation Deep Dive: Gateway Intents vs. Forwarding Hook

**Gateway** utilizes burn intents, which are offchain, EIP-712 signed messages. This allows an application to "pull" USDC from a user's unified global balance and materialize it on Arc nearly instantly.

- Scenario: An AI agent on Arc finds a yield opportunity and pulls $100k from a corporate treasury spread across multiple chains.
- Technical solution: The developer signs Burn Intents and submits them via the Gateway API to generate a single aggregated mint attestation.

```ts
// Gateway: Aggregate multiple source chains → single destination
// (Requires prior deposits with finality on each source chain)

const burnIntents = [
  { sourceDomain: 0, sourceToken: ETH_USDC }, // Ethereum
  { sourceDomain: 6, sourceToken: BASE_USDC }, // Base
  { sourceDomain: 1, sourceToken: AVAX_USDC }, // Avalanche
].map(createBurnIntent);
// createBurnIntent fills: value, destination, recipient, fees, salt, contracts

// Sign all intents (off-chain EIP-712)
const requests = await Promise.all(
  burnIntents.map(async (intent) => ({
    burnIntent: burnIntentTypedData(intent).message,
    signature: await account.signTypedData(burnIntentTypedData(intent)),
  })),
);

// Submit to Gateway API → receive aggregated attestation
const { attestation, signature } = await fetch(
  "https://gateway-api-testnet.circle.com/v1/transfer",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requests),
  },
).then((response) => response.json());

// Mint aggregated USDC on Arc in single transaction
await gatewayMinter.write.gatewayMint([attestation, signature]);
// AI agent receives $100k USDC on Arc
```

You can refer to the [Gateway quickstarts](https://developers.circle.com/gateway/quickstarts/unified-balance-evm) for full implementation details.

The **Forwarding Service** makes use of hook data, which is a small payload appended to a `depositForBurnWithHook` call used to automate cross-chain delivery. This flow is initiated with a single onchain transaction on any CCTP-supported source chain. Circle handles the destination mint.

- Scenario: A vendor operating on Avalanche is paid using USDC held on Arc.
- Technical solution: The developer appends the Forwarding Service hook bytes (cctp-forward), allowing Circle to automatically submit the destination-mint after the burn is finalized.

```ts
// Forwarding Service: Arc → Avalanche (single transaction, auto-mint)

// Fetch forwarding fees from Circle API
const fees = await fetch(
  `https://iris-api-sandbox.circle.com/v2/burn/USDC/fees/26/1?forward=true`,
).then((response) => response.json());
const maxFee = BigInt(fees[0].forwardFee.med);

// Approve TokenMessenger to spend USDC (recipient amount + fee)
const recipientAmount = 2_500_000_000n; // 2500 USDC
await approve(ARC_USDC, ARC_TOKEN_MESSENGER, recipientAmount + maxFee);

// Burn with forwarding hook - Circle auto-mints on destination
await tokenMessenger.depositForBurnWithHook(
  recipientAmount + maxFee, // Total to burn (recipient gets recipientAmount)
  1, // Avalanche domain
  pad(vendorAddress, { size: 32 }), // Recipient
  ARC_USDC, // Burn token
  pad("0x", { size: 32 }), // Any caller can mint
  maxFee, // Max forwarding fee
  1000, // Fast finality
  FORWARDING_HOOK_DATA, // "cctp-forward" magic bytes
);
// Circle forwards and submits the mint on Avalanche automatically.
```

You can refer to the [Forwarding Service how-to guide](https://developers.circle.com/cctp/howtos/transfer-usdc-with-forwarding-service) for full implementation details.

## Considerations for Real-World Applications

### Programmable FX & Cross-Border Settlement

For a fintech company offering real-time USD-to-EUR settlement using a [StableFX engine](https://www.circle.com/stablefx) and requiring sub-second latency, the recommendation here would be **Gateway**.

FX rates fluctuate by the millisecond. If the USD liquidity is on Ethereum but the FX logic runs on a high-performance environment, like Arc, the fintech cannot wait for standard bridge finality. Once deposited into Gateway, the firm can tap into its Ethereum-based USDC instantly to lock in a rate, matching the speed of the trade.

### Supply Chain Finance & Automated Payments

When it comes to ERP systems that are integrating smart contract-driven supply chains, **CCTP with Forwarding Service** would be a good fit to help automate crosschain settlement.

For automated vendor payments, reliable end-to-end completion matters more than sub-second speed. The platform can program a burn-with-hook transaction from any source chain where they hold funds. The USDC arrives at the destination and enables the smart contract payment to the supplier without requiring a human to sign a manual mint transaction. Such flows could even be extended to AI agent-driven platforms, where autonomous agents can use the same forwarding logic to execute intent-based payments.

### Corporate Treasury Rebalancing

If we consider a multinational firm consolidating $100M from five different chains into a single "Master Account" for year-end reporting or a large acquisition, this would require high capital efficiency and operational simplicity. Such a scenario would call for **Gateway**.

Managing gas tokens across 5+ chains is an operational nightmare for treasury teams. The Unified Balance feature is the core advantage here. The firm deposits into their Gateway balance once, then moves the entire $100M to their destination in a single mint transaction.

## Wrapping up

Crosschain liquidity fragmentation has been a point of friction for the institutional adoption of onchain finance. With primitives like [Gateway](https://www.circle.com/gateway) and [CCTP](https://www.circle.com/cross-chain-transfer-protocol) with Forwarding Service, we are moving towards a more integrated and robust onchain ecosystem, where capital is fluid, unified and instantly accessible.
