import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

const SEO = ({ 
  title, 
  description, 
  keywords, 
  canonicalUrl, 
  ogImage = 'https://benaa-for-all.org/og-image.jpg',
  ogType = 'website'
}) => {
  const { i18n } = useTranslation();
  const lang = i18n.language || 'ar';
  
  const siteName = lang === 'ar' ? 'جمعية بناء للتنمية بالمنيا' : 'Benaa For All Foundation';
  const defaultTitle = lang === 'ar' 
    ? 'Benaa For All Foundation | جمعية بناء للتنمية بالمنيا'
    : 'Benaa For All Foundation | Community Development NGO';
  const defaultDescription = lang === 'ar'
    ? 'جمعية بناء للتنمية بالمنيا هي جمعية أهلية مشهرة برقم 1627 لسنة 2005، تعمل على تحقيق التنمية الشاملة للفئات الأكثر احتياجاً من خلال برامج ومبادرات تنموية مستدامة.'
    : 'Benaa For All Foundation is a non-governmental organization dedicated to sustainable community development, volunteering, and social impact in Minya, Egypt.';
  const defaultKeywords = 'Benaa, بناء, جمعية بناء, Benaa For All, جمعية بناء للتنمية بالمنيا, تطوع, مشروعات تنموية, المنيا, NGO Egypt, Charity, Community Development';

  const finalTitle = title ? `${title} | ${siteName}` : defaultTitle;
  const finalDescription = description || defaultDescription;
  const finalKeywords = keywords || defaultKeywords;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{finalTitle}</title>
      <meta name="title" content={finalTitle} />
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords} />
      <meta name="language" content={lang} />

      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      {canonicalUrl && <meta property="twitter:url" content={canonicalUrl} />}
      <meta property="twitter:title" content={finalTitle} />
      <meta property="twitter:description" content={finalDescription} />
      <meta property="twitter:image" content={ogImage} />
    </Helmet>
  );
};

export default SEO;
