#!/usr/bin/env bash

report_generate() {
  local stamp outfile tmp
  local C_RESET='' C_BOLD='' C_RED='' C_GREEN='' C_YELLOW='' C_BLUE='' C_CYAN='' C_WHITE=''
  if ! mkdir -p -- "$REPORT_DIR" 2>/dev/null || [[ ! -w "$REPORT_DIR" ]]; then
    printf 'Cannot write to report directory: %s\n' "$REPORT_DIR"; log_event ERROR "Cannot write report directory: $REPORT_DIR"; return 1
  fi
  umask 077
  stamp=$(date '+%Y-%m-%d_%H%M%S' 2>/dev/null || printf 'unknown-time')
  outfile="$REPORT_DIR/unimonitor_report_${stamp}.txt"
  while [[ -e "$outfile" ]]; do outfile="$REPORT_DIR/unimonitor_report_${stamp}_$RANDOM.txt"; done
  tmp=$(mktemp "$REPORT_DIR/.unimonitor_report.XXXXXX" 2>/dev/null) || { printf 'Could not create a temporary report file.\n'; return 1; }
  {
    printf 'UNIMONITOR SYSTEM REPORT\nGenerated: %s\nHost: %s\n' "$(date '+%Y-%m-%d %H:%M:%S %Z' 2>/dev/null || printf unavailable)" "$(hostname 2>/dev/null || printf unavailable)"
    system_info_print
    cpu_monitor_print
    memory_monitor_print
    disk_monitor_print
    process_top_cpu
    process_top_memory
    network_overview
    system_health_print
    printf '\nEND OF REPORT\n'
  } > "$tmp" 2>&1 || { rm -f -- "$tmp"; printf 'Report collection failed.\n'; return 1; }
  if tee "$outfile" < "$tmp" >/dev/null; then
    rm -f -- "$tmp"
    printf 'Report generated: %s\n' "$outfile"
    log_event INFO "Report generated successfully: $outfile"
  else
    rm -f -- "$tmp" "$outfile"; printf 'Could not save report. Check directory permissions and available space.\n'; log_event ERROR 'Report write failed.'; return 1
  fi
}

report_history_menu() {
  local files=() selection index file confirmation
  shopt -s nullglob
  files=("$REPORT_DIR"/unimonitor_report_*.txt)
  shopt -u nullglob
  if ((${#files[@]} == 0)); then printf 'No saved reports in %s.\n' "$REPORT_DIR"; return; fi
  printf '\nSaved reports:\n'
  for index in "${!files[@]}"; do printf ' [%d] %s\n' "$((index+1))" "${files[$index]##*/}"; done
  printf ' [0] Return\n'
  read -r -p 'Select a report number to view: ' selection || selection=0
  [[ "$selection" == 0 || -z "$selection" ]] && return
  if ! is_uint "$selection" || (( 10#$selection < 1 || 10#$selection > ${#files[@]} )); then printf 'Invalid report number.\n'; return; fi
  file=${files[$((10#$selection-1))]}
  printf '\n'; cat -- "$file" 2>&1 || printf 'Could not read report.\n'
  printf '\n [d] Delete this report   [Enter] Return\n'
  read -r -p 'Choice: ' confirmation || confirmation=''
  if [[ "$confirmation" =~ ^[Dd]$ ]]; then
    read -r -p "Type yes to delete ${file##*/}: " confirmation || confirmation=no
    if [[ "$confirmation" == yes ]]; then rm -f -- "$file" && printf 'Report deleted.\n' && log_event INFO "Report deleted: ${file##*/}"; else printf 'Deletion cancelled.\n'; fi
  fi
}

report_menu() {
  while true; do
    section 'REPORTS'
    printf ' [1] Generate current system report\n [2] View report history / delete a report\n [0] Return\n'
    read -r -p 'Select: ' choice || choice=0
    case "$choice" in
      1) report_generate ;;
      2) report_history_menu ;;
      0|'') break ;;
      *) printf 'Invalid selection. Choose 0–2.\n' ;;
    esac
    [[ "$choice" == 0 || -z "$choice" ]] || pause_screen
  done
}
