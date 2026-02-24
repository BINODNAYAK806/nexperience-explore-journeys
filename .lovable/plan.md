

## Problem

When you switch to another browser tab and come back, the dashboard reloads and resets to the "Leads" tab. This happens because of **two issues working together**:

1. **ProtectedRoute unmounts the Dashboard**: The `ProtectedRoute` component listens for Supabase auth state changes. When you return to the tab, Supabase's client fires an auth event (token refresh). The ProtectedRoute sets `loading = true` on every auth event, which unmounts the entire Dashboard and shows "Loading..." temporarily.

2. **Dashboard state resets on remount**: When the Dashboard unmounts and remounts, all its state (including `activeTab`) resets to the default value `"leads"`.

## Fix

### 1. ProtectedRoute.tsx -- Stop resetting loading after initial auth check

Add a `hasChecked` ref so that after the first successful auth check, subsequent auth events (like token refreshes when returning to the tab) update the admin status quietly **without** unmounting the Dashboard.

- Add `useRef` to track whether the initial auth check is complete
- After the first check, skip setting `loading = true` on subsequent `onAuthStateChange` events
- This prevents the Dashboard from being unmounted and remounted

### 2. Dashboard.tsx -- Stabilize fetchLeads dependencies

The `fetchLeads` callback currently depends on `startDate`, `endDate`, and `toast`, causing it to be recreated frequently. This triggers the `useEffect` to re-run and re-fetch data unnecessarily.

- Move `startDate`/`endDate` reads inside the function body using refs, or remove them from the dependency array
- Use `useRef` for toast to keep the callback stable
- This prevents unnecessary data refetches that can cause flickering

---

**Summary of changes:**
- `src/components/ProtectedRoute.tsx` -- Add a ref to prevent re-showing the loading screen on token refresh events
- `src/pages/Dashboard.tsx` -- Stabilize the `fetchLeads` callback to prevent unnecessary re-renders

