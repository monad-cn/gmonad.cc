import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Monad 中文社区",
  description: "欢迎一起建设 Moand！",
  themeConfig: {
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
      { text: '活动', link: '/event' },
      { text: '官网', link: 'https://www.monad.xyz/' },
      { text: '贡献者', link: '/contributors' }
    ],

	sidebar: {
	  '/develop/': [
        {
          text: '中文开发文档',
          children: [
            '/develop/index.md',  
          ]
        },
      ],
	  '/event/': [
        {
          text: '活动',
          children: [
            '/event/index.md',  
            '/event/monad101.md',  
          ]
        },
	  ],
	  '/ecosystem/': [
        {
          text: '生态系统',
          children: [
            '/ecosystem/index.md',  
          ]
        },
	  ],
	  '/contributors/': [
        {
          text: '贡献者',
          children: [
            '/contributors/index.md',  
          ]
        },
	  ],
	},

    socialLinks: [
      { icon: 'github', link: 'https://github.com/monad-cn/gmonad.cc' },
      { icon: 'twitter', link: 'https://x.com/monad_zw' },
      { icon: 'discord', link: 'https://discord.gg/monad' }
    ]
  }
})
