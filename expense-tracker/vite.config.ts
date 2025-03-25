import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Listen on all interfaces
    host: '0.0.0.0',
    // Use port 8080 for OpenShift/Knative
    port: 8080,
    // Permit requests from the specified hosts
    allowedHosts: ['kazi-chap-chap-sa-3118-dev.apps.rm2.thpm.p1.openshiftapps.com']

  }
})

