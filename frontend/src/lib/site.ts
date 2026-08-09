export const site = {
  name: 'FreelancerReply',
  domain: 'freelancerreply.com',
  url: 'https://freelancerreply.com',
  contactEmail: 'support@freelancerreply.com',
  description:
    'Generate polite client email drafts for freelancers, starting with late payment reminders.',
  ogImage: '/og-image.svg'
};

export const routes = {
  home: '/',
  tool: '/late-payment-reminder-email-generator',
  privacy: '/privacy-policy',
  terms: '/terms-of-service',
  cookies: '/cookie-policy',
  refund: '/refund-policy'
};

export function absoluteUrl(path = '/') {
  return new URL(path, site.url).toString();
}

export function pageMetadata({
  title,
  description,
  path
}: {
  title: string;
  description: string;
  path: string;
}) {
  const url = absoluteUrl(path);
  const image = absoluteUrl(site.ogImage);
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url,
      siteName: site.name,
      type: 'website' as const,
      images: [{ url: image, width: 1200, height: 630, alt: `${site.name} payment reminder generator` }]
    },
    twitter: {
      card: 'summary_large_image' as const,
      title,
      description,
      images: [image]
    }
  };
}
