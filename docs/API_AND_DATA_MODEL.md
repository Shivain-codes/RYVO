# PULSE — PostgreSQL, Prisma, and API Design

**Status:** Implementation-ready contract. No database or API is implemented by this preparation step.
**Database:** PostgreSQL
**ORM:** Prisma 7.10.1 candidate, with matching `@prisma/client`
**Validation:** Zod at every HTTP boundary

## Design principles

PostgreSQL stores user-owned metadata and aggregates. Raw motion, raw GPS coordinates, decoded audio, PCM, and browser object URLs stay on the device by default. The client owns live estimates for responsiveness; the server validates and stores bounded aggregates. Every protected route resolves the authenticated user through Auth.js and scopes every query by that user. No request body may choose `userId`.

## Prisma schema proposal

```prisma
enum SessionStatus { ACTIVE PAUSED COMPLETED INTERRUPTED }
enum AdaptationMode { BEAT_MATCHED_PLAYLIST REAL_TIME_TEMPO OFF }
enum MeasurementSource { DEVICE_MOTION SIMULATION MANUAL }
enum TrackSource { LOCAL DEMO }
enum AnalysisStatus { PENDING COMPLETE LOW_CONFIDENCE FAILED MANUAL }
enum AudioFallback { ORIGINAL_TEMPO DISABLE_AUDIO }
enum PlaybackEventType { START PAUSE RESUME SWITCH RATIO_CHANGE TEMPO_CHANGE AUDIO_LIMITED AUDIO_ERROR SENSOR_LOST SENSOR_RECOVERED END }

model User {
  id              String             @id @default(uuid()) @db.Uuid
  externalSubject String             @unique
  createdAt       DateTime           @default(now())
  updatedAt       DateTime           @updatedAt
  sessions        RunningSession[]
  tracks          Track[]
  playlists       Playlist[]
  playbackEvents  PlaybackEvent[]
  preferences     UserPreferences?
}

model RunningSession {
  id                         String                 @id @default(uuid()) @db.Uuid
  userId                     String                 @db.Uuid
  clientSessionKey           String
  status                     SessionStatus          @default(ACTIVE)
  adaptationMode             AdaptationMode
  measurementSource          MeasurementSource
  isSimulation               Boolean                @default(false)
  startedAt                  DateTime
  endedAt                    DateTime?
  activeDurationMs           BigInt                 @default(0)
  distanceMeters             Int                    @default(0)
  averagePaceSecPerM         Decimal?               @db.Decimal(10, 6)
  bestPaceSecPerM            Decimal?               @db.Decimal(10, 6)
  averageCadenceSpm          Decimal?               @db.Decimal(7, 2)
  averageTargetBpm           Decimal?               @db.Decimal(7, 2)
  eligibleAudioSeconds       Int                    @default(0)
  matchedAudioSeconds        Int                    @default(0)
  syncPercent                Decimal?               @db.Decimal(5, 2)
  syncFormulaVersion         String?                @db.VarChar(32)
  unitSystem                 String                 @default("metric")
  settingsSnapshot           Json
  completionIdempotency      String?                @unique
  interruptionIdempotency    String?                @unique
  createdAt                  DateTime               @default(now())
  updatedAt                  DateTime               @updatedAt
  user                       User                   @relation(fields: [userId], references: [id], onDelete: Cascade)
  samples                    RunningMetricsSample[]
  playbackEvents             PlaybackEvent[]

  @@unique([userId, clientSessionKey])
  @@unique([id, userId])
  @@index([userId, startedAt(sort: Desc)])
  @@index([userId, status])
}

model RunningMetricsSample {
  id                 String             @id @default(uuid()) @db.Uuid
  sessionId          String             @db.Uuid
  sequence           Int
  recordedAt         DateTime
  elapsedMs          BigInt
  distanceMeters     Int
  cadenceSpm         Decimal?           @db.Decimal(7, 2)
  cadenceConfidence  Decimal?           @db.Decimal(4, 3)
  paceSecPerM        Decimal?           @db.Decimal(10, 6)
  paceConfidence     Decimal?           @db.Decimal(4, 3)
  targetBpm          Decimal?           @db.Decimal(7, 2)
  syncStatus         String
  source             MeasurementSource
  idempotencyKey     String             @unique
  session            RunningSession    @relation(fields: [sessionId], references: [id], onDelete: Cascade)

  @@unique([sessionId, sequence])
  @@index([sessionId, recordedAt])
}

model Track {
  id                 String             @id @default(uuid()) @db.Uuid
  userId             String             @db.Uuid
  title              String
  artist             String?
  fileName           String?
  source              TrackSource        @default(LOCAL)
  clientAssetId      String?
  contentFingerprint String?
  durationMs         Int?
  sourceBpm          Decimal?           @db.Decimal(7, 2)
  bpmConfidence      Decimal?           @db.Decimal(4, 3)
  analysisStatus     AnalysisStatus     @default(PENDING)
  analysisVersion    String?
  analysisError      String?
  createdAt          DateTime           @default(now())
  updatedAt          DateTime           @updatedAt
  user               User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  playlistLinks      PlaylistTrack[]
  playbackEvents     PlaybackEvent[]

  @@unique([userId, clientAssetId])
  @@unique([id, userId])
  @@index([userId, updatedAt(sort: Desc)])
}

model Playlist {
  id          String          @id @default(uuid()) @db.Uuid
  userId      String          @db.Uuid
  name        String
  description String?
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt
  user        User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  tracks      PlaylistTrack[]

  @@unique([id, userId])
  @@index([userId, updatedAt(sort: Desc)])
}

model PlaylistTrack {
  playlistId String
  trackId    String
  position   Int
  addedAt    DateTime      @default(now())
  playlist   Playlist      @relation(fields: [playlistId], references: [id], onDelete: Cascade)
  track      Track         @relation(fields: [trackId], references: [id], onDelete: Cascade)

  @@id([playlistId, trackId])
  @@unique([playlistId, position])
  @@index([trackId])
}

model PlaybackEvent {
  id          String             @id @default(uuid()) @db.Uuid
  userId      String             @db.Uuid
  sessionId   String?            @db.Uuid
  trackId     String?            @db.Uuid
  type        PlaybackEventType
  occurredAt  DateTime
  cadenceSpm  Decimal?           @db.Decimal(7, 2)
  targetBpm   Decimal?           @db.Decimal(7, 2)
  trackBpm    Decimal?           @db.Decimal(7, 2)
  ratioBeats  Int?
  ratioSteps  Int?
  reason      String?            @db.VarChar(160)
  metadata    Json?
  user        User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  session     RunningSession?    @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  track       Track?             @relation(fields: [trackId], references: [id], onDelete: SetNull)

  @@index([userId, occurredAt(sort: Desc)])
  @@index([sessionId, occurredAt])
}

model UserPreferences {
  id                    String          @id @default(uuid()) @db.Uuid
  userId                String          @unique @db.Uuid
  unitSystem            String          @default("metric")
  cadenceSmoothing      String          @default("balanced")
  allowedRatios         Json
  adaptationMode        AdaptationMode  @default(BEAT_MATCHED_PLAYLIST)
  audioMinTempoRatio    Decimal         @default(0.80) @db.Decimal(4, 2)
  audioMaxTempoRatio    Decimal         @default(1.25) @db.Decimal(4, 2)
  audioMaxFileBytes     Int             @default(209715200)
  audioMaxChannels      Int             @default(2)
  audioFallback         AudioFallback   @default(ORIGINAL_TEMPO)
  uploadAggregates      Boolean         @default(true)
  retainHistory         Boolean         @default(true)
  batterySaver          Boolean         @default(false)
  createdAt             DateTime        @default(now())
  updatedAt             DateTime        @updatedAt
  user                  User            @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

`@@unique([userId, clientAssetId])` permits multiple nulls in PostgreSQL. The service rejects duplicate non-null IDs. The independent `userId`, `sessionId`, and `trackId` fields on `PlaybackEvent` cannot be fully protected by ordinary foreign keys. Therefore every relation-bearing write must, in one transaction, load session and track by `(id, currentUserId)`, verify any session/track combination, then insert. Missing or cross-user resources return 404. This service invariant is mandatory and has integration tests; the unique resource pairs make the intended ownership keys explicit.

## Shared Zod validation

Publish schemas in import-safe `src/domain/shared/schemas.ts` and use them in client and route handlers. Unknown keys are stripped for user settings and rejected for event metadata. Before persistence, serialize JSON and reject more than 16KB, more than 4 object nesting levels, or more than 100 total keys.

```ts
const ratio = z.object({ beats: z.union([z.literal(1), z.literal(2)]), steps: z.union([z.literal(1), z.literal(2)]) })
  .refine(value => `${value.beats}:${value.steps}` !== '2:2')
  .transform(value => ({ beats: value.beats, steps: value.steps }));
