#!/usr/bin/env bash

network_test_ping() {
  local target=${1:-1.1.1.1} gateway
  if ! is_valid_hostname "$target"; then printf 'Invalid hostname or IP address.\n'; return 2; fi
  if ! command_exists ping; then printf 'ping utility is unavailable.\n'; return 1; fi
  gateway=$(ip route show default 2>/dev/null | awk 'NR==1 {print $3}')
  if [[ -n "$gateway" ]]; then
    printf 'Local gateway (%s): ' "$gateway"
    if ping -c 1 -W 2 "$gateway" >/dev/null 2>&1; then printf 'reachable\n'; else printf 'no response; local network connectivity may be unavailable\n'; fi
  else printf 'No default gateway was found; local route connectivity cannot be checked.\n'; fi
  printf 'Target (%s): ' "$target"
  if ping -c 3 -W 2 "$target" >/dev/null 2>&1; then printf 'reachable (3 attempts completed)\n'; else printf 'no response (ICMP may be filtered or target unreachable)\n'; fi
}

network_dns_lookup() {
  local host
  read -r -p 'Hostname to resolve: ' host || return
  if ! is_valid_hostname "$host"; then printf 'Enter a valid hostname (letters, digits, dots and hyphens).\n'; return; fi
  if ! command_exists getent; then printf 'getent utility is unavailable.\n'; return; fi
  printf 'DNS / host database results for %s:\n' "$host"
  if ! getent ahosts "$host" 2>/dev/null | awk '!seen[$1]++ {print $1}'; then printf 'Name resolution failed.\n'; fi
}

network_diagnostics_menu() {
  log_event INFO 'Network diagnostics module opened.'
  while true; do
    section 'NETWORK DIAGNOSTICS'
    printf ' [1] Interfaces, addresses and default route\n [2] Test connectivity to host/IP\n [3] DNS/host resolution\n [4] Listening ports\n [0] Return\n'
    read -r -p 'Select: ' choice || choice=0
    case "$choice" in
      1) network_overview ;;
      2) local target; read -r -p 'Target hostname or IP [1.1.1.1]: ' target || target=''; network_test_ping "${target:-1.1.1.1}" ;;
      3) network_dns_lookup ;;
      4) if command_exists ss; then ss -tuln 2>&1 || printf 'Listening port data unavailable.\n'; else printf 'ss utility is unavailable.\n'; fi ;;
      0|'') break ;;
      *) printf 'Invalid selection. Choose 0–4.\n' ;;
    esac
    [[ "$choice" == 0 || -z "$choice" ]] || pause_screen
  done
}
