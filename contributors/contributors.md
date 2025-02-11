<script setup>
import { VPTeamMembers } from 'vitepress/theme'

const members = [
  {
    avatar: 'https://avatars.githubusercontent.com/u/16284115?s=400&u=421bf4e971a70e62fd9426e265a12eefc4aed991&v=4',
    name: 'Ian Xu',
    title: 'DevRel & Developer',
    links: [
      { icon: 'github', link: 'https://github.com/panyongxu1002' },
      { icon: 'twitter', link: 'https://twitter.com/imxy007' }
    ]
  },
 {
    avatar: 'https://avatars.githubusercontent.com/u/16130308?v=4',
    name: '小符',
    title: 'Blockchain Developer/Gopher/React',
    links: [
      { icon: 'github', link: 'https://github.com/smallfu6' },
      { icon: 'twitter', link: 'https://x.com/smallfu666' }
    ]
  },
]
</script>

# 社区贡献者们

Say hello 👋 to our awesome Contributors 🧑‍💻.

<VPTeamMembers size="small" :members="members" />
