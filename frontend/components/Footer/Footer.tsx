import styles from "./Footer.module.css";
import React from "react";

export const Footer: React.FC = () => {

    return (
        <footer className={styles.footer}>
                <a href="https://selab-2.github.io/OSOC-2/">Documentation</a>
        </footer>
    )
}
