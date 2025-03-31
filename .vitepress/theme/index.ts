// https://vitepress.dev/guide/custom-theme
import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import BackToTop from '../components/BackToTop.vue'
import './style.css'
import './home.css'
import './ambassador.css'
import './contributors.css'
import './event.css'
import './faq.css'
import './blog.css'

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
      'layout-bottom': () => h(BackToTop)
    })
  },
  enhanceApp({ app, router, siteData }) {
    // ...
  }
} satisfies Theme
