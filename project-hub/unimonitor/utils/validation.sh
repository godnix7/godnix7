#!/usr/bin/env bash

is_uint() { [[ "${1:-}" =~ ^[0-9]+$ ]]; }

is_valid_threshold() {
  is_uint "${1:-}" && (( 10#$1 >= 0 && 10#$1 <= 100 ))
}

is_valid_hostname() {
  local value=${1:-}
  [[ ${#value} -le 253 && "$value" =~ ^[A-Za-z0-9]([A-Za-z0-9.-]*[A-Za-z0-9])?$ ]] || return 1
  [[ "$value" != *..* && "$value" != *.-* && "$value" != *-.* ]]
}

is_valid_pid() { [[ "${1:-}" =~ ^[1-9][0-9]{0,8}$ ]]; }

is_safe_directory_value() {
  local value=${1:-}
  [[ -n "$value" && "$value" != *$'\n'* && "$value" != *$'\r'* && "$value" =~ ^[A-Za-z0-9_./-]+$ && "$value" != *".."* ]]
}

prompt_nonempty() {
  local __result_var=$1 __prompt=$2 __value=''
  read -r -p "$__prompt" __value || return 1
  [[ -n "$__value" ]] || return 1
  printf -v "$__result_var" '%s' "$__value"
}
