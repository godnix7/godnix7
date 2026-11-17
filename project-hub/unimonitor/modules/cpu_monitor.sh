#!/usr/bin/env bash

cpu_monitor_print() {
  local usage loads cores model status
  section 'CPU MONITORING'
  usage=$(cpu_usage_sample 1 2>/dev/null || :)
  loads=$(cpu_load_values 2>/dev/null || :)
  cores=$(cpu_core_count 2>/dev/null || :)
  model=$(grep -m1 '^model name[[:space:]]*:' /proc/cpuinfo 2>/dev/null | sed 's/^[^:]*:[[:space:]]*//')
  [[ -n "$model" ]] || model=$(uname -p 2>/dev/null || printf 'unavailable')
  printf ' Processor          : %s\n CPU cores           : %s\n' "$model" "${cores:-unavailable}"
  if [[ "$usage" =~ ^[0-9]+([.][0-9]+)?$ ]]; then
    status=$(classify_percent "$usage" "$CPU_WARNING" "$CPU_CRITICAL")
    printf ' CPU utilization     : %s%% [%s%s%s]\n' "$usage" "$(color_status "$status")" "$status" "$C_RESET"
    [[ "$status" == HEALTHY ]] || log_event WARNING "CPU utilization is $usage% ($status)."
  else printf ' CPU utilization     : unavailable (could not read two /proc/stat samples)\n'; fi
  printf ' Load average (1/5/15): %s\n' "${loads:-unavailable}"
  printf '\nTop 5 CPU-consuming processes:\n'
  if command_exists ps; then ps -eo pid,user,pcpu,pmem,comm --sort=-pcpu 2>/dev/null | head -n 6 || printf '  Process list unavailable.\n'; else printf '  ps utility is unavailable.\n'; fi
}

cpu_monitor_menu() {
  log_event INFO 'CPU monitoring module opened.'
  while true; do
    cpu_monitor_print
    read -r -p $'\nRefresh CPU sample? [y/N]: ' answer || answer=n
    [[ "$answer" =~ ^[Yy]$ ]] || break
  done
}
