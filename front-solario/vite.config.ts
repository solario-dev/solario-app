import { defineConfig } from 'vitest/config'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './tests/setup.ts',
    exclude: ['e2e/**', 'node_modules/**'],
    typecheck: {
      tsconfig: './tsconfig.test.json',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/main.tsx',
        'src/vite-env.d.ts',
        // 3D / WebGL components – require a real browser / WebGL context to test
        'src/components/solar-system/game-objects/**',
        'src/components/solar-system/dashboard-system/**',
        'src/components/solar-system/ControlledSolarSystem.tsx',
        'src/components/solar-system/Planet3DView.tsx',
        'src/components/solar-system/Minimap.tsx',
        // WebSocket hooks – exercised via integration / E2E tests
        'src/hooks/useSimulationSocket.tsx',
        'src/hooks/usePlayerInput.tsx',
        // Pure TypeScript type declarations – nothing to cover
        'src/types/**',
        'src/api/types/**',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
        statements: 80
      }
    }
  }
})