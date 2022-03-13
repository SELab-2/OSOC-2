import type {NextPage} from 'next'
import styles from '../styles/login.module.css'
import Image from "next/image"
import {UnderConstruction} from "../components/UnderConstruction/UnderConstruction";
import LogoOsocColor from "../public/images/logo-osoc-color.svg"

const Login: NextPage = () => {
    return (
        <div>
            <header className={styles.header}>
                <div>
                    <div className={styles.imagecontainer}>
                        <Image
                            src={LogoOsocColor}
                            layout="intrinsic"
                            alt="OSOC Logo"
                        />
                    </div>
                    <h1>Selections</h1>
                </div>
            </header>
            <UnderConstruction/>
        </div>)
}

export default Login;
