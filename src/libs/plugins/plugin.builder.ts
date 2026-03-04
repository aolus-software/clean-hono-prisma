/**
 * Plugin Builder
 * Provides a fluent API for creating plugins
 */

import type {
	Plugin,
	PluginMetadata,
	PluginHooks,
	PluginBuilder as IPluginBuilder,
	PluginOptions,
} from "@types";
import type { MiddlewareHandler } from "hono";
import type { Env, AppType } from "@types";

export class PluginBuilder implements IPluginBuilder {
	private plugin: Partial<Plugin> = {
		middleware: [],
	};

	withMetadata(metadata: PluginMetadata): PluginBuilder {
		this.plugin.metadata = metadata;
		return this;
	}

	withHooks(hooks: PluginHooks): PluginBuilder {
		this.plugin.hooks = hooks;
		return this;
	}

	withMiddleware(...middleware: MiddlewareHandler<Env>[]): PluginBuilder {
		if (!this.plugin.middleware) {
			this.plugin.middleware = [];
		}
		this.plugin.middleware.push(...middleware);
		return this;
	}

	withRoutes(
		routes: (_app: AppType, _options?: PluginOptions) => void | Promise<void>,
	): PluginBuilder {
		this.plugin.routes = routes;
		return this;
	}

	withSetup(
		setup: (_app: AppType, _options?: PluginOptions) => void | Promise<void>,
	): PluginBuilder {
		this.plugin.setup = setup;
		return this;
	}

	withTeardown(teardown: () => void | Promise<void>): PluginBuilder {
		this.plugin.teardown = teardown;
		return this;
	}

	build(): Plugin {
		if (!this.plugin.metadata) {
			throw new Error("Plugin metadata is required");
		}

		return this.plugin as Plugin;
	}
}

/**
 * Creates a new plugin builder
 */
export function createPlugin(): PluginBuilder {
	return new PluginBuilder();
}

/**
 * Helper function to quickly create a plugin
 */
export function definePlugin(
	metadata: PluginMetadata,
	setup: (_app: AppType, _options?: PluginOptions) => void | Promise<void>,
): Plugin {
	return {
		metadata,
		setup,
	};
}
