/**
 * Plugin Types and Interfaces
 * Defines the structure for a modular plugin system
 */

import type { MiddlewareHandler } from "hono";
import type { Env, AppType } from "./hono/app.types";

/**
 * Plugin lifecycle hooks
 */
export interface PluginHooks {
	/**
	 * Called before plugin is registered
	 * Use for validation or preparation
	 */
	onBeforeRegister?: (_app: AppType) => Promise<void> | void;

	/**
	 * Called after plugin is registered
	 * Use for cleanup or notifications
	 */
	onAfterRegister?: (_app: AppType) => Promise<void> | void;

	/**
	 * Called when application starts
	 */
	onStart?: () => Promise<void> | void;

	/**
	 * Called when application shuts down
	 */
	onStop?: () => Promise<void> | void;
}

/**
 * Plugin metadata
 */
export interface PluginMetadata {
	/**
	 * Plugin name (unique identifier)
	 */
	name: string;

	/**
	 * Plugin version (semver)
	 */
	version: string;

	/**
	 * Plugin description
	 */
	description?: string;

	/**
	 * Plugin author
	 */
	author?: string;

	/**
	 * Plugins this plugin depends on
	 */
	dependencies?: string[];

	/**
	 * Plugin tags for categorization
	 */
	tags?: string[];
}

/**
 * Plugin configuration options
 */
export interface PluginOptions {
	/**
	 * Enable/disable the plugin
	 */
	enabled?: boolean;

	/**
	 * Plugin-specific configuration
	 */
	config?: Record<string, unknown>;

	/**
	 * Route prefix for plugin routes
	 */
	prefix?: string;
}

/**
 * Plugin interface
 * All plugins must implement this interface
 */
export interface Plugin {
	/**
	 * Plugin metadata
	 */
	metadata: PluginMetadata;

	/**
	 * Plugin lifecycle hooks
	 */
	hooks?: PluginHooks;

	/**
	 * Plugin middleware to apply
	 */
	middleware?: MiddlewareHandler<Env>[];

	/**
	 * Plugin routes registration function
	 */
	routes?: (_app: AppType, _options?: PluginOptions) => void | Promise<void>;

	/**
	 * Plugin setup function
	 * Called when plugin is registered
	 */
	setup?: (_app: AppType, _options?: PluginOptions) => void | Promise<void>;

	/**
	 * Plugin teardown function
	 * Called when application shuts down
	 */
	teardown?: () => void | Promise<void>;
}

/**
 * Plugin registry entry
 */
export interface PluginRegistryEntry {
	plugin: Plugin;
	options: PluginOptions;
	registeredAt: Date;
}

/**
 * Plugin registry interface
 */
export interface IPluginRegistry {
	/**
	 * Register a plugin
	 */
	register(_plugin: Plugin, _options?: PluginOptions): Promise<void>;

	/**
	 * Get a registered plugin by name
	 */
	get(_name: string): PluginRegistryEntry | undefined;

	/**
	 * Check if a plugin is registered
	 */
	has(_name: string): boolean;

	/**
	 * Get all registered plugins
	 */
	getAll(): PluginRegistryEntry[];

	/**
	 * Unregister a plugin
	 */
	unregister(_name: string): Promise<void>;

	/**
	 * Clear all plugins
	 */
	clear(): void;
}

/**
 * Plugin builder for fluent API
 */
export interface PluginBuilder {
	/**
	 * Set plugin metadata
	 */
	withMetadata(_metadata: PluginMetadata): PluginBuilder;

	/**
	 * Add lifecycle hooks
	 */
	withHooks(_hooks: PluginHooks): PluginBuilder;

	/**
	 * Add middleware
	 */
	withMiddleware(..._middleware: MiddlewareHandler<Env>[]): PluginBuilder;

	/**
	 * Add routes
	 */
	withRoutes(
		_routes: (_app: AppType, _options?: PluginOptions) => void | Promise<void>,
	): PluginBuilder;

	/**
	 * Add setup function
	 */
	withSetup(
		_setup: (_app: AppType, _options?: PluginOptions) => void | Promise<void>,
	): PluginBuilder;

	/**
	 * Add teardown function
	 */
	withTeardown(_teardown: () => void | Promise<void>): PluginBuilder;

	/**
	 * Build the plugin
	 */
	build(): Plugin;
}

/**
 * Plugin error types
 */
export class PluginError extends Error {
	constructor(
		message: string,
		public _pluginName: string,
		public _cause?: Error,
	) {
		super(message);
		this.name = "PluginError";
	}
}

export class PluginDependencyError extends PluginError {
	constructor(pluginName: string, missingDependency: string) {
		super(
			`Plugin "${pluginName}" depends on "${missingDependency}" which is not registered`,
			pluginName,
		);
		this.name = "PluginDependencyError";
	}
}

export class PluginAlreadyRegisteredError extends PluginError {
	constructor(pluginName: string) {
		super(`Plugin "${pluginName}" is already registered`, pluginName);
		this.name = "PluginAlreadyRegisteredError";
	}
}
