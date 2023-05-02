import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { glslTemplatePlugin } from '@marble/vite-plugin-glsl-templates'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        glslTemplatePlugin() as any,
    ],
    build: {
        commonjsOptions: {
            include: [/node_modules/],
        }
    }
})
