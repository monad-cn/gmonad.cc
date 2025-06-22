import { NextPage } from 'next';
import Head from 'next/head';
import styles from '../styles/Community.module.css';
import { Github } from 'lucide-react';

const Community: NextPage = () => {
    const projects = [
        {
            id: 1,
            title: '俄罗斯方块',
            description: '在 Monad 上玩俄罗斯方块多人对战游戏',
            url: 'https://tetrisx.vercel.app/',
            git: 'https://github.com/lispking/tetris',
            category: '链游'
        },
        {
            id: 2,
            title: '像素贪吃蛇',
            description: 'Monad 上的像素贪吃蛇游戏',
            url: 'https://pixel-snake-dx.vercel.app/',
            git: 'https://github.com/lispking/pixel-snake',
            category: '链游'
        },
        {
            id: 3,
            title: '像素宠物',
            description: '在 Monad 上生成您专属的像素宠物',
            url: 'https://pix-pet.netlify.app/',
            git: 'https://github.com/lispking/pix-pet',
            category: '链游'
        },
        {
            id: 4,
            title: 'Monad Gas 追踪器',
            description: '追踪和分析您在 Monad 上的 Gas 消耗',
            url: 'https://gas-dog.netlify.app/',
            git: 'https://github.com/lispking/gas-dog',
            category: '开发工具'
        },
        {
            id: 5,
            title: 'Monad 农场',
            description: '创新的 Monad 区块链虚拟农场游戏',
            url: 'https://meta-farm.vercel.app/',
            git: 'https://github.com/lispking/meta-farm',
            category: '链游'
        },
        {
            id: 5,
            title: 'Nads Pixel World 像素格子',
            description: 'Nads\' Home, Build and Powered by Community.',
            url: 'https://nads-pixel-world.vercel.app/',
            git: 'https://github.com/jjeejj/nads-pixel-world',
            category: '链游'
        },
        // 可以根据需要添加更多项目
    ];

    return (
        <div className={styles.container}>
            <Head>
                <title>社区项目 | Monad</title>
                <meta name="description" content="探索Monad生态系统中的社区项目" />
            </Head>

            <main className={styles.main}>
                <h1 className={styles.title}>社区项目</h1>
                <p className={styles.description}>
                    探索Monad社区打造的精彩项目
                </p>

                <div className={styles.grid}>
                    {projects.map((project) => (
                        <div className={styles.card}>
                            <a
                                key={project.id}
                                href={project.url}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <h2>{project.title} &rarr;</h2>
                                <p>{project.description}</p>
                                <span className={styles.category}>{project.category}</span>
                            </a>
                            <a href={project.git} target="_blank" rel="noopener noreferrer">
                                <Github className={styles.githubIcon} />
                            </a>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default Community;
