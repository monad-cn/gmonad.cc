<script setup>
import './card.css'

defineProps({
  title: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  logo: {
    type: String,
    required: true
  },
  twitter: {
    type: String,
    required: true
  },
  globe: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  tags: {
    type: Array,
    default: () => []
  },
  category: {
    type: String,
    default: 'App/Infra'
  }
})
</script>

<template>
  <div class="info-card">
    <div class="info-card__header">
      <div class="info-card__image-wrapper">
        <img class="info-card__image" :src="image" alt="Image" >
	  </div>
      <div class="info-card__header-right">
        <span class="info-card__category">{{ category }}</span>
        <div class="info-card__icons">
		  <a class="info-card__icon-twitter" :href="twitter" target="_blank">
		    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke-width="2">
			  <path d="M9 4.5H3.75L9.94565 12.7609L4.08746 19.4999H6.07498L10.8662 13.9883L15 19.5H20.25L13.7938 10.8917L19.3501 4.5H17.3626L12.8732 9.66434L9 4.5ZM15.75 18L6.75 6H8.25L17.25 18H15.75Z" fill="currentColor" fill-opacity="1"></path>
            </svg>
		  </a>
		  <a class="info-card__icon-globe" :href="globe" target="_blank">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
			  <path d="M12 22C6.477 22 2 17.523 2 12C2 6.477 6.477 2 12 2C17.523 2 22 6.477 22 12C22 17.523 17.523 22 12 22ZM9.71 19.667C8.72341 17.5743 8.15187 15.3102 8.027 13H4.062C4.25659 14.5389 4.89392 15.9882 5.89657 17.1717C6.89922 18.3552 8.22401 19.2221 9.71 19.667V19.667ZM10.03 13C10.181 15.439 10.878 17.73 12 19.752C13.1523 17.6766 13.8254 15.3695 13.97 13H10.03V13ZM19.938 13H15.973C15.8481 15.3102 15.2766 17.5743 14.29 19.667C15.776 19.2221 17.1008 18.3552 18.1034 17.1717C19.1061 15.9882 19.7434 14.5389 19.938 13V13ZM4.062 11H8.027C8.15187 8.68979 8.72341 6.42569 9.71 4.333C8.22401 4.77788 6.89922 5.64475 5.89657 6.8283C4.89392 8.01184 4.25659 9.4611 4.062 11V11ZM10.031 11H13.969C13.8248 8.6306 13.152 6.32353 12 4.248C10.8477 6.32345 10.1746 8.63052 10.03 11H10.031ZM14.29 4.333C15.2766 6.42569 15.8481 8.68979 15.973 11H19.938C19.7434 9.4611 19.1061 8.01184 18.1034 6.8283C17.1008 5.64475 15.776 4.77788 14.29 4.333V4.333Z" fill="currentColor" fill-opacity="1"></path>
            </svg>
          </a>
        </div>
      </div>
    </div>
    <div class="info-card__content">
      <div class="info-card__logo-wrapper">
        <img class="info-card__logo" :src="logo" alt="Logo" width="64" height="64"/>
      </div>
      <div class="info-card__title">{{ title }}</div>
      <p class="info-card__description">{{ description }}</p>
      <div class="info-card__tags">
        <span v-for="(tag, index) in tags" :key="index" class="info-card__tag">
          {{ tag }}
        </span>
      </div>
    </div>
  </div>
</template>


