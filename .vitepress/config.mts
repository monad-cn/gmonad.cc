import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Monad 中文社区",
  description: "欢迎一起建设 Moand！",
  themeConfig: {
	lang: 'zh-CN',
	search: {
      provider: 'algolia',
      options: {
        appId: '...',
        apiKey: '...',
        indexName: '...',
		placeholder: '请输入搜索内容'
      }
    },
    // https://vitepress.dev/reference/default-theme-config
	logo: '/icon.png',
    nav: [
      { text: '主页', link: '/' },
      { text: '官网', link: 'https://www.monad.xyz/' },
      { text: 'Examples', link: '/markdown-examples' }
    ],

    sidebar: [
      {
        text: 'Examples',
        items: [
          { text: 'Markdown Examples', link: '/markdown-examples' },
          { text: 'Runtime API Examples', link: '/api-examples' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/monad-cn/docs' },
      { icon: 'twitter', link: 'https://x.com/monad_zw' },
      { icon: 'discord', link: 'https://discord.gg/monad' }
    ]
  }
})
