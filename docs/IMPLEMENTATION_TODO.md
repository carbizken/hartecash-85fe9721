# Implementation TODO — Next-Up Product Initiatives

Queue of scoped-and-planned features waiting to ship. Each entry has a
concrete plan, estimated engineering budget, and the context needed to
start immediately without re-scoping.

Items ship on `main` directly. Land each as a single atomic commit (or
a tight series of two) so Lovable picks them up on the next sync.

---

## 1. Customer Photo-Upload Encouragement Flow

**Why:** The AI Photo Re-Appraisal system shipped in commit `122aaf3`
only works when customers upload photos. Right now photos are optional
and most customers skip them, so the suggest + auto-bump pipeline
rarely fires. This is the single highest-revenue product change in the
queue — one good decline-recovery email with photo upload can claw
back a five-figure deal per month.

**Goal:** Three new touch points that nudge customers to upload photos
with a clear "get a higher offer" incentive.

### Touch point 1 — Offer page upsell card

New card on `src/pages/OfferPage.tsx` below the hero price, shown when
`offered_price` exists and `photos_uploaded = false`:

```
📸 Upload photos, potentially increase your offer
Our AI can review photos of your vehicle and confirm the condition is
better than expected — which could mean up to $X more on your offer.

Takes 2 minutes · 6 photos recommended · Completely optional

[Upload Photos →]
```

The `$X` number is the dealer's actual `ai_auto_bump_max_dollars`
setting so it's truthful per dealer. Truthful numbers build trust;
vague "up to thousands more" language sounds like a scam.

### Touch point 2 — Decline recovery notification

New notification trigger `customer_offer_decline_recovery` wired into
`send-notification/index.ts`. Fires via email + SMS when:
- Customer taps "No thanks" on the offer page, OR
- Customer doesn't accept within 30 minutes of seeing the offer, OR
- `progress_status` moves to `offer_declined`

**Email copy:**
```
Hi {{customer_name}},

We saw you didn't accept the ${{offered_price}} offer for your
{{vehicle}}. Before you go — our system can potentially raise your
offer for free if the condition is better than you described.

Upload 6 quick photos: {{photo_upload_link}}

Our AI reviews them in 2 minutes, and if your car looks cleaner than
expected, your offer automatically goes up. No strings, no commitment.

— {{dealership_name}}
```

**SMS copy** (under 160 chars):
```
{{dealership_name}}: Your offer could go UP. Snap 6 quick photos and
our AI may raise your number in 2 min: {{short_link}}. Reply STOP.
```

Respects existing opt-outs + quiet hours because it flows through the
existing `send-notification` infrastructure unchanged.

### Touch point 3 — Result screen with three outcomes

New post-upload screen at `src/pages/UploadPhotos.tsx`. After photos
upload and the AI re-appraisal runs, show one of three screens based
on the result:

| Outcome | Screen | CTA |
|---|---|---|
| **AI bump applied** (auto or suggested) | Confetti + "Great news — your offer went up $X!" with new price | **[Accept New Offer]** |
| **AI confirmed reported condition** | "Thanks! Your offer of $X is confirmed." | **[Accept Offer]** |
| **AI saw worse condition** | "Thanks! Our team is reviewing your submission — we'll contact you shortly." | *(no auto-action)* |

**Critical rule:** The third case never shows the customer a lowered
number. Worsening recommendations always route to the Appraiser Queue
for a human to decide how to communicate (or simply hold the number).

### Bonus — Optional photo categories

Below the required 6 photos, a new "Unlock a bigger offer" section:

- Dashboard with engine on → "proves no warning lights" → up to +$800
- Tire tread close-ups → "newer tires" → up to +$400
- Service records → "regular maintenance" → up to +$600
- Clean interior → "cabin wear grade" → up to +$500
- Aftermarket upgrades → wheels, stereo, bed liner → varies

Each with its own upload slot. Gamified: "4 of 5 bonus items uploaded."
Each optional photo feeds more data into `analyze-vehicle-damage` so
the AI has a stronger signal for its condition call.

### Scope

- **Files touched:** `OfferPage.tsx`, `UploadPhotos.tsx`,
  `send-notification/index.ts`, new `src/lib/photoUploadIncentives.ts`
  helper, possibly new `customer_offer_decline_recovery` template
  rows in `notification_templates`
- **Migration:** New trigger key, optional `photos_prompt_seen_at`
  column on submissions for analytics
- **New edge function:** None (reuses the existing re-appraisal
  pipeline)
- **Estimated budget:** 1-2 days, single commit
- **Dependencies:** None — everything it needs is already on main
  (AI photo re-appraisal, analyze-vehicle-damage, notification system)

### Open questions before shipping

1. Should the decline-recovery email go out to customers who decline
   politely (clicked No) AND customers who just ghost (never replied)?
   Or just the politely-declined ones?
2. Do we cap the "up to $X" number at the dealer's `ai_auto_bump_max_dollars`
   or at the absolute cap across any bump they've ever done?
3. The bonus photo categories add complexity to the form — do we ship
   them in the same commit or as a follow-up?

---

## 2. Tread & Brake Depth Integration (Tekmetric first)

**Why:** Dealers manually type tread depth and brake depth into the
inspection sheet today, every time. The data has already been captured
by the service department — often by the dealer's own techs during a
recent oil change. The fact that it doesn't flow into the inspection
sheet is a pure workflow gap.