const allowedRatios = z.array(ratio).min(1).max(3)
  .superRefine((values, ctx) => { if (new Set(values.map(v => `${v.beats}:${v.steps}`)).size !== values.length) ctx.addIssue({ code: 'custom', message: 'Ratios must be unique' }); });
const settingsSnapshot = z.object({
  unitSystem: z.enum(['metric', 'imperial']), cadenceSmoothing: z.enum(['responsive', 'balanced', 'steady']),
  allowedRatios, adaptationMode: z.enum(['BEAT_MATCHED_PLAYLIST', 'REAL_TIME_TEMPO', 'OFF']),
  audioMinTempoRatio: z.number().finite().min(.8).max(1.25), audioMaxTempoRatio: z.number().finite().min(.8).max(1.25),
  audioMaxFileBytes: z.number().int().min(1).max(209_715_200), audioMaxChannels: z.union([z.literal(1), z.literal(2)]),
  audioFallback: z.enum(['ORIGINAL_TEMPO', 'DISABLE_AUDIO']),
}).strict().superRefine((v, ctx) => { if (v.audioMinTempoRatio >= v.audioMaxTempoRatio) ctx.addIssue({ code: 'custom', message: 'Minimum must be lower than maximum' }); });
```

Other limits: IDs UUID; titles 1–160 code points with control characters rejected; artist 160, description 500, filename 255, reason 160; cadence/BPM finite 40–240; confidence 0–1; pace `0.1..20 seconds/meter`; distance `0..10,000,000m`; active duration `0..86,400,000ms`; `metadata` is a strict object of string/number/boolean/null leaves with the JSON size/depth limits. `analysisError` is a bounded enum plus optional 160-character safe detail, never a stack trace.

## Authentication and anonymous behavior

Auth.js Google OAuth is the production provider. `requireUser()` provisions `User` from provider plus subject and rejects absent/expired sessions with 401. Development local auth is explicit and never uses a shared production identity. Anonymous users may use Simulation and local audio/library storage. `POST /api/sessions`, history, playlists/tracks, and preferences require authentication; anonymous local sessions do not call those routes. Logout/expiry leaves local data available and clears only server query caches.

## API envelope

Success returns a resource with `X-Request-Id`. Errors are:

```json
{ "error": { "code": "VALIDATION_FAILED", "message": "Metrics batch is invalid.", "retryable": false, "fields": { "samples[0].cadenceSpm": "Expected 40–240." } } }
```

Never return stack traces, SQL, raw coordinates, PCM, file bytes, or internal auth subjects.

## Session APIs

### `POST /api/sessions`

Protected. Request:

```json
{
  "clientSessionKey": "uuid",
  "adaptationMode": "BEAT_MATCHED_PLAYLIST",
  "measurementSource": "DEVICE_MOTION",
  "isSimulation": false,
  "unitSystem": "metric",
  "settingsSnapshot": { "...": "validated settings" }
}
```

The service scopes the row to the authenticated user, validates source/mode combinations and snapshot size, and returns 201. Repeating `(userId, clientSessionKey)` returns the existing session. An invalid combination is 422.

### `POST /api/sessions/:id/metrics`

Protected. Requires `Idempotency-Key`. Body `{ samples: [...] }`, 1–60 samples and <=64KB. Each sample has sequence, recorded time, elapsed ms, cumulative meters, optional cadence/pace/target, status, and source. The transaction loads the session by `(id, currentUserId)`, checks active status, sequence order, minimum 15-second batch interval except the first, ranges, and idempotency payload. Identical replay returns 200; conflicting key is 409; invalid ordering is 422; database outage is 503 and the client retains the queue.

### `POST /api/sessions/:id/complete`

Protected and idempotent. Request:

```json
{
  "completionIdempotencyKey": "uuid",
  "endedAt": "2026-10-24T10:30:00.000Z",
  "activeDurationMs": 2410000,
  "distanceMeters": 5120,
  "averagePaceSecPerM": 0.471,
  "bestPaceSecPerM": 0.430,
  "averageCadenceSpm": 171.4,
  "averageTargetBpm": 171.4,
  "eligibleAudioSeconds": 2100,
  "matchedAudioSeconds": 1935,
  "syncPercent": 92.14,
  "syncFormulaVersion": "sync-v1",
  "finalStatus": "COMPLETED"
}
```

Validate endedAt after startedAt; duration/distance and all metrics are bounded; best pace is null or the fastest qualifying 30-second interval; matched seconds cannot exceed eligible seconds; `syncPercent` must equal the rounded formula or be null when eligible is zero. A conflicting replay is 409; same replay returns the stored summary; completion of another user's row is 404. `INTERRUPTED` is not accepted here unless explicitly completing a previously interrupted local record under a separate reconciliation policy.

### `POST /api/sessions/:id/interrupt`

Protected and idempotent. Requires `Interruption-Idempotency-Key`. Request contains last local aggregate, `interruptedAt`, active duration, distance, and optional bounded metrics. The transaction loads the owned active/paused session, stores status `INTERRUPTED`, preserves the last valid summary without fabricating completion, and returns 200 on identical replay. If already interrupted, return the stored record. It returns 404 for wrong ownership, 409 for a conflicting key, and 503 for a retryable database failure. A browser unload may fail to deliver this request; the local outbox retries next foreground.

## History APIs

`GET /api/history?cursor=<opaque>&limit=20` requires auth. `limit` is 1–50. Return completed/interrupted sessions newest first with distance, active duration, average/best pace, cadence, target, mode, simulation flag, sync formula/version, and next cursor. `GET /api/history/:id` returns one owned summary, playback events, and at most 300 downsampled aggregate samples when retention is enabled. No coordinates are returned because none are stored.

## Playlist and track APIs

`POST /api/playlists` creates a bounded playlist. `GET /api/playlists` returns the user's ordered playlists and metadata. `PATCH /api/playlists/:id` validates name/description and an optional replacement track ID list, loads playlist and every track by current user in one transaction, rejects duplicates/missing tracks with 422, and rewrites contiguous positions. Wrong owner is 404. `DELETE /api/playlists/:id` requires client confirmation and deletes the playlist only.

`POST /api/tracks` stores metadata after local import/analysis and never accepts audio bytes. `PATCH /api/tracks/:id` allows manual BPM correction and metadata changes only for the owner. Automatic low-confidence analysis cannot overwrite a manual correction; that conflict is 409. All writes validate bounded strings and analysis error enums.

## Preferences APIs

`GET /api/preferences` returns validated defaults when no row exists. Defaults are metric, balanced, all three ratios, Beat-Matched Playlist, tempo bounds `.80..1.25`, 200MiB, two channels, original-tempo fallback, aggregate upload enabled, history enabled, and battery saver disabled. `PUT /api/preferences` accepts the complete schema, validates min < max and all bounds, updates transactionally, and affects new sessions only. The active session uses its snapshot.

Turning `retainHistory` from true to false requires explicit confirmation in the UI. In the same transaction, delete all server `RunningSession` rows for the user and therefore their samples/events. It also deletes the user's local persisted session summaries and queued metric/completion/interruption uploads after the client receives success. The preference remains false. Local audio is independent and is deleted only by Remove local audio. Account deletion is a separate authenticated confirmation endpoint/job that deletes User-owned rows, invalidates Auth.js sessions, and asks the client to clear local keys and audio; failure is reported as retryable, never silently partial.

## Playback event contract

Playback events are normally included in completion or bounded aggregate sync. If separate, `POST /api/sessions/:id/playback-events` accepts 1–100 events with enum type, finite bounded metrics, valid ratio, reason <=160 chars, and strict metadata. The transaction loads the session and each track by `(id,currentUserId)` before insertion, verifies event time is between start and a bounded completion grace period, and rejects cross-user combinations with 404. It never accepts raw audio details.

## Local/server calculation split and privacy

Client computes cadence, pace, target, playlist decisions, tempo processing, best-pace rolling window, and sync-v1 counters. Server validates aggregate bounds and stores the final summary. The default wire format contains no raw accelerometer, GPS coordinates, PCM, local paths, or personal filenames. Aggregate uploads are opt-in and at least 15 seconds apart.

## Testing and migrations

Commit PostgreSQL Prisma migrations and test against PostgreSQL, not SQLite alone. Integration tests cover Auth.js provisioning/expiry, ownership on every relation, cross-user playback rejection, idempotency replay/conflict, sequence and interval validation, best pace, sync-v1 arithmetic, retention transitions, cascade behavior, manual BPM preservation, cursor pagination, and preference snapshots. Contract tests parse every route response with the same Zod schemas. Playwright signs in with a test adapter, completes Simulation, checks history, and verifies anonymous mode remains local-only.
