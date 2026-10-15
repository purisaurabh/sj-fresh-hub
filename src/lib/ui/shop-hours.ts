import { PUSH_PROMPT_SEEN_KEY, SHOP_HOURS_DONE_EVENT, SHOP_HOURS_SEEN_KEY } from "@/lib/constants";

function readFlag(key: string) {
  try {
    return window.localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

function writeFlag(key: string) {
  try {
    window.localStorage.setItem(key, "1");
  } catch {
    // Ignore private-mode or blocked storage.
  }
}

export function hasAcknowledgedShopHours() {
  return readFlag(SHOP_HOURS_SEEN_KEY);
}

export function acknowledgeShopHours() {
  writeFlag(SHOP_HOURS_SEEN_KEY);
  window.dispatchEvent(new Event(SHOP_HOURS_DONE_EVENT));
}

export function hasAcknowledgedPushPrompt() {
  return readFlag(PUSH_PROMPT_SEEN_KEY);
}

export function acknowledgePushPrompt() {
  writeFlag(PUSH_PROMPT_SEEN_KEY);
}
