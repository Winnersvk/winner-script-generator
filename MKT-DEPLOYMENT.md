# MKT Online — original app extension

Production remains the existing Vercel project and `https://mkt.winnersign.com`.
Existing authentication, administrators, script history, and script generation are retained.
Backup: `../winner-before-mkt-publisher-20260916.zip` (no secrets).

## Database
Run `supabase/publisher.sql` once in the original Supabase project. It adds private
brand/post tables and a private `mkt-content` image bucket. It never truncates or
rewrites the existing user/history tables. Apply before deploying these routes.
Policies intentionally allow members to read/write their own brands, read their
own posts, and upload into their own image directory. Existing application admins
may read and approve posts. Post updates go through a guarded database function.

## Available workflow
Home → scripts (existing), publisher, queue, calendar, brands and settings.
Drafts and scheduled plans persist in the database. All schedule input uses Bangkok
time regardless of the device timezone. Members submit for approval before scheduling;
admins may schedule their own saved drafts. Editing approved content requires approval again.
Media is uploaded directly to private storage using short-lived signed upload tokens.
OpenAI caption generation uses the existing server key and canonical saved brand data.

## Facebook integration — NOT activated
There is deliberately no public publish endpoint or cron job in this release.
Scheduled is a saved plan; it does not mean Facebook delivery is active. UI states this.
`lib/meta-publisher.mjs` provides the server integration boundary and has simulated
success/error/uncertain-response tests. It has not been tested with a real Meta app.

To activate:
1. Configure a Meta app for business/Page publishing and required app review.
2. Implement OAuth state validation and the approved permissions (`pages_show_list`,
   `pages_read_engagement`, `pages_manage_posts`, subject to current Meta requirements).
3. Store Page tokens encrypted in server-side secret storage; link verified Page IDs
   to owner/brand records. Never accept a client-supplied page ID as authorization.
4. Pin the supported Graph API version after verifying current official documentation.
5. Add an authenticated durable worker with atomic claims, leases, status audit logs,
   guarded completion and token refresh handling. Do not replay ambiguous final publish
   requests: reconcile with Facebook first to avoid duplicate posts.
6. Enable scheduled delivery only after an authorized real-Page end-to-end test.

Reference: https://developers.facebook.com/docs/pages-api/posts/
Official documentation returned HTTP 429 during this implementation; verify provider
requirements before activation. No real Facebook content has been published by this change.

## Checks
`npm test` includes SQL/RLS integration tests using PGlite, Bangkok dates, profiles,
history retries and simulated Meta responses. `npm run build` checks production compilation.
Live acceptance still requires a signed-in account and configured production AI key.
