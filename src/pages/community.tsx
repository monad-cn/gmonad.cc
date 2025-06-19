import { NextPage } from 'next';
import Head from 'next/head';
import styles from '../styles/Community.module.css';

const Community: NextPage = () => {
    const projects = [
        {
            id: 1,
            title: 'TetrisX',
            description: 'Play Tetris PvP on the Monad',
            url: 'https://tetrisx.vercel.app/',
            category: 'GameFi'
        },
        {
            id: 2,
            title: 'Pixel Snake',
            description: 'Pixel Snake on the Monad',
            url: 'https://pixel-snake-dx.vercel.app/',
            category: 'GameFi'
        },
        {
            id: 3,
            title: 'Pixel Pet',
            description: 'Generate Pixel Pet on the Monad',
            url: 'https://pix-pet.netlify.app/',
            category: 'GameFi'
        },
        {
            id: 4,
            title: 'Monad Gas Tracker',
            description: 'Track and analyze your gas consumption on Monad',
            url: 'https://gas-dog.netlify.app/',
            category: 'Development'
        },
        {
            id: 5,
            title: 'Meta Farm',
            description: 'An innovative Monad blockchain virtual farm game',
            url: 'https://meta-farm.vercel.app/',
            category: 'GameFi'
        },
        // Add more projects as needed
    ];

    return (
        <div className={styles.container}>
            <Head>
                <title>Community Projects | Monad</title>
                <meta name="description" content="Explore community projects in the Monad ecosystem" />
            </Head>

            <main className={styles.main}>
                <h1 className={styles.title}>Community Projects</h1>
                <p className={styles.description}>
                    Discover amazing projects built by the Monad community
                </p>

                <div className={styles.grid}>
                    {projects.map((project) => (
                        <a
                            key={project.id}
                            href={project.url}
                            className={styles.card}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <h2>{project.title} &rarr;</h2>
                            <p>{project.description}</p>
                            <span className={styles.category}>{project.category}</span>
                        </a>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default Community;
