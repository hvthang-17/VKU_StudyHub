# PRD: VKU StudyHub – Real-time Study Room Booking App

## Introduction

VKU StudyHub is a mobile application built with React Native & Expo that allows VKU students and study groups to discover, reserve, and check into campus computer labs and study rooms in real time. Currently, students must physically walk to rooms to check availability, leading to wasted time and double-booking conflicts. This app eliminates those pain points by providing a fast, reliable digital booking system with real-time slot availability, conflict prevention, QR-based check-in, and push notification reminders.

**Tech Stack:** React Native, Expo SDK, TypeScript, Zustand, React Navigation, Firebase (Auth + Firestore), expo-notifications, expo-barcode-scanner.

## Goals

- Allow VKU students to browse all campus study rooms/labs with real-time availability status
- Enable fast multi-parameter filtering (building, capacity, equipment) to find the right room
- Provide a visual time-slot selector with automatic conflict prevention (no double-booking)
- Generate unique booking passes with QR codes for digital check-in
- Support QR code scanning at the room to complete check-in
- Send local push notification reminders 15 minutes before a booked slot starts
- Persist user session, bookings, and filter preferences via Zustand + AsyncStorage
- Authenticate users with Firebase Auth (email/password registration & login)
- Store all room and booking data in Firebase Firestore for real-time sync
- Deliver a polished, full-featured experience including favorites, booking history, and profile management


## User Stories

### US-001: User Registration
**Description:** As a new VKU student, I want to create an account with my email and password so that I can access the booking system.

**Acceptance Criteria:**
- [ ] Registration screen with fields: Full Name, Student ID, Email, Password, Confirm Password
- [ ] Email format validation (must be valid email)
- [ ] Password minimum 6 characters with confirmation match check
- [ ] Student ID format validation (e.g., pattern like `21IT123`)
- [ ] On submit, creates user in Firebase Auth and stores profile in Firestore `users` collection
- [ ] Shows loading indicator during registration
- [ ] Displays specific error messages for: email already in use, weak password, network error
- [ ] On success, navigates to Home screen automatically
- [ ] Typecheck passes
- [ ] Verify on device using Expo Go

### US-002: User Login
**Description:** As a registered student, I want to log in with my email and password so that I can access my bookings and make new reservations.

**Acceptance Criteria:**
- [ ] Login screen with Email and Password fields
- [ ] "Don't have an account? Register" link navigates to Registration screen
- [ ] On submit, authenticates via Firebase Auth
- [ ] Shows loading indicator during login
- [ ] Displays specific error messages for: invalid credentials, user not found, network error
- [ ] On success, stores user session in Zustand store (persisted via AsyncStorage) and navigates to Home
- [ ] User remains logged in after app restart (session persistence)
- [ ] Typecheck passes
- [ ] Verify on device using Expo Go

### US-003: User Logout
**Description:** As a logged-in student, I want to log out so that I can switch accounts or secure my session.

**Acceptance Criteria:**
- [ ] Logout button on Profile screen
- [ ] Shows confirmation dialog: "Are you sure you want to log out?"
- [ ] On confirm, signs out from Firebase Auth and clears Zustand user session
- [ ] Navigates to Login screen after logout
- [ ] Typecheck passes
- [ ] Verify on device using Expo Go

### US-004: Room Discovery Feed
**Description:** As a student, I want to see a scrollable list of all available study rooms and labs so that I can quickly find a room to book.

**Acceptance Criteria:**
- [ ] Home screen displays rooms in a FlatList (not ScrollView)
- [ ] Each room card shows: room photo, room name (e.g., "Lab A301"), building + floor label, capacity badge (e.g., "👥 12"), equipment icons/tags, real-time status badge ("Available Now" green or "Occupied" red)
- [ ] Room cards are memoized with `React.memo` to prevent unnecessary re-renders
- [ ] FlatList uses `keyExtractor` with room ID
- [ ] Scrolling is smooth at 60fps (no jank)
- [ ] Room data is fetched from Firestore `rooms` collection in real-time (onSnapshot)
- [ ] Shows loading skeleton/spinner while fetching rooms
- [ ] Shows empty state message when no rooms match filters
- [ ] Typecheck passes
- [ ] Verify on device using Expo Go

### US-005: Room Search
**Description:** As a student, I want to search rooms by name so that I can quickly find a specific room.

**Acceptance Criteria:**
- [ ] Search bar at top of Home screen with placeholder "Search rooms..."
- [ ] Search filters room list in real-time as user types (debounced 300ms)
- [ ] Search is case-insensitive and matches partial room names
- [ ] Clear button (X icon) in search bar to reset search
- [ ] Search query is stored in Zustand filter state
- [ ] Typecheck passes
- [ ] Verify on device using Expo Go

