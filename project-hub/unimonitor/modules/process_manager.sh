#!/usr/bin/env bash

process_top_cpu() {
  section 'TOP PROCESSES BY CPU'
  ps -eo pid,ppid,user,stat,pcpu,pmem,comm --sort=-pcpu 2>/dev/null | head -n 11 || printf 'Process data is unavailable.\n'
}

process_top_memory() {
  section 'TOP PROCESSES BY MEMORY'
  ps -eo pid,ppid,user,stat,pcpu,pmem,comm --sort=-pmem 2>/dev/null | head -n 11 || printf 'Process data is unavailable.\n'
}

process_top_snapshot() {
  section 'TOP SNAPSHOT'
  if command_exists top; then top -b -n 1 -o %CPU 2>/dev/null | head -n 18 || process_top_cpu; else printf 'top utility is unavailable; using ps instead.\n'; process_top_cpu; fi
}

process_search() {
  local query
  read -r -p 'Process name or command text: ' query || return
  if [[ -z "$query" ]]; then printf 'Search text cannot be empty.\n'; return; fi
  section "PROCESS SEARCH: $query"
  ps -eo pid,ppid,user,stat,pcpu,pmem,comm,args 2>/dev/null | awk -v needle="${query,,}" 'NR==1 || index(tolower($0),needle)>0' | head -n 30
  if command_exists pgrep && [[ "$query" =~ ^[[:alnum:]_-]+$ ]]; then
    printf '\nExact process-name matches (pgrep):\n'
    pgrep -a -x -- "$query" 2>/dev/null || printf '  No exact-name process matches.\n'
  fi
}

process_details() {
  local pid
  read -r -p 'PID to inspect: ' pid || return
  if ! is_valid_pid "$pid"; then printf 'Enter a positive numeric PID.\n'; return; fi
  if ! kill -0 "$pid" 2>/dev/null; then printf 'PID %s does not exist or is not accessible.\n' "$pid"; return; fi
  ps -p "$pid" -o pid,ppid,user,group,stat,pcpu,pmem,etime,lstart,comm,args 2>&1 || printf 'Unable to read process details.\n'
}

process_terminate() {
  local pid comm confirmation owner
  read -r -p 'PID to send SIGTERM to: ' pid || return
  if ! is_valid_pid "$pid"; then printf 'Enter a positive numeric PID.\n'; return; fi
  if (( 10#$pid == 1 || 10#$pid == $$ || 10#$pid == $PPID )); then
    printf 'Refusing to signal PID %s because it is UniMonitor or a critical supervisor.\n' "$pid"; log_event WARNING "Blocked termination attempt for protected PID $pid."; return
  fi
  if ! kill -0 "$pid" 2>/dev/null; then
    owner=$(ps -p "$pid" -o user= 2>/dev/null | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
    if [[ "$owner" == root || "$owner" == 0 ]]; then printf 'PID %s is root-owned; signaling it may require elevated privileges. UniMonitor will not elevate privileges.\n' "$pid"
    else printf 'PID %s does not exist or is not accessible; signaling a process owned by another user may require elevated privileges.\n' "$pid"; fi
    return
  fi
  owner=$(ps -p "$pid" -o user= 2>/dev/null | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
  if [[ "$owner" == root || "$owner" == 0 ]]; then
    printf 'Refusing to signal root-owned process PID %s (%s); system and service processes are protected.\n' "$pid" "${owner:-root}"
    log_event WARNING "Blocked termination attempt for root-owned PID $pid."; return
  fi
  comm=$(ps -p "$pid" -o comm= 2>/dev/null | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
  case "$comm" in
    systemd|systemd-*|init|kthreadd|ksoftirqd/*|migration/*|rcu_*|watchdog/*|kworker/*|kcompactd*|kswapd*|sshd|dbus-*|NetworkManager|polkitd|udisksd|containerd|dockerd|cron|crond)
      printf 'Refusing to terminate protected system process "%s" (PID %s).\n' "$comm" "$pid"
      log_event WARNING "Blocked termination attempt for protected process $comm (PID $pid)."; return ;;
  esac
  printf 'Process: PID %s, command: %s\n' "$pid" "${comm:-unknown}"
  printf 'This sends SIGTERM only. It will not use SIGKILL or sudo.\n'
  read -r -p 'Type yes to confirm termination: ' confirmation || confirmation=no
  if [[ "$confirmation" != yes ]]; then printf 'Termination cancelled.\n'; log_event INFO "Termination cancelled for PID $pid."; return; fi
  log_event INFO "User confirmed SIGTERM attempt for PID $pid ($comm)."
  if kill -TERM "$pid" 2>/dev/null; then printf 'SIGTERM sent to PID %s. The process may take time to exit.\n' "$pid"; else printf 'Could not signal PID %s. It may require elevated privileges or may have exited.\n' "$pid"; log_event WARNING "SIGTERM failed for PID $pid."; fi
}

process_manager_menu() {
  log_event INFO 'Process management module opened.'
  while true; do
    section 'PROCESS MANAGEMENT'
    printf ' [1] Running processes (ps aux)\n [2] Top 10 CPU-consuming\n [3] Top 10 memory-consuming\n [4] Search by name/text\n [5] Process details by PID\n [6] Terminate process (SIGTERM, confirmation required)\n [7] top snapshot\n [0] Return\n'
    read -r -p 'Select: ' choice || choice=0
    case "$choice" in
      1) ps aux 2>/dev/null | head -n 26 || printf 'Process data unavailable.\n' ;;
      2) process_top_cpu ;;
      3) process_top_memory ;;
      4) process_search ;;
      5) process_details ;;
      6) process_terminate ;;
      7) process_top_snapshot ;;
      0|'') break ;;
      *) printf 'Invalid selection. Choose 0–7.\n' ;;
    esac
    [[ "$choice" == 0 || -z "$choice" ]] || pause_screen
  done
}
