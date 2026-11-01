import { DateToolkit } from "@utils/date";

/**
 * Lifetimes are functions called at issue time. A module-scope constant would
 * freeze the expiry at process start.
 */
export const verificationTokenLifetime = (): Date =>
	DateToolkit.addHours(DateToolkit.now(), 1).toDate();

export const resetPasswordTokenLifetime = (): Date =>
	DateToolkit.addHours(DateToolkit.now(), 1).toDate();
