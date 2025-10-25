---
date: "2025-10-25T19:44:48+08:00"
slug: "database-troubleshooting-for-umami"
tags:
  - analytics
title: "Database troubleshooting for Umami"
---

I suck at SQL. There. I said it. I just never really had to interact with a SQL database directly over the years. So yeah, I can query a database, but managing one? Nah. My SQL knowledge is pretty much limited to `SELECT * FROM something WHERE otherthing = ?`.

My website uses [Umami](https://umami.is/) for site analytics, which was [set up around October 2020](/blog/setting-up-umami-on-heroku/). Between that blog post and now, I had migrated my database from Heroku to AWS RDS, which I did not do on my own. Someone else had set things up on AWS and sent me the database URL to connect to.

I had also migrated to Umami v2 at some point, dutifully following the [migration instructions](https://github.com/umami-software/migrate-v1-v2), which thankfully just worked. But then, when version [v2.18.0](https://github.com/umami-software/umami/releases/tag/v2.18.0) was released, I ran into this little error:

```shell
Error: P3018

A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve

Migration name: 09_update_hostname_region

Database error code: 40P01

Database error:
ERROR: deadlock detected
DETAIL: Process 27550 waits for AccessExclusiveLock on relation 16967 of database 16401; blocked by process 26654.
Process 26654 waits for AccessShareLock on relation 16982 of database 16401; blocked by process 27550.
HINT: See server log for query details.

DbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E40P01), message: "deadlock detected", detail: Some("Process 27550 waits for AccessExclusiveLock on relation 16967 of database 16401; blocked by process 26654.\nProcess 26654 waits for AccessShareLock on relation 16982 of database 16401; blocked by process 27550."), hint: Some("See server log for query details."), position: None, where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("deadlock.c"), line: Some(1135), routine: Some("DeadLockReport") }


✗ Command failed: prisma migrate deploy
Error: P3018

A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve

Migration name: 09_update_hostname_region

Database error code: 40P01

Database error:
ERROR: deadlock detected
DETAIL: Process 27550 waits for AccessExclusiveLock on relation 16967 of database 16401; blocked by process 26654.
Process 26654 waits for AccessShareLock on relation 16982 of database 16401; blocked by process 27550.
HINT: See server log for query details.

DbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E40P01), message: "deadlock detected", detail: Some("Process 27550 waits for AccessExclusiveLock on relation 16967 of database 16401; blocked by process 26654.\nProcess 26654 waits for AccessShareLock on relation 16982 of database 16401; blocked by process 27550."), hint: Some("See server log for query details."), position: None, where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("deadlock.c"), line: Some(1135), routine: Some("DeadLockReport") }

 ELIFECYCLE  Command failed with exit code 1.
ERROR: "check-db" exited with 1.
 ELIFECYCLE  Command failed with exit code 1.
```

I am not equipped to solve such errors. But I wasn't alone. Scouring GitHub revealed:

<ul>
  <li class="no-margin"><a href="https://github.com/umami-software/umami/issues/3399">09_update_hostname_region migration failing after updating to 2.18.0</a></li>
  <li class="no-margin"><a href="https://github.com/umami-software/umami/issues/3428">Vercel build: 09_update_hostname_region migration failing</a></li>
  <li class="no-margin"><a href="https://github.com/umami-software/umami/issues/3417">Upgrade to 2.18.1 Caused Connection Pool Exhaustion and Rapid DB Size Increase</a></li>
  <li><a href="https://github.com/umami-software/umami/issues/3536">DB prisma migration failed while restoring data for latest deployment 2.19.0 from 2.15.0</a></li>
</ul>

I also submitted an [issue of my own](https://github.com/umami-software/umami/issues/3462), but was told to resolve my database deadlock first. Nobody really had the exact same error as I did but based on everyone else's issues, I guessed that my database was probably too large for the tiny RDS instance to cope with the migration.

Given that [v3 was coming out soon](https://umami.is/blog/what-is-coming-in-umami-v3), I figured now would be an excellent time to actually sit my ass down and resolve this database issue once and for all.

## The most basic of basics

You need tools for troubleshooting, and the first thing is to figure out how to actually access your database. I had to finally log into the database for the first time ever (the migration was previously run via script, I didn't actually have to do anything). AWS provides [this guidance](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_ConnectToPostgreSQLInstance.html) on how to connect to your PostgreSQL DB instance. You need [`psql`](https://www.postgresql.org/docs/current/app-psql.html).

If you're on Mac OS, like me, install [`libpq`](https://www.postgresql.org/docs/current/libpq.html) via brew.

```bash
brew install libpq
```

Then add it to your `PATH`. I'm using fish shell so I used `fish_add_path`.

```bash
fish_add_path /opt/homebrew/opt/libpq/bin
```

Connect to your remote database. This really depends on where your database lives. For me, I used this URL pattern.

```bash
psql "postgres://dbuser:password@aws_rds_endpoint:port/db_name?sslrootcert=path_to_pem_file"
```

## Start operation recovery

The migration borked at `09_update_hostname_region`, and the [migration.sql](https://github.com/umami-software/umami/blob/master/db/postgresql/migrations/09_update_hostname_region/migration.sql) file looks like this:

```sql
-- AlterTable
ALTER TABLE "website_event" ADD COLUMN     "hostname" VARCHAR(100);

-- DataMigration
UPDATE "website_event" w
SET hostname = s.hostname
FROM "session" s
WHERE s.website_id = w.website_id
    and s.session_id = w.session_id;

-- DropIndex
DROP INDEX IF EXISTS "session_website_id_created_at_hostname_idx";
DROP INDEX IF EXISTS "session_website_id_created_at_subdivision1_idx";

-- AlterTable
ALTER TABLE "session" RENAME COLUMN "subdivision1" TO "region";
ALTER TABLE "session" DROP COLUMN "subdivision2";
ALTER TABLE "session" DROP COLUMN "hostname";

-- CreateIndex
CREATE INDEX "website_event_website_id_created_at_hostname_idx" ON "website_event"("website_id", "created_at", "hostname");
CREATE INDEX "session_website_id_created_at_region_idx" ON "session"("website_id", "created_at", "region");
```

The migration never finished, so I first had to mark the failed migration as rolled back so we can do it all over again.

```bash
prisma migrate resolve --rolled-back 09_update_hostname_region
```

A check on the state of my database revealed that I had 1,003,518 rows to deal with and my database was on a t3.micro instance. Probably not the best combination but it is what it is.

It seemed like a better idea to run the migration in batches and commit after every batch so I could recover without having to go through the entire database all over again if something went wrong. These are the steps I went through.

Start off with some defensive session settings for my puny t3.micro instance:

```sql
SET lock_timeout = '2min';
SET statement_timeout = '60min';
SET idle_in_transaction_session_timeout = '10min';
SET maintenance_work_mem = '256MB';
```

Also add helper indexes in addition to the required column:

```sql
ALTER TABLE public.website_event ADD COLUMN IF NOT EXISTS hostname VARCHAR(100);

CREATE INDEX CONCURRENTLY IF NOT EXISTS session_website_id_session_id_idx
  ON public."session"(website_id, session_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS website_event_wid_sid_null_idx
  ON public.website_event(website_id, session_id)
  WHERE hostname IS NULL;
```

Create a helper function to fill in the rows for the newly added column:

```sql
CREATE OR REPLACE FUNCTION fill_hostname_batch(batch_size int)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE r_count integer;
BEGIN
  WITH chunk AS (
    SELECT w.ctid AS w_ctid, s.hostname
    FROM public.website_event w
    JOIN public."session" s
      ON s.website_id = w.website_id
     AND s.session_id = w.session_id
    WHERE w.hostname IS NULL
    LIMIT batch_size
  )
  UPDATE public.website_event w
  SET hostname = c.hostname
  FROM chunk c
  WHERE w.ctid = c.w_ctid;

  GET DIAGNOSTICS r_count = ROW_COUNT;
  RETURN r_count;
END$$;
```

Set the function to run in batches. I manually stopped this when it returned 0. But this took more than 24 hours. I actually had to go on a business trip before it completed so I stopped it and resumed it when I came back home.

```sql
\set batch 2000
SELECT fill_hostname_batch(:batch);
\watch 1
```

Create the new `website_event` index:

```sql
CREATE INDEX CONCURRENTLY IF NOT EXISTS website_event_website_id_created_at_hostname_idx
  ON public.website_event(website_id, created_at, hostname);
```

Drop the legacy `session` indexes:

```sql
DROP INDEX CONCURRENTLY IF EXISTS public.session_website_id_created_at_hostname_idx;
DROP INDEX CONCURRENTLY IF EXISTS public.session_website_id_created_at_subdivision1_idx;
```

Apply the required `session` column changes:

```sql
BEGIN;
SET LOCAL lock_timeout = '5s';

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='session' AND column_name='subdivision1'
  ) THEN
    EXECUTE 'ALTER TABLE public."session" RENAME COLUMN subdivision1 TO region';
  END IF;
END$$;

ALTER TABLE public."session" DROP COLUMN IF EXISTS subdivision2;
ALTER TABLE public."session" DROP COLUMN IF EXISTS hostname;

COMMIT;
```

Almost there now. Create the new session index:

```sql
CREATE INDEX CONCURRENTLY IF NOT EXISTS session_website_id_created_at_region_idx
  ON public."session"(website_id, created_at, region);
```

Finalise the migration record:

```sql
UPDATE public._prisma_migrations
SET finished_at = NOW(),
    rolled_back_at = NULL,
    logs = 'Manually completed after deadlock recovery and verified schema.'
WHERE migration_name = '09_update_hostname_region'
  AND finished_at IS NULL;
```

Thankfully at this point, there weren't any new errors, and it seemed like the migration went through.

## Wrapping up

I ran `npx prisma migrate status` which told me that I had 13 pending migrations, and I went ahead and applied them with `npx prisma migrate deploy`. Again, no new errors, and when I finally ran the build command, it actually worked and the app compiled successfully. <span class="emoji" role="img" tabindex="0" aria-label="partying face">&#x1F973;</span>

Hopefully v3 doesn't involve such a mega database update. <span class="emoji" role="img" tabindex="0" aria-label="crossed fingers">&#x1F91E;</span>
