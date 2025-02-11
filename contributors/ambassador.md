<script setup>
import { VPTeamMembers } from 'vitepress/theme'

const members = [
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

# 社区大使们

Say hello 👋 to our awesome Ambassador 🧑‍💻.
<VPTeamMembers size="small" :members="members" />
