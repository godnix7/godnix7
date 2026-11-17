#!/usr/bin/env bash

LOG_MAX_BYTES=${LOG_MAX_BYTES:-1048576}

log_event() {
  local level=${1:-INFO} message=${2:-} log_file
  log_file="${LOG_DIR:-${PROJECT_ROOT:-.}/logs}/unimonitor.log"
  mkdir -p -- "${log_file%/*}" 2>/dev/null || return 0
  if [[ -f "$log_file" ]]; then
    local size
    size=$(wc -c < "$log_file" 2>/dev/null | tr -d '[:space:]' || printf '0')
    if [[ "$size" =~ ^[0-9]+$ ]] && (( size >= LOG_MAX_BYTES )); then
      mv -f -- "$log_file" "$log_file.1" 2>/dev/null || :
    fi
  fi
  printf '[%s] [%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S' 2>/dev/null || printf 'time-unavailable')" "$level" "$message" >> "$log_file" 2>/dev/null || :
}