### US-006: Multi-Parameter Filter Chips
**Description:** As a student, I want to filter rooms by building, capacity, and equipment so that I can find rooms that match my specific needs.

**Acceptance Criteria:**
- [ ] Horizontal scrollable row of filter chip groups below search bar
- [ ] Building filter chips: A, B, C, V (single select, tap again to deselect)
- [ ] Capacity filter: dropdown or chip options for ranges (2-5, 6-10, 11-15, 16-20)
- [ ] Equipment filter chips: Projector, Whiteboard, High-spec PC, AC (multi-select)
- [ ] Active filter chips are visually highlighted (filled background color)
- [ ] Filters combine with AND logic (e.g., Building A AND has Projector AND capacity >= 6)
- [ ] Room list updates instantly when filters change
- [ ] "Clear All" button to reset all filters at once
- [ ] Filter state is managed in Zustand store
- [ ] Typecheck passes
- [ ] Verify on device using Expo Go


### US-007: Room Detail Screen
**Description:** As a student, I want to tap a room card to see full details and available time slots so that I can decide whether to book it.

**Acceptance Criteria:**
- [ ] Tapping a room card navigates to Room Detail screen (stack navigation)
- [ ] Shows large room photo at top
- [ ] Displays: room name, building + floor, full capacity info, equipment list with icons, current status
- [ ] Shows description/notes about the room if available
- [ ] "Book This Room" button navigates to Booking screen
- [ ] Back button returns to Home screen with filters preserved
- [ ] Typecheck passes
- [ ] Verify on device using Expo Go

### US-008: 7-Day Date Selector
**Description:** As a student, I want to select a date within the next 7 days so that I can see which time slots are available on that day.

**Acceptance Criteria:**
- [ ] Horizontal scrollable date selector showing today + next 6 days
- [ ] Each date chip shows: day name (Mon, Tue...) and date number
- [ ] Today is selected by default and labeled "Today"
- [ ] Selected date chip has distinct visual style (filled/highlighted)
- [ ] Tapping a date loads time slots for that room on that date
- [ ] Past dates are not shown
- [ ] Typecheck passes
- [ ] Verify on device using Expo Go

### US-009: Time-Slot Selector with Conflict Prevention
**Description:** As a student, I want to see all available 2-hour time slots for a room on a given day so that I can pick a free slot without conflicts.

**Acceptance Criteria:**
- [ ] Displays 4 discrete time slots: 07:30–09:30, 09:30–11:30, 13:00–15:00, 15:00–17:00
- [ ] Each slot shows start-end time clearly
- [ ] Available slots are green/tappable
- [ ] Already-booked slots are gray/disabled with "Booked" label and cannot be tapped
- [ ] Slot availability is fetched from Firestore `bookings` collection filtered by roomId + date
- [ ] Real-time listener (onSnapshot) updates slot status if another user books while viewing
- [ ] Selecting a slot highlights it and enables the "Confirm Booking" button
- [ ] Only one slot can be selected at a time
- [ ] Typecheck passes
- [ ] Verify on device using Expo Go


### US-010: Confirm Booking & Generate Booking Pass
**Description:** As a student, I want to confirm my room booking and receive a unique booking pass so that I have proof of my reservation.

**Acceptance Criteria:**
- [ ] "Confirm Booking" button triggers Firestore write to `bookings` collection
- [ ] Booking document contains: unique ID, roomId, userId, date, timeSlot (start/end), status ("active"), createdAt timestamp
- [ ] Firestore security rules prevent double-booking (same room + date + slot)
- [ ] On success, shows booking confirmation screen with: room name, date, time slot, unique booking code
- [ ] Booking is added to Zustand store and persisted via AsyncStorage
- [ ] On failure (conflict/network), shows specific error message without navigating away
- [ ] Typecheck passes
- [ ] Verify on device using Expo Go

### US-011: QR Code Booking Pass Display
**Description:** As a student, I want to view a QR code for my booking so that I can use it for check-in at the room.

**Acceptance Criteria:**
- [ ] Booking confirmation screen / My Bookings detail shows "Show QR Code" button
- [ ] Tapping opens a modal displaying a QR code encoding the booking ID
- [ ] QR code is large enough to be scanned easily (minimum 200x200px)
- [ ] Modal also shows booking details: room name, date, time, booking code
- [ ] Close button dismisses the modal
- [ ] Typecheck passes
- [ ] Verify on device using Expo Go

