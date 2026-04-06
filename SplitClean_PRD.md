# PRD: SplitClean — Expense Splitting Without the BS

## Overview

A dead-simple expense splitter for friends, roommates, and couples. Add an expense, pick who's involved, see who owes what. No account required, no $50/year subscription, no receipt scanning upsell, no "Pro" paywall on basic features like itemized splits.

**Why this wins:** Splitwise has 100M+ downloads and recently moved core features behind a $50/year subscription. Their app reviews and subreddit are filled with users actively looking for alternatives. We're building the app Splitwise used to be — before they enshittified it.

**Built-in virality:** Every user who adds a friend to a group is recruiting a new user. This is the only app on our roster with an organic viral loop baked into the core use case.

**Target users:** Friends splitting dinner, roommates splitting rent/utilities, couples sharing expenses, travel groups splitting trip costs. Anyone who's ever Venmo'd the wrong amount.

**Build target:** React Native (Expo) for Android + iOS. Ship in 2-3 days.

---

## Competitive Landscape

| App | Downloads | Price | Problem |
|-----|-----------|-------|---------|
| Splitwise | 100M+ | Free → $50/year Pro | Itemized splits, charts, receipt scanning all paywalled. Bloated with "debt simplification," expense categories, currency conversion. Users furious about features that were free being locked. |
| Tricount | 10M+ | Free (ads) / $4 remove ads | Decent but clunky UI, feels dated, limited to group trips. No 1-on-1 tracking. |
| Settle Up | 5M+ | Free (ads) / $5 Pro | Functional but ugly. Complex UI. Google Sheets energy. |
| Tab | 1M+ | Free | iOS only. No Android. Limited features. |
| Plates | 500K+ | Free | Bill splitting only (photo of receipt). No ongoing balances. |

**The gap:** Every alternative is either ugly, clunky, or missing features. Nobody has built a *beautiful*, *fast*, *free* Splitwise replacement. That's SplitClean.

---

## Core Philosophy

1. **Add expense → split → done.** Three taps to log a shared expense.
2. **No account required.** Works entirely offline and locally. Optional cloud sync later.
3. **No subscription.** Free with optional one-time $3.99 Pro unlock.
4. **Itemized splits are FREE.** This is the single biggest Splitwise complaint. We will never paywall this.
5. **Beautiful by default.** This app should feel like it was designed by a team of 20, not built in a weekend.

---

## Screens

### 1. Groups Screen (Home)

The landing screen. Shows all your groups and 1-on-1 balances.

**Elements:**
- **Group list** — each group card shows:
  - Group emoji + name (e.g., "🏠 Apartment" / "✈️ Japan Trip" / "🍕 Friday Dinners")
  - Number of members (e.g., "3 people")
  - Your net balance in that group: green if you're owed money ("You're owed $42.50"), red if you owe ("You owe $18.00"), gray if settled ("All settled up ✓")
  - Last activity timestamp ("2 hours ago")
- **"+ New Group" button** — floating action button, bottom right
- **Quick 1-on-1:** At the top, a horizontal scroll of recent people you've split with, showing tiny avatar + balance. Tap to go directly to your 1-on-1 ledger with that person.
- **Total balance summary** at top: "Overall, you are owed $67.50" or "Overall, you owe $23.00" — with satisfying green/red color

**Creating a new group:**
- Enter group name
- Pick an emoji (grid of common ones: 🏠🍕✈️🎉🏖️💼🎓🚗🛒💪)
- Add members by name (just first name — no phone number or account needed for MVP)
- That's it. No invite flow, no permissions, no account linking.

### 2. Group Detail Screen

The core experience. Shows all expenses in a group and the current balance sheet.

**Two tabs at top: "Expenses" and "Balances"**

**Expenses tab:**
- Reverse chronological list of all expenses
- Each expense card shows:
  - Description (e.g., "Dinner at Nobu")
  - Amount ("$187.50")
  - Who paid ("Paid by Mishuk")
  - How it was split ("Split equally between 3")
  - Date
  - Category emoji (auto-assigned or manual: 🍽️🛒🏠🚗🎬💊✈️⚡🎁📱)
- **"+ Add Expense" button** — prominent FAB

