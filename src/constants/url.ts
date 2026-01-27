export const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL ?? "http://localhost:5000";

export const REGISTER_URL = `${BACKEND_BASE_URL}/auth/register`;

export const ONBOARDING_URL = `${BACKEND_BASE_URL}/onboarding/`;
export const GENERATE_STRATEGY_URL = `${BACKEND_BASE_URL}/onboarding/generate-strategy`;

export const KANBAN_CHANGE_URL = `${BACKEND_BASE_URL}/kanban/change`;
export const KANBAN_TRASH_URL = `${BACKEND_BASE_URL}/kanban/trash`;
export const POST_SEEN_URL = `${BACKEND_BASE_URL}/kanban/seen`;

export const SCAN_REQUEST_URL = `${BACKEND_BASE_URL}/scan/`;

export const EDIT_PROFILE_URL = `${BACKEND_BASE_URL}/user/edit`;

export const TWEAK_REPLY_URL = `${BACKEND_BASE_URL}/reply/tweak`;
export const TWEAK_DM_URL = `${BACKEND_BASE_URL}/reply/dm/tweak`;

export const ACCEPT_INVITE_URL = `${BACKEND_BASE_URL}/invite/accept`;

export const UPDATE_SUBREDDITS_URL = `${BACKEND_BASE_URL}/user/subreddits`;

export const ADMIN_UPDATE_SUBSCRIPTION_URL = `${BACKEND_BASE_URL}/admin/user/subscription`;
export const ADMIN_EXTEND_SUBSCRIPTION_URL = `${BACKEND_BASE_URL}/admin/user/subscription/extend`;
export const ADMIN_TRIGGER_SCAN_URL = `${BACKEND_BASE_URL}/admin/user/scan/run`;