**Goal:** Auto-populate tread + brake measurements from the dealer's
shop management system when a customer appears in both systems.

### Integration landscape (research summary)

| Tool | API available? | Notes |
|---|---|---|
| **Hunter Quick Tread / Quick Check Drive** | Yes, via WebOffice (private integrator agreement) | Drive-over laser, highest accuracy. Phase 3 target. |
| **Tekmetric** | Yes — documented REST API with OAuth2 | **Phase 1 target.** Independent-shop leader. `api.tekmetric.com`. |
| **Shop-Ware** | Yes — REST API | Phase 2. |
| **Mitchell 1** | Yes — REST API | Phase 2. |
| **CDK Service / Reynolds ERA** | Enterprise-only | Phase 4, big-group tier. |
| **Bosch / Beissbarth TireInspect** | No — CSV export to monitored folder | Phase 3.5, low priority. |
| **Uveye** | Enterprise API ($2,500/mo site fee) | Phase 5, only worth it for AutoNation/Group 1 scale. |
| **DualTread / handheld lasers** | No API at all | Never — use the QR handoff fallback. |

### Phase 1 — Tekmetric integration

**Why Tekmetric first:** Largest independent-shop market share, clean
documented API, fast OAuth2 setup, and the biggest % of our target
dealers use it. Most new installs in 2023-2025 picked Tekmetric.

**Data model:**
- New table `shop_system_connections`:
  - `dealership_id`, `system` (`tekmetric` | `shop_ware` | etc.),
    `external_shop_id`, `oauth_refresh_token` (encrypted),
    `connected_at`, `last_sync_at`
- New columns on `submissions`:
  - `tread_data_source` (`manual` | `tekmetric` | `shop_ware` | ...)
  - `tread_data_synced_at`
  - `brake_data_source`, `brake_data_synced_at`

**Edge function:** `shop-system-sync-tread-brake`
- Input: `{ submission_id }` OR `{ customer_phone, vin }`
- For each connected shop system:
  1. Look up customer by phone or VIN via shop system API
  2. Fetch most recent inspection with tire/brake measurements
  3. If found within 90 days, populate:
     - `submissions.tire_lf/rf/lr/rr` (32nd")
     - `submissions.brake_*` (mm or 32nd", converted if needed)
     - Set data source fields
  4. Write `activity_log` entry "Tread data synced from Tekmetric"
- Called from:
  - `AppraisalTool.tsx` "Pull Inspection Data" button (already
    exists — just route it through this new function)
  - `InspectionCheckIn.tsx` after VIN is captured (auto-sync if the
    customer is found)

**Admin setup:** New section under System Settings → "Shop System
Connections" with an OAuth-style connect flow (redirect to Tekmetric,
exchange code, store refresh token). One-time per dealer.

**Scope:**
- **Files touched:** `AppraisalTool.tsx`, `InspectionCheckIn.tsx`,
  new `src/components/admin/ShopSystemConnections.tsx`
- **New edge function:** `shop-system-sync-tread-brake`
- **Migration:** `shop_system_connections` table + submission columns
- **Estimated budget:** 2-3 days **with a Tekmetric dev account**.
  Without one, ship the skeleton (OAuth flow + pluggable abstraction)
  and wire real credentials when they're available.
- **Dependencies:** Tekmetric developer account + OAuth client ID

### Phase 1.5 — QR handoff for laser tools without an API

Before any real API integration lands, there's a zero-integration win:
a **"Laser Tool Handoff"** screen in the mobile inspection flow that
shows a big QR code the tech scans from their laser tool. The QR
deep-links into the inspection sheet with the tread/brake fields
pre-focused and a numeric keypad primed.

- Workflow today: tech takes laser measurement → walks to tablet →
  finds inspection sheet → finds the right field → types → repeats
- Workflow with QR handoff: tech takes laser measurement → scans QR
  on tablet → keypad pops up on their phone with the field already
  focused → types the number → hits enter → field on tablet updates
  via realtime subscription

**Files touched:** `InspectionSheet.tsx`, `MobileInspection.tsx`, new
`src/pages/LaserToolHandoff.tsx`
**Scope:** 1 day
**Ships independently of Phase 1 API work**

### Phase 2+ — Future phases

- **Phase 2:** Shop-Ware + Mitchell 1 integrations (add more shop
  system adapters to the `ShopSystemConnector` interface)
- **Phase 3:** Hunter WebOffice (direct laser-drive-over), requires
  Hunter integrator agreement
- **Phase 4:** CDK Service and Reynolds ERA (enterprise tier, needed
  for AutoNation-size deals)
- **Phase 5:** Uveye for fully-automated drive-through inspection

---

## Prioritization

If shipping one of these per sprint:

1. **Photo Upload Encouragement (1-2 days)** — biggest revenue impact,
   zero new dependencies, pure frontend + one notification template.
2. **Laser Tool QR Handoff (1 day)** — zero-integration quick win that
   buys goodwill with dealer techs immediately.
3. **Tekmetric Tread/Brake sync (2-3 days)** — needs a dev account but
   is the biggest operational upgrade in inspection workflow.

All three items are scoped tightly enough to ship within a week of
calendar time if prioritized sequentially.
