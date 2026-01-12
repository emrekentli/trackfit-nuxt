// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',
    devtools: {enabled: true},
    modules: ['@nuxt/eslint'],
    css: ['./app/assets/css/main.css'],
    runtimeConfig: {
        databaseUrl: process.env.DATABASE_URL || '',
    },
    app: {
        head: {
            link: [
                {
                    rel: 'stylesheet',
                    href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css'
                }
            ]
        }
    },
    vite: {
        plugins: [
            tailwindcss(),
        ],
    },
})