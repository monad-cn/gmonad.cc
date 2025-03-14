<template>
<!--  <link rel="stylesheet" href="/ecosystem/card.css">-->
  <link rel="stylesheet" href="/.vitepress/theme/ecosystem.css">

  <div role="listitem" class="ecosystem_directory-item w-dyn-item">
    <div class="ecosystem_item-header">
      <div class="ecosystem_item-logo-container"><img
          :src="`${item.image}`"
          loading="lazy" alt="0x" class="ecosystem_item-logo"><img
          src="https://cdn.prod.website-files.com/667c57e6f9254a4b6d914440/6786df3f37c0eaa49037b800_Monad%20Logo.svg"
          loading="lazy" alt="" class="ecosystem_item-logo w-condition-invisible"></div>
      <div class="ecosystem_item-header-info">
        <div class="w-layout-hflex exclusive-project-type u-hflex-left-center u-gap-xsmall">
          <div class="project-type-container">
            <div class="ecosystem_item-project-type u-text-xsmall u-color-faded u-weight-medium">{{item.category}}</div>
          </div>
          <div data-w-id="14f63dac-0f7c-a939-463f-7be0f899a33f"
               class="exclusive-tag inner-banner w-condition-invisible">
            <div class="w-embed">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                    d="M5.99997 0C4.26731 0 0 4.26721 0 5.99997C0 7.73272 4.26731 12 5.99997 12C7.73262 12 12 7.73264 12 5.99997C12 4.26729 7.73269 0 5.99997 0ZM5.06497 9.43095C4.33433 9.23185 2.36993 5.79561 2.56906 5.06496C2.76819 4.33428 6.20436 2.36992 6.935 2.56905C7.66567 2.76815 9.63007 6.20433 9.43094 6.93501C9.23181 7.66569 5.79561 9.63008 5.06497 9.43095Z"
                    fill="white"></path>
              </svg>
            </div>
            <div style="display: none;" class="exclusive-tooltip">
              <div class="exclusive-tooltip_text u-text-small u-weight-medium">Only on Monad</div>
            </div>
          </div>
        </div>
        <div class="ecosystem_item-links u-hflex-left-center u-gap-xsmall"><a :href="`${item.xaddr}`"
                                                                              target="_blank"
                                                                              class="ecosystem_item-link w-inline-block">
          <div class="icon-embed-xsmall eco-icon w-embed">
            <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none"
                 preserveAspectRatio="xMidYMid meet" aria-hidden="true" role="img">
              <path
                  d="M9 4.5H3.75L9.94565 12.7609L4.08746 19.4999H6.07498L10.8662 13.9883L15 19.5H20.25L13.7938 10.8917L19.3501 4.5H17.3626L12.8732 9.66434L9 4.5ZM15.75 18L6.75 6H8.25L17.25 18H15.75Z"
                  fill="currentColor" fill-opacity="1"></path>
            </svg>
          </div>
        </a><a href="#" class="ecosystem_item-link w-inline-block w-condition-invisible">
          <div class="icon-embed-xsmall eco-icon w-embed">
            <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none"
                 preserveAspectRatio="xMidYMid meet" aria-hidden="true" role="img">
              <path
                  d="M10.076 11C10.676 11 11.162 11.45 11.151 12C11.151 12.55 10.677 13 10.076 13C9.486 13 9 12.55 9 12C9 11.45 9.475 11 10.076 11ZM13.924 11C14.525 11 15 11.45 15 12C15 12.55 14.525 13 13.924 13C13.334 13 12.849 12.55 12.849 12C12.849 11.45 13.323 11 13.924 11ZM18.891 2C20.054 2 21 2.966 21 4.163V23L18.789 21.005L17.544 19.829L16.227 18.579L16.773 20.522H5.109C3.946 20.522 3 19.556 3 18.359V4.163C3 2.966 3.946 2 5.109 2H18.89H18.891ZM14.921 15.713C17.194 15.64 18.069 14.117 18.069 14.117C18.069 10.736 16.587 7.995 16.587 7.995C15.107 6.862 13.697 6.893 13.697 6.893L13.553 7.061C15.302 7.607 16.114 8.395 16.114 8.395C15.1591 7.85699 14.1066 7.51434 13.018 7.387C12.3274 7.309 11.6299 7.31572 10.941 7.407C10.879 7.407 10.827 7.418 10.766 7.428C10.406 7.46 9.531 7.596 8.431 8.09C8.051 8.268 7.824 8.395 7.824 8.395C7.824 8.395 8.678 7.565 10.529 7.019L10.426 6.893C10.426 6.893 9.017 6.862 7.536 7.996C7.536 7.996 6.055 10.736 6.055 14.117C6.055 14.117 6.919 15.639 9.192 15.713C9.192 15.713 9.572 15.241 9.882 14.842C8.575 14.442 8.082 13.602 8.082 13.602C8.082 13.602 8.184 13.676 8.369 13.781C8.379 13.791 8.389 13.802 8.41 13.812C8.441 13.834 8.472 13.844 8.503 13.865C8.76 14.012 9.017 14.127 9.253 14.222C9.675 14.39 10.179 14.558 10.766 14.674C11.6453 14.8464 12.5494 14.8498 13.43 14.684C13.9429 14.5925 14.4433 14.4411 14.921 14.233C15.281 14.096 15.682 13.896 16.104 13.613C16.104 13.613 15.59 14.474 14.242 14.863C14.551 15.262 14.922 15.713 14.922 15.713H14.921Z"
                  fill="currentColor" fill-opacity="1"></path>
            </svg>
          </div>
        </a><a :href="`${item.webaddr}`" target="_blank" class="ecosystem_item-link w-inline-block">
          <div class="icon-embed-xsmall eco-icon w-embed">
            <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none"
                 preserveAspectRatio="xMidYMid meet" aria-hidden="true" role="img">
              <path
                  d="M12 22C6.477 22 2 17.523 2 12C2 6.477 6.477 2 12 2C17.523 2 22 6.477 22 12C22 17.523 17.523 22 12 22ZM9.71 19.667C8.72341 17.5743 8.15187 15.3102 8.027 13H4.062C4.25659 14.5389 4.89392 15.9882 5.89657 17.1717C6.89922 18.3552 8.22401 19.2221 9.71 19.667V19.667ZM10.03 13C10.181 15.439 10.878 17.73 12 19.752C13.1523 17.6766 13.8254 15.3695 13.97 13H10.03V13ZM19.938 13H15.973C15.8481 15.3102 15.2766 17.5743 14.29 19.667C15.776 19.2221 17.1008 18.3552 18.1034 17.1717C19.1061 15.9882 19.7434 14.5389 19.938 13V13ZM4.062 11H8.027C8.15187 8.68979 8.72341 6.42569 9.71 4.333C8.22401 4.77788 6.89922 5.64475 5.89657 6.8283C4.89392 8.01184 4.25659 9.4611 4.062 11V11ZM10.031 11H13.969C13.8248 8.6306 13.152 6.32353 12 4.248C10.8477 6.32345 10.1746 8.63052 10.03 11H10.031ZM14.29 4.333C15.2766 6.42569 15.8481 8.68979 15.973 11H19.938C19.7434 9.4611 19.1061 8.01184 18.1034 6.8283C17.1008 5.64475 15.776 4.77788 14.29 4.333V4.333Z"
                  fill="currentColor" fill-opacity="1"></path>
            </svg>
          </div>
        </a></div>
      </div>
      <img :src="`${item.image}`"
           loading="lazy" width="Auto" alt=""
           sizes="(max-width: 479px) 77vw, (max-width: 767px) 370px, (max-width: 991px) 41vw, 30vw"
           :srcset="`${item.logo}`"
           class="ecosystem_item-banner">
    </div>
    <div class="ecosystem_item-description u-vflex-left-between u-gap-xsmall">
      <div class="w-layout-hflex u-hflex-left-center u-gap-xsmall">
        <div class="u-text-medium u-line-clamp-1 u-weight-medium"  style="color: #000; font-weight: 700;">{{item.name}}</div>
      </div>
      <div class="u-text-small u-color-secondary u-line-clamp-3">{{item.description}}
      </div>
      <div class="w-dyn-list">
        <div  v-if="item.tags" role="list" class="ecosystem_item-tags u-hflex-left-center u-gap-xxsmall w-dyn-items">
           <span
               v-for="(tag, index) in item.tags"
               :key="index"
               class="tag"
           >
          <div role="listitem" class="ecosystem_item-tag w-dyn-item">
            <div class="u-text-xsmall"  style="color: #000;">{{ tag }}</div>
          </div>
             </span>
        </div>
      </div>
    </div>
  </div>

</template>

  <script>
    export default {
      props: {
        item: {
          type: Object,
          required: true,
          default: () => ({
            image: '',
            category: '',
            logo: '',
            xaddr:'',
            webaddr:'',
            name: '',
            description: 'Project description',
            tags: [],
          })
        }
      }
    }
  </script>
