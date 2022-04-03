import React, { useState} from "react";
import Image, {StaticImageData} from "next/image";
import styles from "../UserButton/UserButton.module.css";


export const UserButton: (image1: StaticImageData, image2: StaticImageData, usage: string) => JSX.Element = (image1: StaticImageData, image2: StaticImageData, usage: string) => {


    //TODO logica voor elke button implementeren
    const [a, setA] = useState<number>(0);


    let image = <Image className={styles.buttonImage}
                       width={30}
                       height={30}
                       src={image1}
                       alt={"black and white version"}
    />
    if (a % 2 === 1) {
        image = <Image className={styles.buttonImage}
                       src={image2}
                       width={30}
                       height={30}
                       alt={"colored version"}

        />
    }
    return (<button className={styles.button}
                    onClick={() => {
                        setA(a + 1);
                        console.log(a);
                    }}>
            <span> {usage}
                <span>
                   {image}

                </span>
            </span>
    </button>)
}



