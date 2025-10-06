---
drupalfeed: true
date: "2015-08-11T00:00:00Z"
slug: drupal-101-d7-theming
tags:
  - drupal7
  - theming
  - gulp
title: "Drupal 101: Getting started with Drupal 7 theming"
---

_Update: I finally got around to writing that [Drupal 8 theming post](/blog/drupal-101-d8-theming) after two years._

With Drupal 8 just around the corner, it may seem odd that I would write a post about Drupal 7 theming, but I figured it would take some time for Drupal 8 to really become mainstream. Also, when I do write that Drupal 8 theming post (coming soon), we can do some one to one comparisons on the things that have changed. Trust me, there are a lot of differences between the two.

A theme is like the skin for your website. Drupal 7 theming may seem complicated at first. Peeking into a theme folder reveals a bunch of folders littered with PHP files, stylesheets and who knows what else. The easiest way to wrap your head around things is to try and create a theme from scratch. Drupal.org has a pretty good set of documentation for [theming Drupal 7](https://www.drupal.org/node/337173) so that should be your starting point.

## Folder structure

<p class="no-margin">All non-core themes should be placed in the <code>sites/all/themes</code> folder. Start off by creating a new folder here and name it whatever you like. To make things a bit more organised, create three sub-folders, <code>css</code>, <code>js</code> and <code>img</code>, inside your new theme folder. This looks like any other HTML project, doesn’t it?</p>

```
godzilla/
|
|-- css/
|
|-- img/
|
`-- js/
```

## The .info file

The only required file for a Drupal 7 theme is the `.info` file. This file contains all the information, as well as configuration options for your theme. One thing to note is that your theme name **cannot** contain hypens, spaces or punctuation.

This is because Drupal uses this name in PHP functions so the same limitations for name-spacing apply. Numbers and underscores are acceptable though. If you name this file `godzilla.info`, then Drupal will recognise your theme as _godzilla_. Every time you make a change to the `.info` file, you must also clear your cache in order to see the changes.

There are thirteen values that can be used in the `.info` file but not all of them are required. Drupal will just use default values for those not defined. But there are a couple others that we should include as well.

<p class="no-margin"><strong>name</strong> <em>(required)</em><br> 
Defines the human-readable version of your theme name. This is the name that shows up on the <em>Administration > Appearance</em> screen. Because this serves as a label for your theme, you're allowed to use spaces.</p>

```
name = Godzilla is rox
```

<p class="no-margin"><strong>description</strong><br>
Optional but recommended to have. This is a brief description of your theme, which shows up below your theme name on the <em>Administration > Appearance</em> screen.</p>

```
description = A custom responsive Godzilla-based theme
```

<img alt="Theme selection" srcset="/images/posts/d7-theming/info-480.jpg 480w, /images/posts/d7-theming/info-640.jpg 640w, /images/posts/d7-theming/info-960.jpg 960w, /images/posts/d7-theming/info-1280.jpg 1280w" sizes="(max-width: 400px) 100vw, (max-width: 960px) 75vw, 640px" src="/images/posts/d7-theming/info-640.jpg">

<p class="no-margin"><strong>core</strong> <em>(required)</em><br>
Indicates what major version of Drupal the theme is compatible with. If this does not match the version of Drupal installed, the theme will be disabled.</p>

```
core = 7.x
```

<strong>stylesheets</strong> <em>(required)</em><br>
Allows you to define which stylesheets gets loaded when you enable your theme. Although it's not labeled as required in the official documentation, I would consider as such because, unless you declare this, Drupal 7 doesn't load any of your stylesheets by default. It will use the default Drupal <code>style.css</code>.

<p class="no-margin">You can actually specify stylesheets for different media types and media queries, if you need to. Although stylesheets can be placed in sub-directories, it's recommended to keep that to one level only. The file paths are relative to the theme directory. Also, the order which you list the stylesheets here will be the order that they will be loaded in the head of your HTML document.</p>

```
stylesheets[all][] = css/styles.css
stylesheets[print][] = css/print.css
stylesheets[screen and (max-width: 480px)][] = css/mobile.css
```

<p class="no-margin"><strong>scripts</strong><br>
Define any Javascript files used in your theme. Similar to stylesheets, they are relative to the theme folder as well. FYI, Drupal already comes with jQuery, so no need to add it again here.</p>

```
scripts[] = js/scripts.js
```

<p class="no-margin"><strong>regions</strong><br>
Optional and will default to the list below if not specified. Regions are what shows up in the <em>Administration > Structure > Blocks</em> screen. If you want to define your own regions, keep in mind that <code>regions[content] = Content</code> <strong>must</strong> be present. Using standard Drupal names for the sidebar regions lets Drupal add sidebar classes to the <code>&lt;body&gt;</code> tag. You can go nuts with naming any other custom regions you want.</p>

```
regions[header] = Header
regions[highlighted] = Highlighted
regions[help] = Help
regions[content] = Content
regions[sidebar_first] = Left sidebar
regions[sidebar_second] = Right sidebar
regions[footer] = Footer
```

The full list of all options available for the `.info` file can be found [here](https://www.drupal.org/node/171205). A sample `.info` file would look something like this:

```
name = Godzilla is rox description = A custom responsive Godzilla-based theme core = 7.x
stylesheets[all][] = css/styles.css scripts[] = js/scripts.js regions[header] = Header
regions[content] = Content regions[sidebar_first] = Left sidebar regions[sidebar_second] = Right
sidebar regions[footer] = Footer
```

## Template files

<p class="no-margin">The markup of your site is controlled by template files, which use the <code>.tpl.php</code> extension. The way Drupal works is, unless you need something custom, Drupal will load its default templates to generate the HTML mark-up for your site. Most modules comes with their own <code>tpl.php</code> file, which can be overridden by making a copy of it and placing it in a <code>templates</code> folder in your <code>theme</code> folder. Remember folks, <strong>never hack core</strong>. At this point, your theme folder would probably look something like this:</p>

```
godzilla/
|
|-- css/
|
|-- godzilla.info
|
|-- img/
|
|-- js/
|
`-- templates/
```

The default theme engine for Drupal 7 is [PHPTemplate](https://web.archive.org/web/20150906003104/https://www.drupal.org/phptemplate), written by [Adrian Rossouw](http://daemon.co.za/). Although the template files are recognised as PHP, they are actually a HTML scaffold that utilise PHP statements and variables to pull dynamic data from the database. So if you're familiar with HTML, you'll be just fine, don't be intimidated by all the `<?php ?>` stuff in there.

I personally chose to override two template files for my theme, the `html.tpl.php` and the `page.tpl.php`. Quick aside, in order to learn all this, I built my own starter theme called [Clarus](https://www.drupal.org/sandbox/hj_chen/2345293) and now use it to start all my custom Drupal 7 themes.

But anyway, as their names suggest, the `html.tpl.php` file serves as the scaffold for the whole HTML document, everything between the `<html>` and `</html>` tags. The `page.tpl.php` controls the markup for the content in the `<body>` of your page.

Again, you don't have to rewrite any of these template files if you don't want to, you can just theme using CSS, but then you'll have to follow the default Drupal mark-up structure.

<p class="no-margin">My <code>html.tpl.php</code> file is relatively small. I rewrote this file because I wanted my theme to use HTML5. Drupal provides a lot of variables that you can just call on with a simple <code>&lt;?php print $VARIABLE_NAME ?&gt;</code>. No need to write those by hand. Click <a href="https://www.drupal.org/node/1728208">here</a> for the list of all the variables available for use.</p>

```php
<?php
/**
 * @file
 * Return the basic html structure of a single Drupal page.
 *
 * Complete documentation for this file is available online.
 * @see https://drupal.org/node/1728208
 */
?>
<!DOCTYPE html>
<!--[if lt IE 9]>
<script src="<?= base_path().path_to_theme(); ?>/js/html5shiv.js"></script>
<![endif]-->
<html lang="<?php print $language->language; ?>" dir="<?php print $language->dir; ?>" <?php print $rdf_namespaces; ?>
  <head>
    <?php print $head; ?>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php print $head_title; ?></title>
    <?php print $styles; ?>
    <?php print $scripts; ?>
  </head>

  <body class="<?php print $classes; ?>" <?php print $attributes;?>
    <div id="skip-link">
      <a href="#main-content" class="element-invisible element-focusable"><?php print t('Skip to main content'); ?></a>
    </div>
    <?php print $page_top; ?>
    <?php print $page; ?>
    <?php print $page_bottom; ?>
  </body>
</html>
```

If you look at line 26 of my <code>html.tpl.php</code> file, that line <code>&lt;?php print $page; ?&gt;</code>, calls the contents of the <code>page.tpl.php</code> file. Like the <code>html.tpl.php</code>, there are many variables available for use in this file as well.

Elements like the site name, logo, main menu, breadcrumbs and so on can be accessed and rendered via these variables. You can check out the full list <a href="https://www.drupal.org/node/1728148">here</a>. For something simple, you can start off with just the page structure.

```php
<header class="site-header">
</header>

<div class="wrapper">
  <main class="main" role="main">
  </main>

  <aside class="sidebar">
  </aside>
</div>

<footer class="site-footer">
</footer>
```

To add content to your page via the Blocks interface, we need to declare regions in the `page.tpl.php` file. Each region is identified by its machine name, which is defined in the `.info` file. Drupal utilises something called [Render Arrays](https://www.drupal.org/node/930760) to output content on your page. That's what all those <code>&lt;?php print render($page['REGION_NAME']); ?&gt;</code> lines do.

```php
<header class="site-header">
  <?php print render($page['header']); ?>
</header>

<div class="wrapper">

  <main class="main" role="main">
    <a id="main-content"></a>
    <?php print render($page['content']); ?>
  </main>

  <?php if ($page['sidebar_first']): ?>
  <aside class="sidebar">
    <?php print render($page['sidebar_first']); ?>
  </aside>
  <?php endif; ?>

</div>

<?php if ($page['footer']): ?>
<footer class="site-footer">
  <?php print render($page['footer']); ?>
</aside>
<?php endif; ?>
```

Wrapping the mark-up for rendering a region with an if statement like <code >&lt;?php if ($page['highlighted']): ?&gt; /_ Your code here _/ &lt;?php endif; ?&gt;</code> allows us to check if the regions have any content in them or not before rendering that region.

For example, if you're using the default Drupal `html.tpl.php`, and you don't put any content in the _Highlighted_ region, then Drupal will not even render that region on your page.

The advantage of using regions is that users can manipulate content directly from the admin interface. For elements that you're fairly certain will remain the same for a long time, you can choose to hard-code them in the `page.tpl.php`. Usually a site logo doesn't change very often, and that can be printed in the `page.tpl.php` directly.

```php
<header class="site-header">
  <?php if ($logo): ?>
  <a href="<?php print $front_page; ?>" title="<?php print t('Home'); ?>" rel="home" id="logo">
    <img src="<?php print $logo; ?>" alt="<?php print t('Home'); ?>" />
  </a>
  <?php endif; ?>
  <?php print render($page['header']); ?>
</header>

<?php if ($breadcrumb): ?>
<div class="breadcrumb"><?php print $breadcrumb; ?></div>
<?php endif; ?>

<?php print $messages; ?>

<div class="wrapper">

  <main class="main" role="main">
    <a id="main-content"></a>
    <?php print render($page['content']); ?>
  </main>

  <?php if ($page['sidebar_first']): ?>
  <aside class="sidebar">
    <?php print render($page['sidebar_first']); ?>
  </aside>
  <?php endif; ?>

</div>

<?php if ($page['footer']): ?>
  <footer class="site-footer">
    <?php print render($page['footer']); ?>
  </aside>
<?php endif; ?>
```

I added a site logo which has a link to the front page, as well as breadcrumbs and messages. Notice that some variables need to use `render()` while some are just printed directly. If the variable is an array, you need to use `render()`, if not, <code>&lt;?php print $VARIABLE_NAME ?&gt;</code> works just fine.

When in doubt, you can always refer to the default `page.tpl.php` in the `modules/system/` folder to see how the default implementation looks like.

## Now you can start CSS-ing

With all that settled, you can proceed to write up your styles. Depending on how you configured your `.info` file, as long as you've indicated which stylesheets and scripts your theme will load, writing your theme is just like styling any other HTML site.

I'm going to cover my theming workflow using Sass and Gulp in another post, because people who want to write plain vanilla CSS are totally free to do so at this point. Using Sass, Gulp and other tools are optional, really. When you're happy with your theme, take a screenshot of it, name it `screenshot.png` and place that in the root of your theme folder.

I'm also preparing to write a post on theming with Drupal 8. My gut tells me Drupal 8 is really right around the corner, and I'm pretty stoked about all the changes and improvements. CMI, Twig templating, Symfony and lots of other cool stuff are coming our way. This also means learning about a lot of new stuff, but that's the fun part, right? Gotta keep on Drupal-ing.
