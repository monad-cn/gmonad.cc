import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  ignoreDeadLinks: true,
  title: "Monad 中文社区",
  description: "欢迎一起建设 Moand！",
  head: [["link", { rel: "icon", type: "image/png", href: "/icon.png" }]],
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
	logo: 'https://avatars.githubusercontent.com/u/184135503',
    nav: [
      { text: '首页', link: '/index' },
      { text: '生态导航', link: '/ecosystem' },
      { text: '活动', link: '/event' },
      { text: '贡献者', link: '/contributors/' },
      { text: '官网', link: 'https://www.monad.xyz/' },
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
          text: '生态导航',
          children: [
            '/ecosystem/index.md',
          ]
        },
	  ],
	  '/contributors/': [
        {
          text: '如何参与 Monad 社区？',
          children: [
            '/contributors/index',
          ]
        },
        {
          text: '社区贡献者',
          collapsed: false,
          link: '/contributors/' ,
          items: [
            { text: '社区贡献者们', link: '/contributors/contributors' },
            { text: '社区贡献者计划', link: '/contributors/contributor_intro' },
          ]
        },
        {
          text: '社区大使',
          collapsed: false,
          link: '/contributors/ambassador',
          items: [
            { text: '社区大使们', link: '/contributors/ambassador' },
            { text: 'Monad 社区大使计划', link: '/contributors/ambassador_intro' },
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