### US-012: QR Code Scanner for Check-in
**Description:** As a student, I want to scan a QR code at the room entrance to check in and confirm my presence.

**Acceptance Criteria:**
- [ ] "Scan to Check-in" button on My Bookings screen (for active bookings only)
- [ ] Opens camera using expo-barcode-scanner
- [ ] Requests camera permission with explanation dialog if not yet granted
- [ ] On scanning a valid booking QR: updates booking status to "checked-in" in Firestore
- [ ] Shows success animation/message: "Checked in successfully! Enjoy your session."
- [ ] On scanning invalid QR: shows error "Invalid booking code"
- [ ] Check-in only allowed within 15 minutes before slot start to 15 minutes after slot start
- [ ] Typecheck passes
- [ ] Verify on device using Expo Go

### US-013: My Active Bookings List
**Description:** As a student, I want to see all my current and upcoming bookings so that I can manage my reservations.

**Acceptance Criteria:**
- [ ] "My Bookings" tab in bottom navigation
- [ ] FlatList showing active/upcoming bookings sorted by date+time (nearest first)
- [ ] Each booking card shows: room name, date, time slot, status badge (Active/Checked-in/Completed)
- [ ] Tapping a booking card shows full details + QR code option
- [ ] Empty state: "No bookings yet. Find a room to get started!" with CTA button
- [ ] Bookings fetched from Firestore filtered by userId + status
- [ ] Typecheck passes
- [ ] Verify on device using Expo Go


### US-014: Cancel Booking
**Description:** As a student, I want to cancel a booking I no longer need so that the room becomes available for others.

**Acceptance Criteria:**
- [ ] "Cancel Booking" button on booking detail screen (only for "active" bookings)
- [ ] Shows confirmation dialog: "Are you sure you want to cancel this booking?"
- [ ] On confirm, updates booking status to "cancelled" in Firestore
- [ ] Cancels the associated scheduled notification
- [ ] Removes booking from active list in Zustand store
- [ ] Shows success message: "Booking cancelled successfully"
- [ ] Cancelled slot becomes available for other users in real-time
- [ ] Typecheck passes
- [ ] Verify on device using Expo Go

### US-015: Local Notification Reminder
**Description:** As a student, I want to receive a push notification 15 minutes before my booked slot starts so that I don't forget my reservation.

**Acceptance Criteria:**
- [ ] When a booking is confirmed, schedules a local notification via expo-notifications
- [ ] Notification triggers exactly 15 minutes before the slot start time
- [ ] Notification title: "VKU StudyHub Reminder"
- [ ] Notification body: "Your room [room name] is ready in 15 minutes! Time: [HH:MM–HH:MM]. Don't forget to check in."
- [ ] Requests notification permission on first booking with explanation
- [ ] Notification is cancelled if the booking is cancelled (US-014)
- [ ] Works when app is in background or closed
- [ ] Typecheck passes
- [ ] Verify on device using Expo Go

### US-016: Favorite Rooms
**Description:** As a student, I want to mark rooms as favorites so that I can quickly access my preferred rooms.

**Acceptance Criteria:**
- [ ] Heart/star icon on each room card and room detail screen
- [ ] Tapping toggles favorite status (filled = favorited, outline = not)
- [ ] Favorites stored in Firestore under user document (array of roomIds)
- [ ] "Favorites" filter chip or tab on Home screen to show only favorited rooms
- [ ] Favorites persist across sessions via Firestore sync
- [ ] Typecheck passes
- [ ] Verify on device using Expo Go

### US-017: Booking History
**Description:** As a student, I want to see my past bookings so that I can review my usage history.

**Acceptance Criteria:**
- [ ] "History" tab/section in My Bookings screen
- [ ] Shows completed and cancelled bookings sorted by date (most recent first)
- [ ] Each history card shows: room name, date, time, status (Completed ✅ / Cancelled ❌)
- [ ] History items are read-only (no cancel/modify actions)
- [ ] Fetched from Firestore filtered by userId + status in ('completed', 'cancelled')
- [ ] Typecheck passes
- [ ] Verify on device using Expo Go

### US-018: User Profile Screen
**Description:** As a student, I want to view and manage my profile information.

**Acceptance Criteria:**
- [ ] Profile tab in bottom navigation
- [ ] Displays: avatar placeholder, full name, student ID, email
- [ ] Shows booking statistics: total bookings, active bookings, completed bookings
- [ ] Logout button (triggers US-003 flow)
- [ ] Typecheck passes
- [ ] Verify on device using Expo Go


