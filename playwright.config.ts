import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	testDir: 'tests',
	fullyParallel: true,
	reporter: 'list',
	use: { baseURL: 'http://localhost:4321/learn-ai-agents/' },
	webServer: {
		command: 'npm run preview -- --port 4321',
		url: 'http://localhost:4321/learn-ai-agents/',
		reuseExistingServer: !process.env.CI,
	},
	projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
