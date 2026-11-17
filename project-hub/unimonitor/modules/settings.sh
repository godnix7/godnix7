#!/usr/bin/env bash

settings_show() {
  section 'APPLICATION SETTINGS'
  printf ' CPU warning/critical     : %s%% / %s%%\n Memory warning/critical  : %s%% / %s%%\n Disk warning/critical    : %s%% / %s%%\n Swap warning/critical    : %s%% / %s%%\n Report directory         : %s\n Log directory            : %s\n Configuration file       : %s\n' \
    "$CPU_WARNING" "$CPU_CRITICAL" "$MEMORY_WARNING" "$MEMORY_CRITICAL" "$DISK_WARNING" "$DISK_CRITICAL" "$SWAP_WARNING" "$SWAP_CRITICAL" "$REPORT_DIR" "$LOG_DIR" "$CONFIG_FILE"
}

settings_save() {
  local temp
  mkdir -p -- "${CONFIG_FILE%/*}" 2>/dev/null || return 1
  temp=$(mktemp "${CONFIG_FILE}.XXXXXX" 2>/dev/null) || return 1
  {
    printf '# UniMonitor settings. Values are parsed as data, never sourced as shell code.\n'
    printf 'CPU_WARNING=%s\nCPU_CRITICAL=%s\nMEMORY_WARNING=%s\nMEMORY_CRITICAL=%s\nDISK_WARNING=%s\nDISK_CRITICAL=%s\nSWAP_WARNING=%s\nSWAP_CRITICAL=%s\n' \
      "$CPU_WARNING" "$CPU_CRITICAL" "$MEMORY_WARNING" "$MEMORY_CRITICAL" "$DISK_WARNING" "$DISK_CRITICAL" "$SWAP_WARNING" "$SWAP_CRITICAL"
    printf 'REPORT_DIR=%s\nLOG_DIR=%s\n' "$REPORT_DIR" "$LOG_DIR"
  } > "$temp" || { rm -f -- "$temp"; return 1; }
  chmod 600 "$temp" 2>/dev/null || :
  mv -f -- "$temp" "$CONFIG_FILE"
}

settings_edit_threshold() {
  local key=$1 value warn_key crit_key
  read -r -p "New value for $key (0–100): " value || return
  if ! is_valid_threshold "$value"; then printf 'Enter a whole number from 0 to 100.\n'; return; fi
  case "$key" in
    CPU_WARNING|CPU_CRITICAL) warn_key=CPU_WARNING; crit_key=CPU_CRITICAL ;;
    MEMORY_WARNING|MEMORY_CRITICAL) warn_key=MEMORY_WARNING; crit_key=MEMORY_CRITICAL ;;
    DISK_WARNING|DISK_CRITICAL) warn_key=DISK_WARNING; crit_key=DISK_CRITICAL ;;
    SWAP_WARNING|SWAP_CRITICAL) warn_key=SWAP_WARNING; crit_key=SWAP_CRITICAL ;;
    *) return 1 ;;
  esac
  local other=${!warn_key}
  [[ "$key" == "$warn_key" ]] && other=${!crit_key}
  if [[ "$key" == "$warn_key" ]] && (( 10#$value >= other )); then printf '%s must be lower than %s (%s).\n' "$key" "$crit_key" "$other"; return; fi
  if [[ "$key" == "$crit_key" ]] && (( 10#$value <= other )); then printf '%s must be higher than %s (%s).\n' "$key" "$warn_key" "$other"; return; fi
  printf -v "$key" '%s' "$((10#$value))"
  settings_save && log_event INFO "Configuration changed: $key=$value" && printf 'Setting saved.\n' || printf 'Could not save configuration.\n'
}

settings_edit_directory() {
  local key=$1 value
  read -r -p "New $key path (absolute or project-relative): " value || return
  if ! is_safe_directory_value "$value"; then printf 'Path is empty or contains unsupported characters.\n'; return; fi
  if [[ "$value" != /* ]]; then value="$PROJECT_ROOT/$value"; fi
  printf -v "$key" '%s' "$value"
  if settings_save && mkdir -p -- "$value" 2>/dev/null; then log_event INFO "Configuration changed: $key=$value"; printf 'Directory saved.\n'; else printf 'Could not save or create the directory.\n'; fi
}

settings_menu() {
  log_event INFO 'Application settings opened.'
  while true; do
    settings_show
    printf '\n [1] CPU thresholds  [2] Memory thresholds  [3] Disk thresholds  [4] Swap thresholds\n [5] Report directory  [6] Log directory  [0] Return\n'
    read -r -p 'Select: ' choice || choice=0
    case "$choice" in
      1) settings_edit_threshold CPU_WARNING; settings_edit_threshold CPU_CRITICAL ;;
      2) settings_edit_threshold MEMORY_WARNING; settings_edit_threshold MEMORY_CRITICAL ;;
      3) settings_edit_threshold DISK_WARNING; settings_edit_threshold DISK_CRITICAL ;;
      4) settings_edit_threshold SWAP_WARNING; settings_edit_threshold SWAP_CRITICAL ;;
      5) settings_edit_directory REPORT_DIR ;;
      6) settings_edit_directory LOG_DIR ;;
      0|'') break ;;
      *) printf 'Invalid selection.\n' ;;
    esac
    [[ "$choice" == 0 || -z "$choice" ]] || pause_screen
  done
}
