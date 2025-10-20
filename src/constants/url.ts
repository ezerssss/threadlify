export const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL ?? "http://localhost:5000";

export const REGISTER_URL = `${BACKEND_BASE_URL}/auth/register`;

export const ONBOARDING_URL = `${BACKEND_BASE_URL}/onboarding/`;
