#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-}"
MAX_ITERATIONS="${2:-10}"

if [[ -z "$MODE" ]]; then
  echo "Usage: ./loop.sh <plan|build> [max-iterations]"
  echo ""
  echo "Modes:"
  echo "  plan   - Read specs and update IMPLEMENTATION_PLAN.md (no code changes)"
  echo "  build  - Implement one task at a time from IMPLEMENTATION_PLAN.md"
  echo ""
  echo "Options:"
  echo "  max-iterations  - Maximum iterations for build mode (default: 10)"
  echo ""
  echo "To stop the loop gracefully, create a STOP file: touch STOP"
  exit 1
fi

check_stop() {
  if [[ -f "STOP" ]]; then
    echo "🛑 STOP file detected. Exiting gracefully."
    exit 0
  fi
}

run_plan() {
  echo "📋 Running plan mode..."
  check_stop
  amp --prompt-file PROMPT_plan.md
  echo "✅ Plan complete. Review IMPLEMENTATION_PLAN.md"
}

run_build() {
  local iteration=1
  
  echo "🔨 Running build mode (max $MAX_ITERATIONS iterations)..."
  
  while [[ $iteration -le $MAX_ITERATIONS ]]; do
    check_stop
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🔄 Iteration $iteration of $MAX_ITERATIONS"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Check if there are remaining tasks
    if ! grep -q "^\- \[ \]" IMPLEMENTATION_PLAN.md 2>/dev/null; then
      echo "✅ All tasks complete!"
      exit 0
    fi
    
    # Run amp with build prompt
    amp --prompt-file PROMPT_build.md
    
    iteration=$((iteration + 1))
    
    # Brief pause between iterations
    sleep 2
  done
  
  echo ""
  echo "⚠️  Reached max iterations ($MAX_ITERATIONS). Stopping."
  echo "   Run again to continue, or increase max-iterations."
}

case "$MODE" in
  plan)
    run_plan
    ;;
  build)
    run_build
    ;;
  *)
    echo "❌ Unknown mode: $MODE"
    echo "   Use 'plan' or 'build'"
    exit 1
    ;;
esac
