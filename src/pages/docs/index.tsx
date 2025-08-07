import { GetStaticProps } from 'next';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { getDocsByCategory } from '@/lib/docsConfig';

export default function DocsIndexPage() {
  const router = useRouter();

  useEffect(() => {
    // 自动重定向到第一个分类的第一个文档
    const docsCategories = getDocsByCategory();
    
    if (docsCategories.length > 0) {
      const firstCategory = docsCategories[0];
      if (firstCategory.docs && firstCategory.docs.length > 0) {
        const firstDoc = firstCategory.docs[0];
        router.replace(`/docs/${firstDoc.slug}`);
      }
    }
  }, [router]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '50vh',
      fontSize: '1.2rem',
      color: '#6b7280'
    }}>
      正在跳转到文档...
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {}
  };
};
