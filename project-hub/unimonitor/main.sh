#!/usr/bin/env bash
set -o nounset
set -o pipefail

SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)
source "$SCRIPT_DIR/utils/colors.sh"
source "$SCRIPT_DIR/utils/validation.sh"
source "$SCRIPT_DIR/utils/logger.sh"
source "$SCRIPT_DIR/utils/common.sh"
source "$SCRIPT_DIR/modules/system_info.sh"
source "$SCRIPT_DIR/modules/cpu_monitor.sh"
source "$SCRIPT_DIR/modules/memory_monitor.sh"
source "$SCRIPT_DIR/modules/disk_monitor.sh"
source "$SCRIPT_DIR/modules/process_manager.sh"
source "$SCRIPT_DIR/modules/network_diagnostics.sh"
source "$SCRIPT_DIR/modules/system_health.sh"
source "$SCRIPT_DIR/modules/report_manager.sh"
source "$SCRIPT_DIR/modules/settings.sh"

load_config
init_directories || printf 'Warning: could not create report/log directories. Some features may be unavailable.\n' >&2

dashboard() {
  local cpu memory_values_text total used available free swap_total swap_used swap_free mem_pct disk_pct loads cores status mem_status disk_status host os
  app_header
  section 'LIVE SYSTEM OVERVIEW'
  cpu=$(cpu_usage_sample 1 2>/dev/null || printf 'N/A')
  memory_values_text=$(memory_values 2>/dev/null || :)
  if [[ -n "$memory_values_text" ]]; then
    read -r total used available free swap_total swap_used swap_free <<< "$memory_values_text"
    mem_pct=$(awk -v u="$used" -v t="$total" 'BEGIN{if(t>0) printf "%.0f",100*u/t; else print "0"}')
  else mem_pct=N/A; fi
  disk_pct=$(disk_max_percent 2>/dev/null || printf 'N/A')
  loads=$(cpu_load_values 2>/dev/null || printf 'unavailable')
  cores=$(cpu_core_count 2>/dev/null || printf '?')
  host=$(hostname 2>/dev/null || printf 'unknown')
  os=$(. /etc/os-release 2>/dev/null; printf '%s' "${PRETTY_NAME:-Linux}")
  status=$(classify_percent "$cpu" "$CPU_WARNING" "$CPU_CRITICAL")
  mem_status=$(classify_percent "$mem_pct" "$MEMORY_WARNING" "$MEMORY_CRITICAL")
  disk_status=$(classify_percent "$disk_pct" "$DISK_WARNING" "$DISK_CRITICAL")
  printf ' Host: %s  |  OS: %s\n' "$host" "$os"
  local cpu_display=$cpu mem_display=$mem_pct disk_display=$disk_pct
  [[ "$cpu_display" == N/A ]] || cpu_display+='%'
  [[ "$mem_display" == N/A ]] || mem_display+='%'
  [[ "$disk_display" == N/A ]] || disk_display+='%'
  printf ' CPU usage: %s [%s%s%s]   Memory: %s [%s%s%s]   Disk max: %s [%s%s%s]\n' \
    "$cpu_display" "$(color_status "$status")" "$status" "$C_RESET" \
    "$mem_display" "$(color_status "$mem_status")" "$mem_status" "$C_RESET" \
    "$disk_display" "$(color_status "$disk_status")" "$disk_status" "$C_RESET"
  printf ' Load average (1/5/15): %s  |  CPU cores: %s\n' "$loads" "$cores"
  printf '\nMAIN MENU\n'
  printf ' [1] System information      [2] CPU monitoring\n [3] Memory monitoring       [4] Disk monitoring\n [5] Process management      [6] Network diagnostics\n [7] System health analysis  [8] Reports and history\n [9] Application settings    [0] Exit\n'
}

print_help() {
  cat <<'HELP'
UniMonitor - Linux system monitoring and diagnostics

Usage:
  ./main.sh             Open the interactive dashboard
  ./main.sh --report    Generate a complete report and exit
  ./main.sh --version   Print the version
  ./main.sh --help      Show this help

Set NO_COLOR=1 to disable terminal colors. Configuration is read from
config/settings.conf, or from the path in UNIMONITOR_CONFIG.
HELP
}

case "${1:-}" in
  --help|-h) print_help; exit 0 ;;
  --version|-V) printf 'UniMonitor 1.0\n'; exit 0 ;;
  --report) log_event INFO 'Command-line report generation requested.'; report_generate; exit $? ;;
  '') ;;
  *) printf 'Unknown option: %s\n\n' "$1" >&2; print_help >&2; exit 2 ;;
esac

log_event INFO 'Application started.'
trap 'log_event INFO "Application stopped (exit status $?)."' EXIT
trap 'printf "\nInterrupted.\n"; exit 130' INT TERM

while true; do
  dashboard
  read -r -p $'\nSelect an option: ' choice || choice=0
  case "$choice" in
    1) log_event INFO 'System information module opened.'; system_info_print; pause_screen ;;
    2) cpu_monitor_menu ;;
    3) log_event INFO 'Memory monitoring module opened.'; memory_monitor_print; pause_screen ;;
    4) log_event INFO 'Disk monitoring module opened.'; disk_monitor_menu ;;
    5) process_manager_menu ;;
    6) network_diagnostics_menu ;;
    7) log_event INFO 'System health analysis opened.'; system_health_print; pause_screen ;;
    8) report_menu ;;
    9) settings_menu ;;
    0|'') break ;;
    *) printf '\nInvalid selection. Choose a number from 0 to 9.\n'; pause_screen ;;
  esac
done

printf '\nUniMonitor closed.\n'
