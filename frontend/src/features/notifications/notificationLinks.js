const LEGACY_NOTIFICATION_LINKS = {
  "/orders/my": "/orders/user",
};

export const normalizeNotificationLink = (link, fallback = "/notifications") => {
  if (!link) return fallback;

  return LEGACY_NOTIFICATION_LINKS[link] || link;
};
