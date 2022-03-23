import styles from "./UnderConstruction.module.css";
import Image from "next/image";
import UnderConstructionImage from "../../public/images/under_construction_trans.png";
import React from "react";

export const UnderConstruction: React.FC = () => {
    return (<div className={styles.container}>
        <Image
            src={UnderConstructionImage}
            layout="responsive"
            alt="Site is still under construction"
        />
    </div>)
}
