type SeoOptions = {
  title?: string;
  description?: string;
  image?: string;
  noindex?: boolean;
  type?: 'website' | 'article';
};

export const useSiteSeo = (options: SeoOptions = {}) => {
  const config = useRuntimeConfig();
  const route = useRoute();
  const requestUrl = useRequestURL();

  const siteUrl = config.public.siteUrl || requestUrl.origin;
  const siteName = config.public.siteName || 'TrackFit';

  const canonical = computed(() => new URL(route.path, siteUrl).toString());
  const title = computed(() => options.title || siteName);
  const description = computed(
    () =>
      options.description ||
      'TrackFit helps you plan workouts, track performance, and see progress trends.'
  );
  const image = computed(() => options.image || `${siteUrl}/og-image.svg`);
  const robots = computed(() => (options.noindex ? 'noindex, nofollow' : 'index, follow'));

  useSeoMeta({
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    ogType: options.type || 'website',
    ogUrl: canonical,
    ogImage: image,
    ogSiteName: siteName,
    ogLocale: 'tr_TR',
    twitterCard: 'summary_large_image',
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: image,
    robots,
  });

  useHead({
    link: [{ rel: 'canonical', href: canonical }],
  });
};
