---
date: "2025-10-08T19:44:48+08:00"
slug: "lets-talk-sample-apps"
hascodepen: true
tags:
  - javascript
  - devlife
  - react
title: "Let's talk sample apps"
---

I'm back in the Developer Relations profession. But after going through the [migration](/blog/migrating-from-hugo-to-astro) last weekend, it occurred to me that some part of my current job was something that I had already been doing over the years I've had this blog. And that is, explaining to others how something is done and how things work.

My only 2 developer relations jobs were at companies that provided SDKs as products to developers (among other things they do to make revenue). And so it was important to show developers how our SDKs were used and what you could do with them. This meant that I needed to know these SDKs really well, especially all the bits that don't work very well.

But today, I wanna talk about sample applications. The keyword here is "sample".

> a small amount of something that shows you what the rest is or should be like  
> – [Cambridge Dictionary](https://dictionary.cambridge.org/dictionary/english/sample)

What is the point of a sample application? Well, for my context, I would broadly categorise them into 2 groups:

1. **Learning sample applications**  
   Such applications are meant to guide a developer on how to implement something and hopefully they can apply what they learned into their own applications
2. **Showcase sample applications**  
   Such applications are meant to show what a particular technology makes possible

Based on these categorisations, I would say that learning sample apps would end up being flatter in project structure, since the main purpose is to let developers understand how a particular feature is implemented. You wouldn't spend time optimising and modularising everything to be "production-ready", whatever that means.

Personally I think showcase apps can just go wild. I mean, I used to work in [advertising](/resume/#nurun) where sometimes, even things meant for "production" felt like they were just showcase apps held together by duct tape and the hopes and prayers of the account manager. If you know what I mean.

The rest of this post is focused on learning sample apps. Showcase apps can do whatever they want.

## Decisions, decisions…

When I was young and stupid, I was rather opinionated about the "best" way to do things. Now that I'm old and stupid, I'm much less opinionated, and hopefully less stupid as well. The best way to do things is extremely contextual, so the only guiding principle I go by is to assess the situation you're in.

Anywayz, I had been thinking about the best way to structure sample web applications for the purpose of learning. And wanted to keep a record of my thought process.

First and foremost, what is the specific thing you're trying to explain, and what is its **native environment**? For example, if I'm trying to teach someone how Flexbox works, then I would consider the native environment CSS. If I'm trying to teach someone how to use a particular Node.js SDK, then I would consider the native environment JavaScript or Typescript, you get the picture.

Next thing I took into consideration was the **habits and preferences** of the audience I was trying to reach. If you're building in the AI space, odds are the preferred language is going to be Python. A lot of developers building applications on the blockchain seem to default to React and (sadly) Tailwind. I'm still not a big fan of Tailwind but I can see its use-cases.

Also, would there be more sample apps **related to the same topic**. Or are they **individual snowflakes**? If the sample apps are part of a larger theme, do you want to have unified visuals for UI components? For example, if you're building developer documentation for a suite of product SDKs, maybe your sample apps all follow a similar structure and use the same libraries.

Again, there are no hard and fast rules, but a series of trade-offs between how much effort you can afford versus the range of audiences you are trying to reach, I suppose. In a world where unicorns poop rainbows, you could show your developer audience every flavour of how something is done, but sadly, we live here.

## Highlight the critical code

As a bilingual speaker, I honestly wanted by heading for this section to be "讲重点" but I didn't have the language skills to translate that concisely while keeping the gist right.

### CSS

I've built quite a few demos on CodePen as well as standalone sites over the years. A lot of them are about CSS (86 posts on this blog so far). Most of the demos need some form of "unrelated" code just to make the demo look decent so people don't get so distracted by the lack of styling they miss the point altogether.

For those, I've mostly grouped those styles at the bottom (generally safe cascading since they're not touching the actual elements for the demo), and use a comment to indicate they are layout styles. This seems to be a relatively common approach based on what I've seen.

<p class="codepen" data-height="500" data-default-tab="css,result" data-slug-hash="RwvzoRp" data-pen-title="View Transitions API" data-user="huijing" style="height: 500px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;">
  <span>See the Pen <a href="https://codepen.io/huijing/pen/RwvzoRp">
  View Transitions API</a> by Chen Hui Jing (<a href="https://codepen.io/huijing">@huijing</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>

Another approach that came to mind was to have the unrelated styles as inline styles on the HTML elements themselves, and leave ONLY the relevant CSS in the stylesheet. That way there is no ambiguity and everything in the CSS file is relevant. I feel this approach could make it easier to immediately parse the CSS that is doing the actual work.

I'm still in two minds on whether to extend this to the actual element being styled itself. Say if I'm explaining Flexbox, and I put the border style for the element inline instead, you know? [Share your thoughts](https://bsky.app/profile/huijing.bsky.social) on this with me, if you have any.

### JavaScript

For JavaScript it might be trickier. But I have done 2 (or more) separate JavaScript files, where one only contains the relevant logic and the other ones handle everything else to make the website work. With the [module syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) now pretty much the norm, there are so many levels of abstraction possible, and this is one area I feel warrants a bit more deliberate thought.

When writing tutorials around such sample apps, I always ponder how copy-pastable my code is. Ideally, you're really not supposed to wholesale copy and paste a sample app code into your own application but you know and I know and your cat knows that people tend to do that. I lean more heavily towards leaving the responsibility of modularisation up to the developer themselves.

Or even for frameworks, like React. If you look at the average React project, it's components all the way down, which is sort of the right way to do things. But I've personally spent a lot of time digging through components like a forensics team trying to find a dead body just to locate where the logic lies.

For a learning sample app, I would propose keeping all UI components as dumb as possible, then dump all the relevant logic into a big-ass custom hook. Is this best practice? Probably not, but it sure makes it easier to find feature implementation code. Generally, I'm thinking along the lines of getting the framework code out of the way as much as possible.

## Wrapping up

If you made it this far, thank you reading the words that I wrote. I'm under the impression that most people don't actually read these days. But hey, what do I know? I'm still amazed that this blog has existed for more than 11 years. A couple of years ago, I too had fallen into the category of people who Googled how to do something and landed on their own blog post.

Ah well. Life.
