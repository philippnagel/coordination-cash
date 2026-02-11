import { watch } from "node:fs";
import { build, serve } from "bun";

const PROJECT_ROOT = `${import.meta.dir}/..`;
const PUBLIC_DIR = `${PROJECT_ROOT}/public`;
const SRC_DIR = `${PROJECT_ROOT}/src`;

async function buildApp() {
	const result = await build({
		entrypoints: [`${SRC_DIR}/index.tsx`],
		outdir: PUBLIC_DIR,
		minify: false,
		sourcemap: "inline",
		target: "browser",
		define: {
			"process.env.NODE_ENV": '"development"',
		},
	});
	if (!result.success) {
		console.error("Build failed:", result.logs);
	}
	return result.success;
}

// Build CSS
async function buildCSS() {
	const proc = Bun.spawn(
		[
			"bunx",
			"@tailwindcss/cli",
			"-i",
			`${SRC_DIR}/styles.css`,
			"-o",
			`${PUBLIC_DIR}/styles.css`,
		],
		{ stdout: "inherit", stderr: "inherit" },
	);
	await proc.exited;
}

await buildApp();
await buildCSS();

// Watch for changes
watch(SRC_DIR, { recursive: true }, async (_event, filename) => {
	if (filename?.endsWith(".css")) {
		await buildCSS();
	} else {
		await buildApp();
	}
	console.log(`Rebuilt: ${filename}`);
});

const server = serve({
	port: 3000,
	async fetch(req) {
		const url = new URL(req.url);
		const path = url.pathname === "/" ? "/index.html" : url.pathname;
		const file = Bun.file(`${PUBLIC_DIR}${path}`);
		if (await file.exists()) {
			return new Response(file);
		}
		// SPA fallback
		return new Response(Bun.file(`${PUBLIC_DIR}/index.html`));
	},
});

console.log(`Dev server running at http://localhost:${server.port}`);
