// https://vitepress.dev/guide/custom-theme
import { h, ref, watch } from 'vue'
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
import './guide.css'

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
      'layout-bottom': () => h(BackToTop)
    })
  },
  enhanceApp({ app, router, siteData }) {
    // fix issue https://github.com/monad-cn/gmonad.cc/issues/48
    const activeNavPath = ref("");

    const updateNavActive = (path = window.location.pathname) => {
      const navLinks = document.querySelectorAll(".VPNavBarMenuLink");
      navLinks.forEach((navLink) => {
        const href = navLink.getAttribute("href");
        if (href && path.startsWith(href.replace(/\/$/, ""))) {
          activeNavPath.value = href;
        }
      });
    };

    app.mixin({
      mounted() {
        updateNavActive();

        const navLinks = document.querySelectorAll(".VPNavBarMenuLink");
        navLinks.forEach((link) => {
          link.addEventListener("click", () => {
            const href = link.getAttribute("href");
            if (href) {
              activeNavPath.value = href;
            }
          });
        });

        router.onBeforeRouteChange = (to) => {
          const currentActive = activeNavPath.value;
          if (
            currentActive &&
            to.startsWith(currentActive.replace(/\/$/, ""))
          ) {
            return;
          }
          updateNavActive(to);
        };

        watch(
          activeNavPath,
          (newPath) => {
            const navLinks = document.querySelectorAll(".VPNavBarMenuLink");
            navLinks.forEach((link) => {
              const href = link.getAttribute("href");
              if (href === newPath) {
                link.classList.add("active");
              } else {
                link.classList.remove("active");
              }
            });
          },
          { immediate: true }
        );
      },
    });
  }
} satisfies Theme