### US-019: Zustand Global State with Persistence
**Description:** As a developer, I need a centralized state management store so that user session, bookings, and filters are consistent across all screens and persist after app restart.

**Acceptance Criteria:**
- [ ] `useBookingStore` created with Zustand managing: user session, rooms, bookings, filters
- [ ] Store uses `persist` middleware with `createJSONStorage(() => AsyncStorage)`
- [ ] User session (user object + auth token) survives app restart
- [ ] Active bookings array is kept in sync with Firestore
- [ ] Filter state (search query, building, capacity, equipment) persists during session
- [ ] `addBooking`, `cancelBooking`, `setFilters`, `clearFilters`, `setUser`, `logout` actions work correctly
- [ ] Typecheck passes

## Functional Requirements

- FR-01: The system must allow users to register with email/password via Firebase Auth, storing profile (name, studentId, email) in Firestore `users` collection
- FR-02: The system must allow users to log in with email/password and persist session across app restarts
- FR-03: The system must display a scrollable FlatList of rooms fetched from Firestore `rooms` collection with real-time updates (onSnapshot)
- FR-04: Each room card must show photo, name, building/floor, capacity badge, equipment tags, and real-time status (Available/Occupied)
- FR-05: The system must support instant search by room name (debounced, case-insensitive)
- FR-06: The system must support filter chips for building (A/B/C/V), capacity ranges, and equipment (Projector/Whiteboard/High-spec PC/AC) with AND logic
- FR-07: Room Detail screen must show full room info and a "Book This Room" CTA
- FR-08: Booking screen must display a 7-day horizontal date selector (today + 6 days)
- FR-09: Booking screen must show 4 discrete 2-hour time slots: 07:30–09:30, 09:30–11:30, 13:00–15:00, 15:00–17:00
- FR-10: Already-booked slots must be visually disabled (gray) and non-tappable, fetched from Firestore in real-time
- FR-11: When a user confirms a booking, the system must write to Firestore `bookings` collection and prevent double-booking via security rules
- FR-12: The system must generate a unique booking ID and display it as a QR code in a modal
- FR-13: The system must support QR code scanning via device camera (expo-barcode-scanner) for check-in
- FR-14: Check-in via QR must validate booking ID, verify time window (±15 min of slot start), and update status to "checked-in" in Firestore
- FR-15: Users must be able to cancel active bookings, which updates Firestore and frees the slot in real-time
- FR-16: The system must schedule a local notification 15 minutes before each booked slot via expo-notifications
- FR-17: Cancelling a booking must cancel the associated scheduled notification
- FR-18: Users can toggle rooms as favorites, stored in Firestore user document
- FR-19: My Bookings screen must show active/upcoming bookings and a history tab for completed/cancelled bookings
- FR-20: Profile screen must display user info, booking stats, and logout functionality
- FR-21: All global state (user, bookings, filters) must be managed via Zustand with AsyncStorage persistence


## Non-Goals (Out of Scope)

- No admin panel or room management CRUD (rooms are seeded in Firestore)
- No real-time chat or messaging between students
- No payment or fee processing for room bookings
- No integration with VKU's official academic system or timetable
- No multi-language/i18n support (Vietnamese UI only for MVP)
- No push notifications from server (FCM) – only local notifications via expo-notifications
- No room usage analytics or reporting dashboard
- No role-based access control (all users are students with equal permissions)
- No offline-first mode (requires internet for Firestore sync)

## Design Considerations

