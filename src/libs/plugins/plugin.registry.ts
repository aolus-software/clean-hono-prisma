/**
 * Plugin Registry
 * Manages plugin registration, lifecycle, and dependencies
 */

import type {
	Plugin,
	PluginOptions,
	PluginRegistryEntry,
	IPluginRegistry,
} from "@types";
import {
	PluginError,
	PluginDependencyError,
	PluginAlreadyRegisteredError,
} from "@types";
import type { AppType } from "@types";
import { logger } from "@utils";

export class PluginRegistry implements IPluginRegistry {
	private plugins: Map<string, PluginRegistryEntry> = new Map();
	private app: AppType;

	constructor(app: AppType) {
		this.app = app;
	}

	async register(plugin: Plugin, options: PluginOptions = {}): Promise<void> {
		const { metadata } = plugin;
		const pluginName = metadata.name;

		if (this.has(pluginName)) {
			throw new PluginAlreadyRegisteredError(pluginName);
		}

		if (options.enabled === false) {
			logger.info(
				{ plugin: pluginName },
				`Plugin "${pluginName}" is disabled, skipping registration`,
			);
			return;
		}

		this.checkDependencies(plugin);

		try {
			if (plugin.hooks?.onBeforeRegister) {
				await plugin.hooks.onBeforeRegister(this.app);
			}

			if (plugin.middleware) {
				for (const mw of plugin.middleware) {
					this.app.use(options.prefix || "*", mw);
				}
			}

			if (plugin.setup) {
				await plugin.setup(this.app, options);
			}

			if (plugin.routes) {
				await plugin.routes(this.app, options);
			}

			this.plugins.set(pluginName, {
				plugin,
				options,
				registeredAt: new Date(),
			});

			if (plugin.hooks?.onAfterRegister) {
				await plugin.hooks.onAfterRegister(this.app);
			}

			logger.info(
				{
					plugin: pluginName,
					version: metadata.version,
					prefix: options.prefix,
				},
				`Plugin "${pluginName}" registered successfully`,
			);
		} catch (error) {
			logger.error(
				{ plugin: pluginName, error },
				`Failed to register plugin "${pluginName}"`,
			);
			throw new PluginError(
				`Failed to register plugin "${pluginName}"`,
				pluginName,
				error as Error,
			);
		}
	}

	get(name: string): PluginRegistryEntry | undefined {
		return this.plugins.get(name);
	}

	has(name: string): boolean {
		return this.plugins.has(name);
	}

	getAll(): PluginRegistryEntry[] {
		return Array.from(this.plugins.values());
	}

	async unregister(name: string): Promise<void> {
		const entry = this.plugins.get(name);
		if (!entry) {
			logger.warn({ plugin: name }, `Plugin "${name}" is not registered`);
			return;
		}

		try {
			if (entry.plugin.teardown) {
				await entry.plugin.teardown();
			}

			this.plugins.delete(name);
			logger.info({ plugin: name }, `Plugin "${name}" unregistered`);
		} catch (error) {
			logger.error(
				{ plugin: name, error },
				`Failed to unregister plugin "${name}"`,
			);
			throw new PluginError(
				`Failed to unregister plugin "${name}"`,
				name,
				error as Error,
			);
		}
	}

	clear(): void {
		this.plugins.clear();
		logger.info("All plugins cleared");
	}

	async callHook(hookName: "onStart" | "onStop"): Promise<void> {
		for (const [name, entry] of this.plugins.entries()) {
			try {
				const hooks = entry.plugin.hooks;
				if (!hooks) continue;

				if (hookName === "onStart" && hooks.onStart) {
					await hooks.onStart();
					logger.debug(`Plugin hook "${hookName}" called for "${name}"`);
				} else if (hookName === "onStop" && hooks.onStop) {
					await hooks.onStop();
					logger.debug(`Plugin hook "${hookName}" called for "${name}"`);
				}
			} catch (error) {
				logger.error(error, `Plugin hook "${hookName}" failed for "${name}"`);
			}
		}
	}

	private checkDependencies(plugin: Plugin): void {
		const { metadata } = plugin;
		if (!metadata.dependencies || metadata.dependencies.length === 0) {
			return;
		}

		for (const dependency of metadata.dependencies) {
			if (!this.has(dependency)) {
				throw new PluginDependencyError(metadata.name, dependency);
			}
		}
	}

	listPlugins(): void {
		const plugins = this.getAll();
		if (plugins.length === 0) {
			logger.info("No plugins registered");
			return;
		}

		logger.info(
			{
				count: plugins.length,
				plugins: plugins.map((p) => ({
					name: p.plugin.metadata.name,
					version: p.plugin.metadata.version,
					registeredAt: p.registeredAt,
				})),
			},
			`Registered plugins (${plugins.length})`,
		);
	}
}
