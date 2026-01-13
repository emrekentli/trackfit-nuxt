// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',
    devtools: {enabled: true},
    modules: ['@nuxt/eslint'],
    css: ['./app/assets/css/main.css'],
    runtimeConfig: {
        databaseUrl: process.env.DATABASE_URL || '',
        public: {
            siteUrl: process.env.NUXT_PUBLIC_SITE_URL || '',
            siteName: 'TrackFit',
        },
    },
    app: {
        head: {
            title: 'TrackFit',
            titleTemplate: '%s | TrackFit',
            meta: [
                { charset: 'utf-8' },
                { name: 'viewport', content: 'width=device-width, initial-scale=1' },
                { name: 'format-detection', content: 'telephone=no' },
                { name: 'theme-color', content: '#0a0a0a' },
                { name: 'color-scheme', content: 'dark' },
            ],
            link: [
                {
                    rel: 'icon',
                    type: 'image/png',
                    href: '/favicon.png'
                },
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
