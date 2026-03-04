import { randomUUID } from "crypto";

/**
 * Generate a unique request ID
 * Uses UUID v4 for guaranteed uniqueness
 */
export const generateRequestId = (): string => {
	return randomUUID();
};

/**
 * Extract request ID from header or generate a new one
 */
export const getOrGenerateRequestId = (existingId?: string): string => {
	return existingId || generateRequestId();
};
