import type {NextPage} from 'next'
import Image from 'next/image'
import UnderConstructionImage from '../public/images/under_construction_trans.png'
import styles from '../styles/index.module.css'

const Home: NextPage = () => {
    return (
        <div className={styles.container}>
            <Image
                src={UnderConstructionImage}
                layout="responsive"
                alt="Site is still under construction"
            />
        </div>)
}

export default Home;
