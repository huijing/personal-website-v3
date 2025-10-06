---
date: "2015-05-18T00:00:00Z"
slug: kohana-101-installation
tags:
  - kohana
title: "Kohana 101: Installation and setup"
---

_Update: The Kohana framework has been deprecated and the last stable version was 3.3.6 released on 25 July 2006._

I'm starting on something completely new to me: the [Kohana](https://kohanaframework.org/) framework, and this is my attempt to document everything I'm learning. When I started this blog, I was already one year into Drupal, and so a lot of the things I struggled with as a noob had more or less evaporated from my mind. For Kohana, I'm a complete noob once again, so hopefully this will be helpful to somebody who's starting from zero as well.

<p class="no-margin">As of time of writing, the latest stable version of Kohana is v3.3.3.1. There are 2 ways to install Kohana on your system, either download the .zip file from the homepage or get the files via git. If you choose the first option, extract the contents of the .zip file into your local web root. If you choose the second option, navigate to your local web root and run the following:</p>

```bash
git clone git://github.com/kohana/kohana.git
cd kohana/
git submodule init
git submodule update
```

Note: If you need to use a version of Kohana other than the latest stable version, you can try downloading it from the [archives](https://web.archive.org/web/20170606095640/http://kohanaframework.org/download), but the last I tried, the archives were offline. Your best bet is to get it from Kohana's [GitHub repository](https://github.com/kohana/kohana).

<p class="no-margin">For installation via git, there is an extra step to switch git branches if you need an earlier version.</p>

```bash
git clone git://github.com/kohana/kohana.git
cd kohana/
```

<p class="no-margin">To see all the branches, run the following:</p>

```bash
git branch -a
```

![Git branch list](/images/posts/kohana-install/installation-3.jpg)

<p class="no-margin">For example, if you need v3.0, run:</p>

```bash
git checkout 3.0/master
```

<p class="no-margin">Once you're on the version branch of your choice, run:</p>

```bash
git submodule init
git submodule update
```

<p class="no-margin">Open the <code>bootstrap.php</code> file in the <code>application</code> folder. There are a couple of things to change in this file.</p>

1. <p class="no-margin">Update your default timezone.</p>

   ```php
   date_default_timezone_set('Asia/Singapore');
   ```

2. <p class="no-margin">Update the base_url to point to your site installation.</p>

   ```php
   Kohana::init(array(
      'base_url'   => '/kohana3/',
   ));
   ```

3. <p class="no-margin">Enable modules.</p>

   ```php
   Kohana::modules(array(
      'auth'       => MODPATH.'auth',       // Basic authentication
      'cache'      => MODPATH.'cache',      // Caching with multiple backends
      'codebench'  => MODPATH.'codebench',  // Benchmarking tool
      'database'   => MODPATH.'database',   // Database access
      'image'      => MODPATH.'image',      // Image manipulation
      'orm'        => MODPATH.'orm',        // Object Relationship Mapping
      'oauth'      => MODPATH.'oauth',      // OAuth authentication
      'pagination' => MODPATH.'pagination', // Paging of results
      'unittest'   => MODPATH.'unittest',   // Unit testing
      'userguide'  => MODPATH.'userguide',  // User guide and API documentation
   ));
   ```

If you navigate to the site root from your browser, you should see this:

![Environment ready](/images/posts/kohana-install/installation.jpg)

<p class="no-margin">You need to adjust the permissions on the <code>cache</code> and <code>logs</code> folders. From your terminal, navigate to the <code>application</code> folder and run the following:</p>

```bash
sudo chmod 777 cache/ logs/
```

Refresh the page and you should now see:

![Initial screen](/images/posts/kohana-install/installation-2.jpg)

<p class="no-margin">Delete the <code>install.php</code> file from the root folder via your favourite method. I just use:</p>

```bash
rm install.php
```

Now, when you refresh the page, you should see a _hello, world!_ message. We now have a fresh Kohana site on our hands to play with.
