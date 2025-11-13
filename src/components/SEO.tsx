import Head from 'next/head';

interface SEOProps {
  title: string;
  description: string;
  type?: 'website' | 'article' | 'event';
  url?: string;
  image?: string;
  publishedTime?: string;
  author?: string;
  tags?: string[];
  eventStartTime?: string;
  eventEndTime?: string;
  eventLocation?: string;
}

export default function SEO({
  title,
  description,
  type = 'article',
  url,
  image,
  publishedTime,
  author,
  tags,
  eventStartTime,
  eventEndTime,
  eventLocation,
}: SEOProps) {
  const siteName = 'GMonad';
  const baseUrl = 'https://gmonad.cc';
  const fullUrl = url ? `${baseUrl}${url}` : baseUrl;
  const ogImage = image || `${baseUrl}/cover.png`;

  // 确保图片使用绝对 URL
  const absoluteImageUrl = ogImage.startsWith('http')
    ? ogImage
    : `${baseUrl}${ogImage}`;

  return (
    <Head>
      {/* 基础 Meta 标签 */}
      <title>{title} | {siteName}</title>
      <meta key="description" name="description" content={description} />
      <link key="canonical" rel="canonical" href={fullUrl} />

      {/* OpenGraph 标签 - 使用 key 确保覆盖 _document.tsx 中的默认值 */}
      <meta key="og:title" property="og:title" content={title} />
      <meta key="og:description" property="og:description" content={description} />
      <meta key="og:type" property="og:type" content={type} />
      <meta key="og:url" property="og:url" content={fullUrl} />
      <meta key="og:image" property="og:image" content={absoluteImageUrl} />
      <meta key="og:image:width" property="og:image:width" content="1200" />
      <meta key="og:image:height" property="og:image:height" content="630" />
      <meta key="og:site_name" property="og:site_name" content={siteName} />

      {/* Article 特定标签 */}
      {type === 'article' && publishedTime && (
        <meta key="article:published_time" property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && author && (
        <meta key="article:author" property="article:author" content={author} />
      )}
      {type === 'article' && tags && tags.length > 0 && (
        <>
          {tags.map((tag, index) => (
            <meta key={`article:tag:${index}`} property="article:tag" content={tag} />
          ))}
        </>
      )}

      {/* Event 特定标签 */}
      {type === 'event' && eventStartTime && (
        <meta key="event:start_time" property="event:start_time" content={eventStartTime} />
      )}
      {type === 'event' && eventEndTime && (
        <meta key="event:end_time" property="event:end_time" content={eventEndTime} />
      )}
      {type === 'event' && eventLocation && (
        <meta key="event:location" property="event:location" content={eventLocation} />
      )}

      {/* Twitter Card 标签 - 使用 key 确保覆盖 _document.tsx 中的默认值 */}
      <meta key="twitter:card" name="twitter:card" content="summary_large_image" />
      <meta key="twitter:title" name="twitter:title" content={title} />
      <meta key="twitter:description" name="twitter:description" content={description} />
      <meta key="twitter:image" name="twitter:image" content={absoluteImageUrl} />
      <meta key="twitter:site" name="twitter:site" content="@GMonadCC" />

      {/* 额外的 Meta 标签 */}
      <meta key="robots" name="robots" content="index, follow" />
      <meta key="viewport" name="viewport" content="width=device-width, initial-scale=1.0" />
    </Head>
  );
}

