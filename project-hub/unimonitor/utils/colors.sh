#!/usr/bin/env bash
# Terminal colors are disabled automatically when output is redirected.
if [[ -t 1 && "${NO_COLOR:-}" == "" ]]; then
  C_RESET=$'\033[0m'; C_BOLD=$'\033[1m'; C_RED=$'\033[31m'
  C_GREEN=$'\033[32m'; C_YELLOW=$'\033[33m'; C_BLUE=$'\033[34m'
  C_CYAN=$'\033[36m'; C_WHITE=$'\033[97m'
else
  C_RESET=''; C_BOLD=''; C_RED=''; C_GREEN=''; C_YELLOW=''
  C_BLUE=''; C_CYAN=''; C_WHITE=''
fi

color_status() {
  case "${1:-UNKNOWN}" in
    HEALTHY|NORMAL|OK) printf '%s' "$C_GREEN" ;;
    WARNING) printf '%s' "$C_YELLOW" ;;
    CRITICAL|ERROR) printf '%s' "$C_RED" ;;
    *) printf '%s' "$C_CYAN" ;;
  esac
}
