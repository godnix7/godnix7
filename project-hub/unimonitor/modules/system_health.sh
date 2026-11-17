#!/usr/bin/env bash

HEALTH_OVERALL=UNKNOWN
HEALTH_CPU=UNKNOWN HEALTH_MEMORY=UNKNOWN HEALTH_DISK=UNKNOWN HEALTH_SWAP=UNKNOWN HEALTH_LOAD=UNKNOWN HEALTH_TOOLS=HEALTHY
HEALTH_CPU_VALUE=unavailable HEALTH_MEMORY_VALUE=unavailable HEALTH_DISK_VALUE=unavailable HEALTH_SWAP_VALUE=unavailable HEALTH_LOAD_VALUE=unavailable
HEALTH_RECOMMENDATIONS=()

health_include_status() {
  case "${1:-UNKNOWN}" in
    CRITICAL) HEALTH_OVERALL=CRITICAL ;;
    WARNING) [[ "$HEALTH_OVERALL" == CRITICAL ]] || HEALTH_OVERALL=WARNING ;;
    HEALTHY) [[ "$HEALTH_OVERALL" == UNKNOWN ]] && HEALTH_OVERALL=HEALTHY ;;
  esac
}

health_analyze() {
  local value values total used available free swap_total swap_used swap_free loads load1 cores threshold
  HEALTH_OVERALL=UNKNOWN; HEALTH_RECOMMENDATIONS=()
  HEALTH_CPU=UNKNOWN HEALTH_MEMORY=UNKNOWN HEALTH_DISK=UNKNOWN HEALTH_SWAP=UNKNOWN HEALTH_LOAD=UNKNOWN HEALTH_TOOLS=HEALTHY
  HEALTH_CPU_VALUE=unavailable HEALTH_MEMORY_VALUE=unavailable HEALTH_DISK_VALUE=unavailable HEALTH_SWAP_VALUE=unavailable HEALTH_LOAD_VALUE=unavailable

  value=$(cpu_usage_sample 1 2>/dev/null || :)
  if [[ "$value" =~ ^[0-9]+([.][0-9]+)?$ ]]; then
    HEALTH_CPU_VALUE="$value%"; HEALTH_CPU=$(classify_percent "$value" "$CPU_WARNING" "$CPU_CRITICAL"); health_include_status "$HEALTH_CPU"
    [[ "$HEALTH_CPU" == HEALTHY ]] || HEALTH_RECOMMENDATIONS+=("CPU utilization is $HEALTH_CPU_VALUE; review CPU-intensive processes.")
  else HEALTH_CPU='N/A'; HEALTH_RECOMMENDATIONS+=("CPU utilization could not be measured from /proc/stat."); fi

  values=$(memory_values 2>/dev/null || :)
  if [[ -n "$values" ]]; then
    read -r total used available free swap_total swap_used swap_free <<< "$values"
    value=$(awk -v u="$used" -v t="$total" 'BEGIN{if(t>0) printf "%.1f",100*u/t; else exit 1}')
    if [[ "$value" =~ ^[0-9]+([.][0-9]+)?$ ]]; then
      HEALTH_MEMORY_VALUE="$value%"; HEALTH_MEMORY=$(classify_percent "$value" "$MEMORY_WARNING" "$MEMORY_CRITICAL"); health_include_status "$HEALTH_MEMORY"
      [[ "$HEALTH_MEMORY" == HEALTHY ]] || HEALTH_RECOMMENDATIONS+=("Memory utilization is $HEALTH_MEMORY_VALUE; inspect memory-consuming processes and close unused applications.")
    else HEALTH_MEMORY='N/A'; fi
    if (( swap_total > 0 )); then
      value=$(awk -v u="$swap_used" -v t="$swap_total" 'BEGIN{printf "%.1f",100*u/t}')
      HEALTH_SWAP_VALUE="$value%"; HEALTH_SWAP=$(classify_percent "$value" "$SWAP_WARNING" "$SWAP_CRITICAL"); health_include_status "$HEALTH_SWAP"
      [[ "$HEALTH_SWAP" == HEALTHY ]] || HEALTH_RECOMMENDATIONS+=("Swap utilization is $HEALTH_SWAP_VALUE; check for memory pressure.")
    else HEALTH_SWAP='N/A'; HEALTH_SWAP_VALUE='not configured'; fi
  else HEALTH_MEMORY='N/A'; HEALTH_SWAP='N/A'; HEALTH_RECOMMENDATIONS+=("Memory and swap utilization could not be read from /proc/meminfo."); fi

  value=$(disk_max_percent 2>/dev/null || :)
  if [[ "$value" =~ ^[0-9]+$ ]]; then
    HEALTH_DISK_VALUE="$value%"; HEALTH_DISK=$(classify_percent "$value" "$DISK_WARNING" "$DISK_CRITICAL"); health_include_status "$HEALTH_DISK"
    [[ "$HEALTH_DISK" == HEALTHY ]] || HEALTH_RECOMMENDATIONS+=("A mounted filesystem is $HEALTH_DISK_VALUE full; inspect large files or expand storage.")
  else HEALTH_DISK='N/A'; HEALTH_RECOMMENDATIONS+=("Mounted filesystem usage could not be measured."); fi

  loads=$(cpu_load_values 2>/dev/null || :); cores=$(cpu_core_count 2>/dev/null || :); load1=${loads%% *}
  if [[ "$load1" =~ ^[0-9]+([.][0-9]+)?$ && "$cores" =~ ^[0-9]+$ ]] && (( cores > 0 )); then
    HEALTH_LOAD_VALUE="$loads (cores: $cores)"
    threshold=$(awk -v l="$load1" -v c="$cores" 'BEGIN{if(l>=2*c) print "CRITICAL"; else if(l>c) print "WARNING"; else print "HEALTHY"}')
    HEALTH_LOAD="$threshold"; health_include_status "$HEALTH_LOAD"
    [[ "$HEALTH_LOAD" == HEALTHY ]] || HEALTH_RECOMMENDATIONS+=("One-minute load ($load1) exceeds the available core count ($cores).")
  else HEALTH_LOAD='N/A'; fi

  local missing=() cmd
  for cmd in awk grep sed ps df; do command_exists "$cmd" || missing+=("$cmd"); done
  if ((${#missing[@]})); then
    HEALTH_TOOLS=WARNING; health_include_status WARNING
    HEALTH_RECOMMENDATIONS+=("Required utilities unavailable: ${missing[*]}.")
  fi
}

system_health_print() {
  health_analyze
  section 'SYSTEM HEALTH ANALYSIS'
  printf ' CPU status      : %-9s %s\n Memory status   : %-9s %s\n Disk status     : %-9s %s\n Swap status     : %-9s %s\n Load status     : %-9s %s\n Utility status  : %-9s\n' \
    "$HEALTH_CPU" "$HEALTH_CPU_VALUE" "$HEALTH_MEMORY" "$HEALTH_MEMORY_VALUE" "$HEALTH_DISK" "$HEALTH_DISK_VALUE" "$HEALTH_SWAP" "$HEALTH_SWAP_VALUE" "$HEALTH_LOAD" "$HEALTH_LOAD_VALUE" "$HEALTH_TOOLS"
  printf '\n Overall status  : %s%s%s\n' "$(color_status "$HEALTH_OVERALL")" "$HEALTH_OVERALL" "$C_RESET"
  printf '\nRecommendations:\n'
  if ((${#HEALTH_RECOMMENDATIONS[@]})); then local item; for item in "${HEALTH_RECOMMENDATIONS[@]}"; do printf ' - %s\n' "$item"; done; else printf ' - No action indicated by the available measurements.\n'; fi
  [[ "$HEALTH_OVERALL" == HEALTHY ]] || log_event "${HEALTH_OVERALL/WARNING/WARNING}" "System health analysis: $HEALTH_OVERALL."
}
