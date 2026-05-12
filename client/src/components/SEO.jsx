import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

const SEO = ({ 
  title, 
  description, 
  keywords, 
  canonicalUrl, 
  ogImage = 'https://benna-for-all.org/og-image.jpg',
  ogType = 'website'
}) => {
  const { i18n } = useTranslation();
  const lang = i18n.language || 'ar';
  
  const siteName = lang === 'ar' ? 'مؤسسة بناء للجميع' : 'Benna For All Foundation';
  const defaultTitle = lang === 'ar' 
    ? 'Benna For All Foundation | مؤسسة بناء للجميع للتبرعات والعمل الخيري'
    : 'Benna For All Foundation | Charity & Donation Platform';
  const defaultDescription = lang === 'ar'
    ? 'Benna For All Foundation هي مؤسسة خيرية متخصصة في التبرعات، دعم الأسر المحتاجة، الحملات الإنسانية، والعمل المجتمعي لصناعة أثر حقيقي ومستدام.'
    : 'Benna For All Foundation is a charity organization dedicated to donations, helping families in need, humanitarian campaigns, and community work to make a real impact.';
  const defaultKeywords = 'Benna, بناء, مؤسسة بناء, Benna For All, جمعية خيرية, منصة تبرعات, حملات خيرية, دعم المحتاجين, وظائف خيرية, العمل الإنساني, Charity, Donation, Humanitarian';

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