**Balances tab:**
- **Settlement summary:** Shows the simplified debts
  - "Ravi owes Mishuk $42.50"
  - "Priya owes Mishuk $18.00"
  - Each with a **"Settle up"** button that marks the debt as paid
- **Visual balance bars:** Horizontal stacked bars showing each person's relative position (who's ahead, who's behind). Immediately intuitive.
- **Settle animation:** When someone taps "Settle up," the debt card collapses with a satisfying animation and confetti burst. Settling up should feel *good* — it's a dopamine moment.

### 3. Add Expense Screen

This is the critical flow. Must be completable in <5 seconds for a simple equal split.

**Elements (top to bottom):**

- **Amount input** — large, auto-focused numeric keyboard. Dollar sign prefix. This is the first thing you interact with.
- **Description** — single text field. Placeholder: "What's this for?" Optional but encouraged.
- **Paid by** — horizontal scroll of group member chips. Tap to select who paid. Defaults to "You."
- **Split method** — segmented control with three options:
  - **Equal** (default): Split evenly among selected members
  - **Exact**: Enter specific amounts for each person
  - **Percent**: Enter percentages for each person
  - **Itemized** (FREE — this is our differentiator): Assign specific items to specific people
- **Split among** — member chips with checkboxes. All selected by default. Deselect anyone not involved.
- **Category** — optional emoji picker row (auto-suggests based on description keywords)
- **"Save" button** — full width at bottom

**Itemized split flow (the Splitwise killer feature — FREE):**
- Tap "Itemized"
- Add line items: "Steak $45" / "Pasta $22" / "Wine $38" / "Tax $12" / "Tip $25"
- Assign each item to one or more people by tapping their name chips
- Shared items (tax, tip) can be marked "split among all"
- Running total at bottom updates in real-time
- This feature alone is worth $50/year on Splitwise. We give it away free.

### 4. Activity Feed (optional tab)

Simple chronological feed across all groups. Shows:
- "Mishuk added $187.50 'Dinner at Nobu' in 🍕 Friday Dinners"
- "Priya settled up $42.50 with Mishuk in 🏠 Apartment"
- Useful for power users with many groups. Can be a third bottom tab.

### 5. Settings Screen

Minimal.

- **Your name:** editable (used as "You" throughout the app)
- **Default currency:** USD, EUR, GBP, CAD, AUD, INR, etc.
- **Appearance:** Dark / Light / System
- **Sound & Haptics:**
  - Toggle: Sound effects (default OFF)
  - Toggle: Haptic feedback (default ON)
- **Data:**
  - Export all data as CSV
  - Clear all data (with confirmation)
- **About:**
  - Version, privacy policy, rate app
  - "No subscriptions. No BS. Ever."

---

## Dopamine & Engagement Layer

These are baked into the core experience — not bolted on. Every one of these makes the app more fun to use without adding bloat.

### 1. Settle Up Celebration

When a debt is fully settled (someone taps "Settle up"), trigger:
- The debt card collapses and dissolves with a particle animation
- Brief confetti burst
- Satisfying "ka-ching" sound (if sounds enabled)
- Haptic success feedback
- If ALL debts in a group are settled: full-screen "🎉 All Settled Up!" celebration with the group emoji enlarged and bouncing
- This moment is screenshot-worthy and shareable

### 2. Group Savings Tracker

At the top of each group's Balances tab, show:
- "This group has tracked **$4,287** in shared expenses"
- This number only goes up. It's a vanity metric that makes the group feel accomplished.
- Milestone celebrations at $1K, $5K, $10K, $25K, $50K, $100K
  - Brief badge animation: "💰 $5,000 Club" 
  - Shareable card

### 3. "You're Owed" / "You Owe" Color Psychology

