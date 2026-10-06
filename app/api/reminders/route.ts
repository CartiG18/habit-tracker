import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";
import { parseISO } from "date-fns";
import { isHabitDue } from "@/lib/schedule";
import type { Habit, HabitLog, User } from "@/types";

// ─── Reminder Dispatch ────────────────────────────────────────────────────────
// Call every 15 minutes from a scheduler (Vercel Cron on Pro, or any external
// cron hitting GET /api/reminders) with `Authorization: Bearer $CRON_SECRET`.
// Sends:
//   • per-habit reminders at their local time (optionally only if not done yet)
//   • the user-level daily reminder from Settings ("N habits left today")
// Each fires at most once per local day (tracked on the habit / user doc).

export const dynamic = "force-dynamic";

const WINDOW_MINUTES = 15;

// Imported lazily: firebase-admin initializes on import and needs server credentials,
// which aren't present at build time (the build imports route modules).
let adminDb: FirebaseFirestore.Firestore;

/** The user's local "YYYY-MM-DD" and minutes-since-midnight right now. */
function localNow(timeZone: string): { date: string; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  return { date: `${get("year")}-${get("month")}-${get("day")}`, minutes: Number(get("hour")) * 60 + Number(get("minute")) };
}

function inWindow(now: number, hhmm: string): boolean {
  const [h, m] = hhmm.split(":").map(Number);
  const at = h * 60 + m;
  return now >= at && now < at + WINDOW_MINUTES;
}

function safeZone(tz?: string): string {
  try {
    if (tz) new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return tz || "UTC";
  } catch {
    return "UTC";
  }
}

async function doneOrSkipped(uid: string, habitId: string, date: string): Promise<boolean> {
  const snap = await adminDb.doc(`habitLogs/${uid}_${habitId}_${date}`).get();
  const log = snap.data() as HabitLog | undefined;
  return !!log && (log.completed || !!log.skipped);
}

/** Push to all of a user's devices; prune tokens FCM reports as dead. */
async function push(uid: string, user: User, title: string, body: string): Promise<boolean> {
  const tokens = user.fcmTokens ?? [];
  if (!tokens.length) return false;
  const res = await getMessaging().sendEachForMulticast({
    tokens,
    notification: { title, body },
    webpush: { fcmOptions: { link: "/dashboard" } },
  });
  const dead = res.responses
    .map((r, i) => (!r.success && /registration-token-not-registered|invalid-registration-token|invalid-argument/.test(r.error?.code ?? "") ? tokens[i] : null))
    .filter((t): t is string => !!t);
  if (dead.length) await adminDb.doc(`users/${uid}`).update({ fcmTokens: FieldValue.arrayRemove(...dead) });
  return res.successCount > 0;
}

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: "CRON_SECRET is not configured" }, { status: 500 });
  if (req.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  adminDb = (await import("@/lib/firebase-admin")).adminDb;

  const users = new Map<string, User>();
  const loadUser = async (uid: string) => {
    if (!users.has(uid)) {
      const snap = await adminDb.doc(`users/${uid}`).get();
      if (snap.exists) users.set(uid, snap.data() as User);
    }
    return users.get(uid);
  };

  let habitSent = 0;
  let dailySent = 0;

  // ─── Per-habit reminders ───────────────────────────────────────────────────
  const reminderHabits = await adminDb.collection("habits").where("reminder.enabled", "==", true).get();
  for (const doc of reminderHabits.docs) {
    const habit = { id: doc.id, ...doc.data() } as Habit;
    if (habit.archivedAt || !habit.reminder) continue;
    const user = await loadUser(habit.userId);
    if (!user) continue;

    const { date, minutes } = localNow(safeZone(user.timeZone));
    if (habit.reminder.lastSentDate === date || !inWindow(minutes, habit.reminder.time)) continue;
    if (!isHabitDue(habit, parseISO(date))) continue;
    if (habit.reminder.onlyIfNotDone && (await doneOrSkipped(habit.userId, habit.id, date))) continue;

    const body = habit.measure
      ? `Time for ${habit.name} — goal: ${habit.measure.target} ${habit.measure.unit}`.trim()
      : `Time for ${habit.name}`;
    if (await push(habit.userId, user, "Habit reminder", body)) habitSent++;
    await doc.ref.update({ "reminder.lastSentDate": date });
  }

  // ─── Daily reminder (Settings → Notifications) ─────────────────────────────
  const dailyUsers = await adminDb.collection("users").where("notificationsEnabled", "==", true).get();
  for (const doc of dailyUsers.docs) {
    const user = doc.data() as User;
    if (!user.reminderTime || !user.fcmTokens?.length) continue;
    const { date, minutes } = localNow(safeZone(user.timeZone));
    if (user.lastDailyReminderDate === date || !inWindow(minutes, user.reminderTime)) continue;

    const habits = (await adminDb.collection("habits").where("userId", "==", doc.id).get()).docs
      .map((d) => ({ id: d.id, ...d.data() } as Habit))
      .filter((h) => !h.archivedAt && isHabitDue(h, parseISO(date)));
    let left = 0;
    for (const h of habits) if (!(await doneOrSkipped(doc.id, h.id, date))) left++;

    if (left > 0 && (await push(doc.id, user, "Daily check-in", `${left} habit${left === 1 ? "" : "s"} left today`))) dailySent++;
    await doc.ref.update({ lastDailyReminderDate: date });
  }

  return NextResponse.json({ habitSent, dailySent });
}
