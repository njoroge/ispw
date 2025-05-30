import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  esbuild: {
    loader: 'jsx', // Ensures 'loader' is a string, and defined only once.
    include: [
      'src/**/*.js', // Apply JSX loader to .js files in the src directory
      'src/**/*.jsx', // Also apply JSX loader to .jsx files in the src directory
    ],
    // Optional: To avoid manually importing React in every JSX file
    jsxInject: `import React from 'react'`,
  },
})