- When you're owed money: the balance glows **green** with a subtle pulse. Feels like money coming your way.
- When you owe money: the balance is **warm amber** (not angry red — we don't shame). Subtle nudge without negativity.
- When settled: peaceful **gray** with a checkmark. Calm, resolved.

### 4. Share a Split Card

After adding an expense, offer a one-tap "Send to group" that generates a clean card:
- Shows the expense, who paid, and what each person owes
- Formatted for iMessage/WhatsApp/Instagram DM
- Example: "🍕 Dinner at Nobu — $187.50 / Mishuk paid / You owe $62.50"
- Includes a tiny "via SplitClean" footer — organic app discovery
- This replaces the awkward "hey you owe me $62.50" text. It makes collecting money *socially easy*.

### 5. Monthly Spending Recap

Auto-generated on the 1st of each month:
- "In March, you split **$1,247** across 4 groups"
- "Your biggest split: $412 Japan Trip 🗾"  
- "You settled 8 debts 🎉"
- Mini bar chart showing spending by group
- Shareable card format

### 6. Speed Badges

Reward fast expense logging:
- "⚡ Lightning Split" — logged an expense in under 3 seconds
- "🏃 Speed Demon" — logged 5 expenses in one day
- "📸 Snap Split" — used itemized split (rewarding the power feature)
- These are subtle, appear once as a toast notification, and get collected in a small badge section in settings. They're easter eggs, not a gamification system.

---

## Data Model

All data stored locally using SQLite (expo-sqlite). SQLite is preferred over AsyncStorage here because expense apps need relational queries (expenses by group, balances between people, etc.).

### Group

```json
{
  "id": "uuid-v4",
  "name": "Friday Dinners",
  "emoji": "🍕",
  "members": [
    { "id": "uuid", "name": "Mishuk", "is_self": true },
    { "id": "uuid", "name": "Ravi", "is_self": false },
    { "id": "uuid", "name": "Priya", "is_self": false }
  ],
  "created_at": "2026-01-15T00:00:00Z",
  "total_expenses": 4287.50
}
```

### Expense

```json
{
  "id": "uuid-v4",
  "group_id": "uuid-v4",
  "description": "Dinner at Nobu",
  "amount": 187.50,
  "currency": "USD",
  "paid_by": "member-uuid (Mishuk)",
  "split_method": "equal",
  "splits": [
    { "member_id": "uuid (Mishuk)", "amount": 62.50, "percent": 33.33 },
    { "member_id": "uuid (Ravi)", "amount": 62.50, "percent": 33.33 },
    { "member_id": "uuid (Priya)", "amount": 62.50, "percent": 33.33 }
  ],
  "category": "🍽️",
  "created_at": "2026-04-05T21:00:00Z",
  "items": null
}
```

### Expense with Itemized Split

```json
{
  "id": "uuid-v4",
  "group_id": "uuid-v4",
  "description": "Dinner at Nobu",
  "amount": 187.50,
  "currency": "USD",
  "paid_by": "member-uuid (Mishuk)",
  "split_method": "itemized",
  "splits": [
    { "member_id": "uuid (Mishuk)", "amount": 78.50 },
    { "member_id": "uuid (Ravi)", "amount": 67.00 },
    { "member_id": "uuid (Priya)", "amount": 42.00 }
  ],
  "category": "🍽️",
  "created_at": "2026-04-05T21:00:00Z",
  "items": [
    { "name": "Steak", "amount": 45.00, "assigned_to": ["Mishuk"] },
    { "name": "Pasta", "amount": 22.00, "assigned_to": ["Priya"] },
    { "name": "Sushi Platter", "amount": 38.00, "assigned_to": ["Ravi"] },
    { "name": "Wine", "amount": 48.00, "assigned_to": ["Mishuk", "Ravi"] },
    { "name": "Tax + Tip", "amount": 34.50, "assigned_to": ["Mishuk", "Ravi", "Priya"] }
  ]
}
```

### Settlement

```json
{
  "id": "uuid-v4",
  "group_id": "uuid-v4",
  "from_member": "uuid (Ravi)",
  "to_member": "uuid (Mishuk)",
  "amount": 42.50,
  "settled_at": "2026-04-06T10:00:00Z",
  "method": "venmo"
}
```

### User Settings

```json
{
  "self_name": "Mishuk",
  "default_currency": "USD",
  "theme": "system",
  "sounds_enabled": false,
  "haptics_enabled": true,
  "is_pro": false,
  "unlocked_badges": ["lightning_split", "snap_split"],
  "last_monthly_recap_date": "2026-04-01"
}
```

---

## Balance Calculation Logic

This is the core algorithm. Must be correct — wrong math kills trust instantly.

```
function calculateBalances(group):
  // Initialize balance map: how much each person is net owed (+) or owes (-)
  balances = {} // member_id → net amount
  for member in group.members:
    balances[member.id] = 0

  // Process each expense
  for expense in getExpenses(group.id):
    payer = expense.paid_by
    for split in expense.splits:
      if split.member_id == payer:
        // Payer's share — they paid but also consumed this amount
        // Net effect: they're owed (total - their_share) by others
        continue
      else:
        // This person owes the payer their share
        balances[split.member_id] -= split.amount  // They owe more
        balances[payer] += split.amount              // Payer is owed more

  // Process settlements
  for settlement in getSettlements(group.id):
    balances[settlement.from_member] += settlement.amount  // Reduced their debt
    balances[settlement.to_member] -= settlement.amount    // Received payment

  return balances

function simplifyDebts(balances):
  // Convert net balances into minimum number of transactions
  // This is the "debt simplification" algorithm
  
  debtors = []   // People who owe money (negative balance)
  creditors = [] // People who are owed money (positive balance)

  for member_id, amount in balances:
    if amount < -0.01:  // Use epsilon for float comparison
      debtors.push({ member_id, amount: abs(amount) })
    elif amount > 0.01:
      creditors.push({ member_id, amount })

  // Sort both by amount descending
  debtors.sort(by: amount, descending)
  creditors.sort(by: amount, descending)

  transactions = []
  
  while debtors.length > 0 AND creditors.length > 0:
    debtor = debtors[0]
    creditor = creditors[0]
    
    settleAmount = min(debtor.amount, creditor.amount)
    
    transactions.push({
      from: debtor.member_id,
      to: creditor.member_id,
      amount: round(settleAmount, 2)
    })
    
    debtor.amount -= settleAmount
    creditor.amount -= settleAmount
    
    if debtor.amount < 0.01:
      debtors.shift()
    if creditor.amount < 0.01:
      creditors.shift()

  return transactions
  // Example output:
  // [
  //   { from: "Ravi", to: "Mishuk", amount: 42.50 },
  //   { from: "Priya", to: "Mishuk", amount: 18.00 }
  // ]
```

**Critical: Rounding.** Always round to 2 decimal places. When splitting equally, assign the rounding remainder (pennies) to the payer. E.g., $100 split 3 ways = $33.33 + $33.33 + $33.34 (payer absorbs the extra penny). This prevents the maddening "your balances don't add up to zero" bug that plagues Splitwise.

---

## Design System

### Visual Identity
- **App name:** SplitClean
- **Tagline:** "Split expenses. Not hairs."
- **Icon:** Two overlapping circles (Venn diagram style) in green and indigo, suggesting two people sharing. Clean, geometric, modern.

### Colors

**Dark mode (default):**
- Background: #0A0A0F
- Card background: #1A1A24
- Primary accent: #6366F1 (indigo — actions, buttons)
- Positive/owed: #22C55E (green)
- Negative/owe: #F59E0B (amber — NOT red, we don't shame)
- Settled: #64748B (gray)
- Text primary: #F8FAFC
- Text secondary: #94A3B8
- Category emoji backgrounds: subtle colored circles matching emoji mood

**Light mode:**
- Background: #FAFBFC
- Card background: #FFFFFF
- Same accent colors, slightly deeper

### Typography
- System fonts
- Amounts: 28px bold (the number is the hero of every card)
- Group names: 20px semibold
- Descriptions: 16px regular
- Secondary text: 13px regular, muted

### Animation & Motion

**Expense added:** The new expense card slides in from the bottom with a spring bounce. The group's total counter ticks up with an odometer animation.

**Settle up:** The debt card shrinks, flips, and dissolves into particles. If all debts are settled, confetti fills the screen for 2 seconds. Haptic success.

**Balance bars:** Animate from zero to their current values when the Balances tab is opened. Staggered per person (each bar starts 100ms after the previous).

**Amount input:** As you type digits, the number scales up slightly with each keystroke, creating a tactile "weight" to the money being entered.

**Share card:** Slides up from bottom with spring physics.

**Sound design (all optional, OFF by default):**

| Moment | Sound |
|--------|-------|
| Expense saved | Soft "receipt print" chirp |
| Settle up | Satisfying "ka-ching" coin sound |
| All settled | Brief celebration chime |
| Monthly recap | Gentle notification bell |

---

## App Store Optimization (ASO)

### App Name (30 chars)
**"SplitClean: Split Expenses"**

### Short Description (80 chars)
"Split bills with friends, free. Itemized splits included. No subscription ever."

### Long Description Keywords

**Primary (high volume):**
- split expenses app
- bill splitter
- expense splitter
- split bills with friends
- Splitwise alternative
- split the bill
- shared expenses
- roommate expenses
- group expenses

**Secondary:**
- itemized bill split
- trip expense splitter
- dinner bill calculator
- who owes who
- settle up app
- split rent app
- couple expense tracker
- travel expense splitter
- free bill splitter
- expense tracker friends

**Long-tail (low competition, high intent):**
- "Splitwise alternative free"
- "split expenses without subscription"
- "free itemized bill splitter"
- "split dinner bill app"
- "roommate expense app free"
- "app like Splitwise but free"

### Screenshots (5)
1. Group detail showing expenses list with beautiful cards, emoji categories, and green "you're owed $67.50" balance — hero shot
2. Add Expense screen mid-flow showing equal split with member chips — demonstrates speed
3. Itemized split in action: line items assigned to different people with running totals — the Splitwise killer feature, FREE
4. Settle up celebration: confetti, "All Settled Up! 🎉" — the dopamine moment
5. Comparison: "Splitwise Pro: $50/year for itemized splits. SplitClean: Free. Forever." — positioning

### Category
- **Primary:** Finance
- **Secondary:** Lifestyle

---

## Monetization

### Free Tier (ship this)
- Unlimited groups
- Unlimited expenses
- ALL split methods including itemized (our key differentiator)
- Full balance tracking and debt simplification
- Settle up tracking
- Share cards
- Dark/light mode
- One small banner ad on groups list screen only (NOT inside groups or during expense entry)

### Pro Tier — $3.99 one-time purchase
- Remove ads
- CSV/PDF export of group expenses
- Multi-currency support within a single group
- Recurring expenses (auto-add rent on the 1st of each month)
- Custom category emojis
- Monthly recap cards

### What We Will NEVER Do
- Subscription pricing
- Paywall itemized splits
- Paywall debt simplification
- Paywall any core splitting feature
- Require accounts or sign-in
- Add receipt scanning (keep it simple — users can type)
- Add bank/Venmo/PayPal integration (too complex, too many compliance headaches)
- Social features, friend lists, or global profiles

---

## Viral Loop Mechanics

This is the most important section. SplitClean's growth is driven by the product itself.

### Loop 1: Expense Share Cards
1. User adds an expense
2. Taps "Send to group" → generates a beautiful card showing who owes what
3. Sends via WhatsApp/iMessage to their group
4. Recipients see "via SplitClean" → download the app
5. Those users create their own groups → repeat

### Loop 2: Group Invites (V2)
1. User creates a group
2. Taps "Invite friends" → generates a link
3. Friends tap link → app opens with them auto-added to the group
4. Friends now have the app for their own future groups → repeat

### Loop 3: Settle Up Nudges
1. User sees they're owed $42.50
2. Taps "Remind" → sends a friendly pre-formatted message: "Hey! You owe $42.50 for 🍕 Friday Dinners. Settle up? 😊 — via SplitClean"
3. Recipient downloads app to track their side → repeat

**For MVP, focus on Loop 1 (Share Cards).** Loops 2 and 3 are V2. The share card alone will drive significant organic downloads because every split involves 2-5 people seeing the app name.

---

## Tech Stack

### Recommended
- **Framework:** React Native with Expo
- **State:** Zustand
- **Storage:** expo-sqlite (relational queries are essential for expenses/groups/balances)
- **Navigation:** expo-router or React Navigation (tabs: Groups, Activity, Settings)
- **Animation:** react-native-reanimated (settle-up celebrations, balance bar animations, card transitions)
- **Share cards:** react-native-view-shot + expo-sharing
- **Sound:** expo-av (~40KB total for 4 sounds)
- **Haptics:** expo-haptics
- **IAP:** expo-in-app-purchases for Pro unlock
- **Ads (optional):** react-native-google-mobile-ads (single banner)

### No Backend for MVP
Everything runs locally on device. Each user maintains their own copy of group data. This means:
- Two users in the same group must each add expenses on their own device
- This is identical to how Splitwise worked for years before cloud sync
- Cloud sync is a V2 feature (Firebase or Supabase)

### Data Sync Strategy (V2 — NOT MVP)
For V2, add optional cloud sync:
- User creates account (optional, for sync only)
- Groups get a shareable join link
- All members see the same expenses in real-time
- Use Supabase (Postgres + real-time subscriptions) or Firebase
- This is a significant engineering effort — do NOT attempt for MVP

---

## File Structure

```
/src
  /screens
    GroupsScreen.tsx        # Home — list of all groups + overall balance
    GroupDetailScreen.tsx   # Expenses + Balances tabs for a single group
    AddExpenseScreen.tsx    # Add/edit expense flow
    ItemizedSplitScreen.tsx # Itemized line items assignment
    SettingsScreen.tsx      # Preferences
    ProScreen.tsx           # One-time purchase
  /components
    GroupCard.tsx           # Single group in the list (emoji, name, balance)
    ExpenseCard.tsx         # Single expense entry (description, amount, split info)
    BalanceBar.tsx          # Horizontal animated bar showing who's ahead/behind
    DebtCard.tsx            # "Ravi owes Mishuk $42.50" with settle button
    MemberChip.tsx         # Selectable person chip (used in paid-by and split-among)
    SplitMethodPicker.tsx  # Equal / Exact / Percent / Itemized segmented control
    AmountInput.tsx        # Large styled numeric input with scaling animation
    CategoryPicker.tsx     # Emoji category selector row
    ShareCard.tsx          # Generates shareable expense summary image
    MonthlyRecap.tsx       # Monthly spending summary card
    SettleAnimation.tsx    # Confetti + dissolve for settle up
    EmojiPicker.tsx        # Grid picker for group emoji
    QuickContacts.tsx      # Horizontal scroll of recent 1-on-1 contacts
  /utils
    balances.ts            # Core balance calculation + debt simplification
    rounding.ts            # Penny-accurate rounding for splits
    storage.ts             # SQLite wrapper (CRUD for groups, expenses, settlements)
    shareCard.ts           # Generate + share expense cards
    sounds.ts              # Sound effect playback
    format.ts              # Currency formatting, date formatting
    categories.ts          # Auto-category assignment from description keywords
  /hooks
    useGroupBalances.ts    # Calculate and cache balances for a group
    useGroups.ts           # Query all groups with summary data
    useExpenses.ts         # Query expenses for a group
  /assets
    /sounds
      expense.wav          # Receipt chirp (~10KB)
      settle.wav           # Ka-ching (~12KB)
      allsettled.wav       # Celebration chime (~15KB)
      recap.wav            # Notification bell (~8KB)
  /constants
    currencies.ts          # Supported currencies with symbols
    categories.ts          # Category emoji definitions + keyword mappings
    colors.ts              # Theme colors
  /theme
    dark.ts
    light.ts
  App.tsx
```

---

## Auto-Category Assignment

When a user types an expense description, auto-suggest a category emoji based on keywords:

```json
{
  "categories": {
    "🍽️": ["dinner", "lunch", "breakfast", "restaurant", "food", "eat", "meal", "brunch", "sushi", "pizza", "burger", "thai", "chinese", "indian", "mexican", "nobu", "steak"],
    "🛒": ["grocery", "groceries", "walmart", "target", "costco", "trader joe", "whole foods", "market", "supermarket"],
    "🏠": ["rent", "mortgage", "utilities", "electric", "gas", "water", "internet", "wifi", "cable", "apartment", "house"],
    "🚗": ["uber", "lyft", "taxi", "gas", "fuel", "parking", "car", "toll", "ride"],
    "✈️": ["flight", "hotel", "airbnb", "hostel", "train", "bus", "travel", "trip", "booking"],
    "🎬": ["movie", "cinema", "netflix", "tickets", "show", "concert", "theater", "theatre", "entertainment"],
    "🍺": ["bar", "drinks", "beer", "wine", "cocktail", "pub", "club", "nightout"],
    "💊": ["pharmacy", "medicine", "doctor", "medical", "health", "prescription", "cvs", "walgreens"],
    "⚡": ["electric", "electricity", "power", "utility", "bill"],
    "🎁": ["gift", "present", "birthday"],
    "📱": ["phone", "subscription", "app", "software"],
    "🏋️": ["gym", "fitness", "workout"],
    "📦": ["amazon", "online", "delivery", "shipping", "order"]
  }
}
```

Match is case-insensitive, checked against the description. First match wins. User can always override. If no match, default to 📝.

---

## MVP Scope — Ship This Week

### In Scope
- [x] Create groups with emoji + name + members
- [x] Add expenses with amount, description, payer, and split method
- [x] Equal split (default)
- [x] Exact amount split
- [x] Percentage split
- [x] Itemized split with line item assignment (FREE — our differentiator)
- [x] Auto-category emoji from description keywords
- [x] Balance calculation with debt simplification
- [x] Settle up tracking with celebration animation
- [x] "All Settled Up" confetti celebration
- [x] Group total expense counter with odometer animation
- [x] Share expense card (one-tap, formatted for iMessage/WhatsApp)
- [x] Edit/delete expenses
- [x] Penny-accurate rounding
- [x] Dark mode + light mode
- [x] Sound effects (optional, OFF by default)
- [x] Haptic feedback
- [x] Works 100% offline, no account, no backend
- [x] Quick 1-on-1 balance view from home screen

### Out of Scope (V2)
- Cloud sync between users
- Group invite links
- Settle up reminders ("nudge" messages)
- Recurring expenses
- Multi-currency within a group
- Monthly spending recap
- CSV/PDF export
- Receipt photo attachment
- Payment integration (Venmo, PayPal, etc.)
- User accounts
- Push notifications
- Apple Watch / Wear OS

---

## Launch Strategy

### Day 1-3: Build + Submit
1. Build with Expo / React Native
2. App icon (overlapping circles, green + indigo gradient)
3. 5 screenshots per platform
4. Store listing with all keywords above
5. Submit to both stores

### Week 1: Seed Distribution
1. r/splitwise — "Free alternative to Splitwise with itemized splits" (this sub exists and is full of complaints)
2. r/personalfinance — "Built a free expense splitter after Splitwise went to $50/year"
3. r/frugal — perfect audience
4. r/androidapps, r/iOSapps
5. r/roommates — "Free app for splitting rent and bills"
6. r/sideproject, r/indiehackers
7. X/Twitter thread: screenshot comparison of Splitwise Pro pricing vs SplitClean

### Week 2-4: Viral Loop Kicks In
- Every user who shares an expense card exposes 2-5 friends to the app
- Monitor organic install growth from share cards
- Respond to every app store review

### Month 2: Content + ASO
- Publish "SplitClean vs Splitwise" comparison blog post (SEO play)
- Update store listing keywords based on Play Console data
- Consider TikTok content: "POV: Your friend group finally switches from Splitwise" (relatable, shareable)

---

## Success Metrics

| Timeframe | Downloads | Rating | Revenue |
|-----------|-----------|--------|---------|
| Week 1 | 500 | 4.5+ | $0 |
| Month 1 | 5,000 | 4.5+ | $500-1,000 |
| Month 3 | 50,000 | 4.5+ | $10,000 cumulative |
| Month 6 | 200,000 | 4.5+ | $50,000 cumulative |

**North star metric:** Groups with 2+ members. This means the viral loop is working — users are adding friends, not just tracking solo.

**Secondary metric:** Share card sends per user. Each share is a potential new install.

---

## Why This Wins

| Factor | Splitwise | SplitClean |
|--------|-----------|------------|
| Price | Free (limited) → $50/year Pro | Free (Pro: $3.99 once) |
| Itemized splits | Pro only ($50/year) | Free |
| Account required | Yes | No |
| Internet required | Yes | No |
| Time to first expense | 3-5 min (signup, verify email, create group, invite friends, add expense) | 30 seconds (open → name → create group → add expense) |
| App size | 85 MB | <20 MB |
| Onboarding | Account creation + email verify + profile setup | Enter your name. Done. |
| Features | Expense splitting + receipt scanning + charts + categories + notes + photos + recurring + multi-currency + Venmo integration + ... | Expense splitting. That's it. And it's perfect. |

**The positioning: "Splitwise, minus the $50/year. And minus the BS."**
