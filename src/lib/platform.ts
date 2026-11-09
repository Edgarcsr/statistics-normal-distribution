const APPLE_PATTERN = /mac|iphone|ipad|ipod/iu

const isApplePlatform = (): boolean =>
  typeof navigator !== 'undefined' && APPLE_PATTERN.test(navigator.platform)

// No Mac o atalho usa ⌘, no Windows/Linux usa Ctrl.
export const MODIFIER_KEY_LABEL = isApplePlatform() ? '⌘' : 'Ctrl'
