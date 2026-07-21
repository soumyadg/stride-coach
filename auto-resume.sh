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

# 1b) Only work when the laptop LID IS UP. If the clamshell is closed, stand down
#     (desktops / no-lid Macs have no AppleClamshellState key → treated as "up").
if ioreg -r -k AppleClamshellState -d 4 2>/dev/null | grep -q '"AppleClamshellState" = Yes'; then
  echo "$(ts) lid closed — standing down" >> "$LOG"; exit 0
fi

# 2) Never run two at once (stale lock >3h is cleared).
if [ -d "$LOCK" ]; then
  if [ -n "$(find "$LOCK" -maxdepth 0 -mmin +180 2>/dev/null)" ]; then
    rmdir "$LOCK" 2>/dev/null
  else
    echo "$(ts) lock held, skip" >> "$LOG"; exit 0
  fi
fi

# 3) CRITICAL: if a real Claude Code session is already alive (interactive or a
#    prior headless run), do nothing — we only step in once a limit has ended it.
#    Match only processes whose command STARTS with `claude` (the CLI); this
#    deliberately ignores the always-on `claude-flow` daemon and statusline
#    helpers, which run under node/npm and would otherwise pin us down forever.
if ps ax -o command= | awk '{print $1}' | grep -qE '^(.*/)?claude$'; then
  echo "$(ts) a Claude Code session is live, standing down" >> "$LOG"; exit 0
fi

mkdir "$LOCK" 2>/dev/null || { echo "$(ts) could not lock" >> "$LOG"; exit 0; }
trap 'rmdir "$LOCK" 2>/dev/null' EXIT

cd "$APP" || exit 0

# 4) PROBE — is the usage limit reset? Send one tiny message. If it answers,
#    the limit is available and we do the real work. If it hits the limit,
#    stand down quietly and let the next 30-min tick try again.
PROBE="$(claude -p "Reply with exactly: READY" --dangerously-skip-permissions 2>&1)"
if ! print -r -- "$PROBE" | grep -qi "READY"; then
  if print -r -- "$PROBE" | grep -qiE "usage limit|rate limit|limit reached|resets? (in|at)"; then
    echo "$(ts) limit still active — standing down, retry next tick" >> "$LOG"
  else
    echo "$(ts) probe inconclusive ($(print -r -- "$PROBE" | head -c 120))" >> "$LOG"
  fi
  exit 0
fi

echo "$(ts) ===== limit is reset — resuming Strivon build =====" >> "$LOG"

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
