#!/bin/zsh
# Strivon autonomous-build resume watchdog.
# Installed in crontab; fires on a schedule. If a usage-limit killed the live
# Claude session, this relaunches Claude headless to continue the 10/10 roadmap
# from STATE.md. Self-guards so it NEVER overlaps an already-running session.
#
# STOP it any time:  touch ~/Desktop/apps/stride-coach/.autoresume-stop
# Remove entirely:   crontab -e  (delete the strivon line)

APP="$HOME/Desktop/apps/stride-coach"
LOG="$APP/auto-resume.log"
STOP="$APP/.autoresume-stop"
LOCK="$APP/.autoresume.lock"

export PATH="$HOME/.local/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin"

ts() { date "+%Y-%m-%d %H:%M:%S %Z"; }

# 1) Honour the manual stop flag.
[ -f "$STOP" ] && { echo "$(ts) stop-flag present, exiting" >> "$LOG"; exit 0; }

# 2) Never run two at once (stale lock >3h is cleared).
if [ -d "$LOCK" ]; then
  if [ -n "$(find "$LOCK" -maxdepth 0 -mmin +180 2>/dev/null)" ]; then
    rmdir "$LOCK" 2>/dev/null
  else
    echo "$(ts) lock held, skip" >> "$LOG"; exit 0
  fi
fi

# 3) CRITICAL: if any Claude session is already alive (interactive or a prior
#    headless run), do nothing — we only step in once a limit has ended it.
if pgrep -f "[c]laude" >/dev/null 2>&1; then
  echo "$(ts) a claude session is live, standing down" >> "$LOG"; exit 0
fi

mkdir "$LOCK" 2>/dev/null || { echo "$(ts) could not lock" >> "$LOG"; exit 0; }
trap 'rmdir "$LOCK" 2>/dev/null' EXIT

cd "$APP" || exit 0
echo "$(ts) ===== resuming Strivon build (no live session detected) =====" >> "$LOG"

read -r -d '' PROMPT <<'EOP'
You are resuming the autonomous Strivon build after a usage-limit reset.
1. Read STATE.md — the "GAP-TO-10/10 ROADMAP" section is your worklist.
2. Pick the next unchecked, code-buildable item (skip items gated on Soumya's
   hardware/Apple-Developer-account/real-users — mark those [BLOCKED-on-Soumya]).
3. Implement it fully: edit code, run any checks, commit with the
   name="Soumya Dasgupta" email="soumya.england@gmail.com" identity, push, and
   deploy the web with ./cf-deploy.sh where relevant.
4. Update STATE.md: tick the item and note what shipped.
5. Do ONE item per run, then stop. If every code-buildable item is done, run
   `touch .autoresume-stop` and write "ALL BUILDABLE DONE" into STATE.md.
Be decisive and autonomous — do not ask questions. Keep the app in ~/Desktop/apps/stride-coach; never touch the mothballed trading system.
EOP

claude -p "$PROMPT" --dangerously-skip-permissions >> "$LOG" 2>&1
echo "$(ts) ===== run finished =====" >> "$LOG"
