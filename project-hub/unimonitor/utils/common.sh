#!/usr/bin/env bash

PROJECT_ROOT=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd -P)
CONFIG_FILE=${UNIMONITOR_CONFIG:-"$PROJECT_ROOT/config/settings.conf"}

CPU_WARNING=70 CPU_CRITICAL=90
MEMORY_WARNING=75 MEMORY_CRITICAL=90
DISK_WARNING=80 DISK_CRITICAL=95
SWAP_WARNING=70 SWAP_CRITICAL=90
REPORT_DIR="$PROJECT_ROOT/reports" LOG_DIR="$PROJECT_ROOT/logs"

command_exists() { command -v -- "$1" >/dev/null 2>&1; }

load_config() {
  local key value line
  [[ -r "$CONFIG_FILE" ]] || return 0
  while IFS= read -r line || [[ -n "$line" ]]; do
    [[ "$line" =~ ^[[:space:]]*# || "$line" =~ ^[[:space:]]*$ ]] && continue
    [[ "$line" == *=* ]] || continue
    key=${line%%=*}; value=${line#*=}
    key=${key//[[:space:]]/}; value=${value%$'\r'}
    case "$key" in
      CPU_WARNING|CPU_CRITICAL|MEMORY_WARNING|MEMORY_CRITICAL|DISK_WARNING|DISK_CRITICAL|SWAP_WARNING|SWAP_CRITICAL)
        if is_valid_threshold "$value"; then printf -v "$key" '%s' "$((10#$value))"; else log_event WARNING "Invalid $key in configuration; using default."; fi ;;
      REPORT_DIR|LOG_DIR)
        if is_safe_directory_value "$value"; then
          if [[ "$value" == /* ]]; then printf -v "$key" '%s' "$value"; else printf -v "$key" '%s' "$PROJECT_ROOT/$value"; fi
        else log_event WARNING "Invalid $key in configuration; using default."; fi ;;
      *) log_event WARNING "Unknown configuration key ignored: $key" ;;
    esac
  done < "$CONFIG_FILE"
  local pair
  for pair in CPU MEMORY DISK SWAP; do
    local warn_key="${pair}_WARNING" crit_key="${pair}_CRITICAL"
    if (( ${!warn_key} >= ${!crit_key} )); then
      log_event WARNING "$warn_key must be lower than $crit_key; restoring defaults."
      case "$pair" in
        CPU) CPU_WARNING=70; CPU_CRITICAL=90 ;;
        MEMORY) MEMORY_WARNING=75; MEMORY_CRITICAL=90 ;;
        DISK) DISK_WARNING=80; DISK_CRITICAL=95 ;;
        SWAP) SWAP_WARNING=70; SWAP_CRITICAL=90 ;;
      esac
    fi
  done
}

init_directories() { mkdir -p -- "$REPORT_DIR" "$LOG_DIR" 2>/dev/null; }

hr() {
  local width=${COLUMNS:-80}
  (( width > 100 )) && width=100
  (( width < 40 )) && width=40
  printf '%*s\n' "$width" '' | tr ' ' '-'
}

section() { printf '\n%s%s%s\n' "$C_CYAN" "$1" "$C_RESET"; hr; }

app_header() {
  local host os uptime_text identity width=${COLUMNS:-80} title='UNIMONITOR v1.0' subtitle='LINUX SYSTEM MONITORING TOOLKIT' left right
  (( width > 100 )) && width=100
  (( width < 48 )) && width=48
  host=$(hostname 2>/dev/null || printf 'unknown')
  os=$(. /etc/os-release 2>/dev/null; printf '%s' "${PRETTY_NAME:-Linux}")
  uptime_text=$(uptime -p 2>/dev/null || awk '{print int($1/3600) "h " int(($1%3600)/60) "m"}' /proc/uptime 2>/dev/null || printf 'unavailable')
  left=$(((width-2-${#title})/2)); right=$((width-2-${#title}-left))
  printf '%s+%s+%s\n' "$C_BLUE" "$(printf '%*s' "$((width-2))" '' | tr ' ' '-')" "$C_RESET"
  printf '%s|%*s%s%s%s%*s|%s\n' "$C_BLUE" "$left" '' "$C_BOLD" "$title" "$C_RESET$C_BLUE" "$right" '' "$C_RESET"
  left=$(((width-2-${#subtitle})/2)); right=$((width-2-${#subtitle}-left))
  printf '%s|%*s%s%*s|%s\n' "$C_BLUE" "$left" '' "$subtitle" "$right" '' "$C_RESET"
  identity="$(whoami 2>/dev/null || printf user) @ $host  |  $os  |  $uptime_text"
  printf '%s| %-*.*s|%s\n' "$C_BLUE" "$((width-3))" "$((width-3))" "$identity" "$C_RESET"
  printf '%s+%s+%s\n' "$C_BLUE" "$(printf '%*s' "$((width-2))" '' | tr ' ' '-')" "$C_RESET"
}

pause_screen() { printf '\n'; read -r -p 'Press Enter to continue...' _ || :; }

human_kib() {
  awk -v k="${1:-0}" 'BEGIN { if (k+0>=1048576) printf "%.2f GiB",k/1048576; else if(k+0>=1024) printf "%.1f MiB",k/1024; else printf "%.0f KiB",k }'
}

classify_percent() {
  local value=${1:-} warning=$2 critical=$3
  [[ "$value" =~ ^[0-9]+([.][0-9]+)?$ ]] || { printf 'UNKNOWN'; return; }
  awk -v v="$value" -v w="$warning" -v c="$critical" 'BEGIN { if(v>=c) print "CRITICAL"; else if(v>=w) print "WARNING"; else print "HEALTHY" }'
}

cpu_snapshot() {
  [[ -r /proc/stat ]] || return 1
  awk '$1=="cpu" { total=0; for(i=2;i<=9 && i<=NF;i++) total+=$i; idle=$5+$6; printf "%.0f %.0f\n",total,idle; found=1; exit } END { if(!found) exit 1 }' /proc/stat
}

cpu_usage_sample() {
  local first second total1 idle1 total2 idle2
  first=$(cpu_snapshot) || return 1
  sleep "${1:-1}"
  second=$(cpu_snapshot) || return 1
  read -r total1 idle1 <<< "$first"; read -r total2 idle2 <<< "$second"
  awk -v t1="$total1" -v i1="$idle1" -v t2="$total2" -v i2="$idle2" 'BEGIN { dt=t2-t1; di=i2-i1; if(dt<=0 || di<0 || di>dt) exit 1; printf "%.1f",100*(dt-di)/dt }'
}

cpu_core_count() {
  if command_exists nproc; then nproc 2>/dev/null
  elif command_exists getconf; then getconf _NPROCESSORS_ONLN 2>/dev/null
  else awk '/^processor[[:space:]]*:/ {n++} END {if(n) print n}' /proc/cpuinfo 2>/dev/null
  fi
}

cpu_load_values() { [[ -r /proc/loadavg ]] && awk '{print $1, $2, $3}' /proc/loadavg; }

memory_values() {
  [[ -r /proc/meminfo ]] || return 1
  awk '
    /^MemTotal:/ {total=$2}
    /^MemFree:/ {free=$2}
    /^MemAvailable:/ {available=$2}
    /^Buffers:/ {buffers=$2}
    /^Cached:/ {cached=$2}
    /^SReclaimable:/ {reclaim=$2}
    /^Shmem:/ {shmem=$2}
    /^SwapTotal:/ {swap_total=$2}
    /^SwapFree:/ {swap_free=$2}
    END {
      if(!total) exit 1
      if(!available) available=free+buffers+cached+reclaim-shmem
      if(available<0) available=0
      if(available>total) available=total
      printf "%.0f %.0f %.0f %.0f %.0f %.0f %.0f\n", total, total-available, available, free, swap_total, swap_total-swap_free, swap_free
    }' /proc/meminfo 2>/dev/null
}

disk_rows() {
  command_exists df || return 1
  df -P -T -x tmpfs -x devtmpfs -x squashfs -x proc -x sysfs -x overlay 2>/dev/null | awk 'NR==1 || ($3 ~ /^[0-9]+$/ && $4 ~ /^[0-9]+$/ && $5 ~ /^[0-9]+$/ && $6 ~ /^[0-9]+%$/)'
}

disk_max_percent() { disk_rows | awk 'NR>1 {gsub(/%/,"",$6); if($6+0>max) max=$6+0; found=1} END {if(found) printf "%d",max; else exit 1}'; }

network_overview() {
  section 'NETWORK OVERVIEW'
  if command_exists ip; then
    printf '%s\n' 'Interfaces and addresses:'
    ip -brief address 2>/dev/null || ip address show 2>/dev/null || printf '  Interface details unavailable.\n'
    printf '\nDefault route: '
    ip route show default 2>/dev/null | head -n 1 || :
  else
    printf 'ip utility is unavailable.\n'
  fi
  if command_exists hostname; then printf 'Local addresses: %s\n' "$(hostname -I 2>/dev/null || printf unavailable)"; fi
  if command_exists ss; then printf '\nListening ports:\n'; ss -tuln 2>/dev/null || printf '  Port listing unavailable.\n'; else printf '\nss utility is unavailable; listening ports omitted.\n'; fi
}
