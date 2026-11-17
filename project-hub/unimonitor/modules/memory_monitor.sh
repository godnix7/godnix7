#!/usr/bin/env bash

memory_monitor_print() {
  local values total used available free swap_total swap_used swap_free usage status swap_usage swap_status
  section 'MEMORY MONITORING'
  values=$(memory_values 2>/dev/null || :)
  if [[ -z "$values" ]]; then printf 'Memory information unavailable (/proc/meminfo could not be read).\n'; return; fi
  read -r total used available free swap_total swap_used swap_free <<< "$values"
  usage=$(awk -v u="$used" -v t="$total" 'BEGIN{if(t>0) printf "%.1f",100*u/t; else print "0"}')
  status=$(classify_percent "$usage" "$MEMORY_WARNING" "$MEMORY_CRITICAL")
  printf ' RAM total                  : %s\n RAM used (total - available): %s\n RAM available              : %s\n RAM free                   : %s\n RAM utilization            : %s%% [%s%s%s]\n' \
    "$(human_kib "$total")" "$(human_kib "$used")" "$(human_kib "$available")" "$(human_kib "$free")" "$usage" "$(color_status "$status")" "$status" "$C_RESET"
  if (( swap_total > 0 )); then
    swap_usage=$(awk -v u="$swap_used" -v t="$swap_total" 'BEGIN{printf "%.1f",100*u/t}')
    swap_status=$(classify_percent "$swap_usage" "$SWAP_WARNING" "$SWAP_CRITICAL")
    printf ' Swap total                 : %s\n Swap used                  : %s\n Swap free                  : %s\n Swap utilization           : %s%% [%s%s%s]\n' \
      "$(human_kib "$swap_total")" "$(human_kib "$swap_used")" "$(human_kib "$swap_free")" "$swap_usage" "$(color_status "$swap_status")" "$swap_status" "$C_RESET"
  else printf ' Swap                       : not configured\n'; fi
  [[ "$status" == HEALTHY ]] || log_event WARNING "Memory utilization is $usage% ($status)."
}
