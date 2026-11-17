#!/usr/bin/env bash

disk_monitor_print() {
  local rows max status
  section 'DISK MONITORING'
  rows=$(disk_rows 2>/dev/null || :)
  if [[ -z "$rows" ]]; then printf 'Disk data unavailable (df is missing or failed).\n'; return; fi
  printf '%s\n' "$rows" | awk 'NR==1 {printf "%-24s %-12s %9s %9s %9s %6s %s\n","FILESYSTEM","TYPE","SIZE","USED","AVAIL","USE%","MOUNT"; next} {printf "%-24.24s %-12.12s %9s %9s %9s %6s %s\n",$1,$2,$3,$4,$5,$6,$7}'
  max=$(disk_max_percent 2>/dev/null || :)
  if [[ "$max" =~ ^[0-9]+$ ]]; then
    status=$(classify_percent "$max" "$DISK_WARNING" "$DISK_CRITICAL")
    printf '\nHighest mounted filesystem usage: %s%% [%s%s%s]\n' "$max" "$(color_status "$status")" "$status" "$C_RESET"
  else printf '\nFilesystem usage summary unavailable.\n'; fi
  if command_exists lsblk; then printf '\nBlock devices:\n'; lsblk -o NAME,SIZE,TYPE,FSTYPE,MOUNTPOINTS 2>/dev/null || lsblk 2>/dev/null || printf '  Block device listing unavailable.\n'; else printf '\nlsblk is unavailable; block device listing omitted.\n'; fi
  if command_exists findmnt; then printf '\nMounted filesystem sources (findmnt):\n'; findmnt -rn -o SOURCE,TARGET,FSTYPE 2>/dev/null | head -n 20 || printf '  Mount details unavailable.\n'; fi
}

disk_directory_size() {
  local path
  read -r -p 'Directory path to inspect: ' path || return
  if [[ -z "$path" || ! -d "$path" ]]; then printf '%s\n' 'That directory does not exist or the path is empty.'; return; fi
  if ! command_exists du; then printf '%s\n' 'du utility is unavailable.'; return; fi
  du -sh -- "$path" 2>&1 || printf 'Could not read all files; permission errors are shown above.\n'
}

disk_monitor_menu() {
  while true; do
    disk_monitor_print
    printf '\n [1] Inspect directory size   [0] Return\n'
    read -r -p 'Select: ' choice || choice=0
    case "$choice" in 1) disk_directory_size; pause_screen ;; 0|'') break ;; *) printf 'Invalid selection.\n'; pause_screen ;; esac
    [[ "$choice" == 0 || -z "$choice" ]] && break
  done
}