- **Navigation:** Bottom Tab Navigator with 3 tabs: Home (🏠), My Bookings (📋), Profile (👤). Stack navigator within Home for Room Detail → Booking flow.
- **Color Scheme:** Primary blue (#2563EB) for VKU branding. Green (#16A34A) for available status. Red (#DC2626) for occupied/booked. Gray (#9CA3AF) for disabled slots.
- **Room Cards:** Rounded corners (12px), shadow elevation, room photo with 16:9 aspect ratio at top, info section below with badges.
- **Filter Chips:** Pill-shaped, outlined when inactive, filled with primary color when active.
- **Time Slots:** Grid of 4 rounded buttons, clearly showing time range, color-coded by availability.
- **QR Modal:** Full-screen modal with white background, centered QR code, booking details below, close button at top-right.
- **Typography:** System fonts via Expo. Headings 18-24px bold. Body 14-16px regular.
- **Responsive:** Must work on both small (iPhone SE) and large (iPhone 15 Pro Max / Android tablets) screens.

## Technical Considerations

### Firebase Setup
- **Firebase Auth:** Email/password authentication provider
- **Firestore Collections:**
  - `users/{userId}` – name, studentId, email, favorites[], createdAt
  - `rooms/{roomId}` – name, building, floor, capacity, photo, equipment[], description
  - `bookings/{bookingId}` – roomId, userId, date, startTime, endTime, status, createdAt, checkedInAt?
- **Firestore Security Rules:** Authenticated users can read all rooms. Users can only create/read/update their own bookings. Booking creation must validate no conflicting booking exists for same room+date+slot.
- **Firestore Indexes:** Composite index on bookings: (roomId, date, status) for efficient slot availability queries.

### Performance Optimizations
- `React.memo` on RoomCard, FilterChip, TimeSlotButton components
- `useCallback` for event handlers passed to memoized children
- `FlatList` with `keyExtractor`, `initialNumToRender={10}`, `maxToRenderPerBatch={5}`, `windowSize={5}`
- Debounced search input (300ms) to avoid excessive Firestore queries
- Image caching with `expo-image` or React Native's built-in Image component

### Key Dependencies
- `expo` ~52.x (or latest stable SDK)
- `react-native` (Expo managed)
- `typescript` ~5.x
- `zustand` ^4.x with `persist` middleware
- `@react-native-async-storage/async-storage` for Zustand persistence
- `@react-navigation/native` + `@react-navigation/bottom-tabs` + `@react-navigation/native-stack`
- `firebase` ^10.x (JS SDK – modular API)
- `expo-notifications` for local push notifications
- `expo-barcode-scanner` for QR code scanning
- `react-native-qrcode-svg` for QR code generation
- `react-native-svg` (peer dependency for QR code)


### Project Structure
```
VKU_StudyHub/
├── App.tsx                    # Root component with navigation container
├── app.json                   # Expo config
├── tsconfig.json              # TypeScript config
├── firebaseConfig.ts          # Firebase initialization
├── src/
│   ├── types/index.ts         # All TypeScript interfaces (Room, Booking, User, etc.)
│   ├── store/
│   │   └── useBookingStore.ts # Zustand store with persist middleware
│   ├── navigation/
│   │   └── AppNavigator.tsx   # Tab + Stack navigation setup
│   ├── screens/
│   │   ├── LoginScreen.tsx
│   │   ├── RegisterScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── RoomDetailScreen.tsx
│   │   ├── BookingScreen.tsx
│   │   ├── MyBookingsScreen.tsx
│   │   └── ProfileScreen.tsx
│   ├── components/
│   │   ├── RoomCard.tsx       # Memoized room card for FlatList
│   │   ├── SearchBar.tsx
│   │   ├── FilterChips.tsx
│   │   ├── DateSelector.tsx   # 7-day horizontal date picker
│   │   ├── TimeSlotGrid.tsx   # 4 time-slot buttons with conflict state
│   │   ├── QRModal.tsx        # QR code display modal
│   │   ├── QRScanner.tsx      # Camera-based QR scanner
│   │   └── BookingCard.tsx    # Booking item card for My Bookings
│   ├── services/
│   │   ├── authService.ts     # Firebase Auth wrapper functions
│   │   ├── roomService.ts     # Firestore room CRUD + listeners
│   │   ├── bookingService.ts  # Firestore booking CRUD + conflict check
│   │   └── notificationService.ts # expo-notifications schedule/cancel
│   ├── utils/
│   │   └── helpers.ts         # Date formatting, ID generation, validation
│   └── constants/
│       └── index.ts           # Colors, time slots, building list, etc.
```

## Success Metrics

- Students can discover and book a room in under 60 seconds (from app open to booking confirmed)
- Zero double-booking conflicts (enforced by Firestore security rules + UI prevention)
- Time-slot availability updates within 2 seconds of another user's booking
- QR check-in completes in under 5 seconds (scan → confirmation)
- Notification reminder arrives exactly 15 minutes before slot start
- FlatList scrolling maintains 60fps with 50+ rooms loaded
- App loads and displays room list within 3 seconds on a typical 4G connection
- User session persists correctly after app kill and restart

## Open Questions

- Should we limit the number of active bookings per user (e.g., max 3 concurrent)?
- Should there be a cooldown period after cancellation to prevent abuse?
- Do we need to auto-complete bookings after the slot end time, or rely on manual check-out?
- Should the QR scanner also work for room administrators (future feature)?
- What happens if a user doesn't check in – auto-cancel after 15 minutes past slot start?
- Should room photos be stored in Firebase Storage or use external URLs?
- Do we need dark mode support for the initial release?

