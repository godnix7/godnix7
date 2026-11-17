#!/usr/bin/env bash
# Website demo entry point for UniMonitor (https://github.com/godnix7/Unimonitor).
#
# Runs exactly ONE read-only, allow-listed view and exits. It never reads stdin, never takes
# user-supplied arguments beyond the operation id, and never exposes the interactive menu,
# process termination or settings editing.
set -o nounset
set -o pipefail

SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)
export NO_COLOR=1
export COLUMNS=${COLUMNS:-88}

source "$SCRIPT_DIR/utils/colors.sh"
source "$SCRIPT_DIR/utils/validation.sh"
source "$SCRIPT_DIR/utils/logger.sh"
source "$SCRIPT_DIR/utils/common.sh"
source "$SCRIPT_DIR/modules/system_info.sh"
source "$SCRIPT_DIR/modules/cpu_monitor.sh"
source "$SCRIPT_DIR/modules/memory_monitor.sh"
source "$SCRIPT_DIR/modules/disk_monitor.sh"
source "$SCRIPT_DIR/modules/process_manager.sh"
source "$SCRIPT_DIR/modules/system_health.sh"
source "$SCRIPT_DIR/modules/report_manager.sh"

load_config
init_directories 2>/dev/null || :

# The cloud sandbox lacks procps/iproute2/hostname. Where a tool is missing, use the small
# /proc-based stand-ins in demo-bin/ (shell functions, so no executable bit is needed).
for tool in ps hostname ip ss; do
  if ! command -v "$tool" >/dev/null 2>&1; then
    eval "$tool() { bash \"\$SCRIPT_DIR/demo-bin/$tool\" \"\$@\"; }"
  fi
done

case "${1:-}" in
  overview)  app_header; system_health_print ;;
  sysinfo)   system_info_print ;;
  cpu)       cpu_monitor_print ;;
  memory)    memory_monitor_print ;;
  disk)      disk_monitor_print ;;
  processes) process_top_cpu; process_top_memory ;;
  network)   section 'NETWORK OVERVIEW'; network_overview ;;
  health)    system_health_print ;;
  report)
    result=$(report_generate) || { printf '%s\n' "$result"; exit 1; }
    file=${result#Report generated: }
    [[ -f "$file" ]] && cat -- "$file" && rm -f -- "$file"
    ;;
  version)   printf 'UniMonitor 1.0\n' ;;
  help)      bash "$SCRIPT_DIR/main.sh" --help ;;
  *)         printf 'Unknown operation\n' >&2; exit 2 ;;
esac
