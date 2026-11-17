#!/usr/bin/env bash

system_info_print() {
  local distro kernel host arch user now uptime_text processors shell_name distro_id distro_version
  distro=$(. /etc/os-release 2>/dev/null; printf '%s' "${PRETTY_NAME:-Linux distribution information unavailable}")
  distro_id=$(. /etc/os-release 2>/dev/null; printf '%s' "${ID:-unknown}")
  distro_version=$(. /etc/os-release 2>/dev/null; printf '%s' "${VERSION_ID:-unknown}")
  kernel=$(uname -sr 2>/dev/null || printf 'unavailable')
  host=$(hostname 2>/dev/null || printf 'unavailable')
  arch=$(uname -m 2>/dev/null || printf 'unavailable')
  user=$(whoami 2>/dev/null || printf 'unavailable')
  now=$(date '+%Y-%m-%d %H:%M:%S %Z' 2>/dev/null || printf 'unavailable')
  uptime_text=$(uptime -p 2>/dev/null || awk '{printf "%d days, %d hours, %d minutes",$1/86400,($1%86400)/3600,($1%3600)/60}' /proc/uptime 2>/dev/null || printf 'unavailable')
  processors=$(cpu_core_count); processors=${processors:-unavailable}
  shell_name=${BASH:-${SHELL:-unknown}}
  section 'SYSTEM INFORMATION'
  printf ' Distribution        : %s\n Distribution ID     : %s\n Distribution version: %s\n Kernel              : %s\n Hostname            : %s\n Architecture        : %s\n Current user        : %s\n Date and time       : %s\n Uptime              : %s\n Available CPUs      : %s\n Login shell         : %s\n' \
    "$distro" "$distro_id" "$distro_version" "$kernel" "$host" "$arch" "$user" "$now" "$uptime_text" "$processors" "$shell_name"
}
