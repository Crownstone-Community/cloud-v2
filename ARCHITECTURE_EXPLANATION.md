# Architecture explanation

The cloud V2 is made in typescript and used the Loopback 4 framework. Most of the design is based on loopback 4's preferences.

Look at the Loopback 4 documentation to learn about controllers, models, repositories and the application. This document is meant as a who-is-who for experienced developers who already read the loopback documentation.

## What is the state of the Cloud V2?

It was originally planned to be a full replacement for the Crownstone cloud, but the migration strategy is that new functionality is created here and
the cloudV1 will handle the rest. It is a lot of work to fully replace the cloud service. The current version supplements the cloudV1 and provides the newer functionality like:
- Messages V2 (app 6.0)
- Syncing V2  (app 5.6+)
- Fingerprints V2 (app 6.0)
- Energy collection (app 6.0 for viewing, anything can push)
- Aggregation and sanitation
- Data import/export

# What is different from loopback 4?

## server.ts
The main server is an Express server, and loopback 4 only handles requests after /api. The reason for this is the flexibility it provides for adding
custom endpoints without having to go through the loopback controllers.

## Modules

Most of the Crownstone specific modules like the syncer, sse handling, notifications, energy processing, data processing and the Repo container live in the modules folder.

Let's go over these one by one

### RepoContainer

Path: `/src/modules/containers/RepoContainer`
Instead of injecting the repositories needed for each controller, I prefer to have a global object which we can import from anywhere which contains all repositories. This is the RepoContainer, called `Dbs`.

### DataManagement

Path: `/src/modules/dataManagement`
Number of database util modules. Called via controllers or custom endpoints.

- **DataDownloader**
  - collecting all the data belonging to a user in order to download it. Called by the user data endpoint.
  - contains a throttling mechansim that is no longer used. Was created to avoid overloading the server since the download consists of many requests. It is not used due to the conclusion of Crownstone and the import/export functionality would be awkward if a user is severely throttled.
- **DataGarbageCollection**
  - Delete 5 minute energy data older than 24 hours
  - Delete 1h energy data older than 14 days
  - Delete SwitchStateHistory older than 1 day excluding the currently used ids
  - Called by crownstone cron job via the /garbage-collect-data endpoint
- **DataImporter**
  - Can import a zip file exported by the dataDownloader and fill a database. The endpoint for this is disabled if one of the database urls (hashed) are similar to the production ones and by the ALLOW_IMPORT env var.
- **PerformanceHandler**
  - Provides an API for monitoring performance throughout the cloudV2. Can be inserted manually during development. Not used in production.
- **Sanitizer**
  - Cleans up orphaned data if a user or sphere or something is deleted.
  - Called by crownstone cron via the /sanitize-database endpoint (called about twice a day)

### Energy processing

Path: `/src/modules/energy`

These files contain methods to aggregate and interpolate incoming energy data. Called on dataupload and on aggregation via crownstone cron.

### Push Notifications

Path: `/src/modules/notifications`

API to send push notifications to users. Used for messages.

### Server Sent Events (SSE)
Path: `/src/modules/sse`

Module which allows the SSE server to connect to the cloudV2 and will send change events to the SSE server on datamutations due to the syncing process. Also contains util to generate events according to the event protocol.
This is a typescripted copy from the cloud v1

### Sync

Path: `/src/modules/sync`

This contains all the logic and util methods for syncing data. Read more about the syncing mechanism here: [/doc/SYNCING.md](/doc/SYNCING.md)


# Security

We provide two security annotators

```
@authenticate(SecurityTypes.accessToken)
@authorize(Authorization.sphereMember())
```

Authenticate is using the accessToken implementation of cloudV1. Written usen passport.js

Authorization is done via the sphereAccess model, which gives a user a role between: admin member guest hub.

No OAUTH authorization is available at the moment, which means that you cannot access the cloudV2 via OAUTH.

# Data relations

You can find a (somewhat dated) overview between the relations of the data models here [/doc/html/DataRelations.html](/doc/html/DataRelations.html)
