
# 生态系统

<ClientOnly>

  <EcosystemCardList :items="cardItems"/>
</ClientOnly>

<script>
 import EcosystemCardList from '../.vitepress/components/EcosystemCardList.vue';

export default {
  components: { EcosystemCardList},
  data() {
    return {
      cardItems: [
        {
          image: 'https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/67b9106b6ca74a7001624998_0x_logo.webp',
          category: 'infra',
          logo:'https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/67b910681d1e917a4b1a10d9_0x_banner-p-1080.webp',
          name: '0x',
          xaddr: 'https://x.com/0xProject',
          webaddr:'https://0x.org/',  
          description: '0x allows you to embed swaps in any onchain app. Tap into aggregated liquidity from 130+ sources, best prices & optimal trade execution.',
          tags: ['Dev Tooling', 'Other Infra'],
        },
        {
          image: 'https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/67c620f4a0bab10af98e0508_ausd.webp',
          category: 'App/Infra',
          logo:'https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/67c620f148f4cde61d6cf7fb_ausd%20(1).webp',
          name: 'AUSD',
          xaddr: 'https://x.com/withAUSD',
          webaddr:'https://agora.finance',  
          description: 'Agora is a stablecoin issuer of AUSD, backed 1:1 by cash and cash equivalent reserves managed by VanEck and custodied by State Street.',
          tags: ['DeFi', 'RWA','Payments'],
        },
        {
          image: 'https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/67b9109d10f685d8b168f7ea_Accountable_logo.webp',
          category: 'App',
          logo:'https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/67b910bace65acecef527de2_Acurast_banner-p-1080.webp',
          name: 'Acurast',
          xaddr: 'https://x.com/AccountableData',
          webaddr:'https://game.accountable.capital/',  
          description: 'Crypto-based yields done right. Total privacy, full transparency, maximizing your yield opportunities, worry-free.',
          tags: ['DeFi', 'RWA'],
        }
      ]
    }
  }
}
</script>

