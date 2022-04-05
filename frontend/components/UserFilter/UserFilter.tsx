import styles from "./UserFilter.module.css";
import React from "react";
import Image from "next/image";
import AdminIconColor from "../../public/images/admin_icon_color.png";
//import CoachIconColor from "../../public/images/coach_icon_color.png"
//import ForbiddenIconColor from "../../public/images/forbidden_icon_color.png"
import Filter from "../../public/images/filter.png"
//import ArrowUp from "../../public/images/arrow_up.png"
//import ArrowDown from "../../public/images/arrow_down.png"

export const UserFilter: React.FC = () => {

    const filter = () => {
        console.log("aaa")
    }
    return (
        <div>
            <button className={styles.button}>Names
                <Image className={styles.buttonImage}
                       src={Filter}
                       width={15} height={30} alt={"Disabled"}
                       onClick={filter}/>
            </button>
            <input type="text" placeholder="Will smith"/>
            <button className={styles.button}>Email</button>
            <input type="text" placeholder="Search.."/>
            <button className={styles.button}>Account Status</button>

            <div className={styles.dropdown}>
                <Image src={Filter} width={30} height={30} className={styles.dropbtn} alt={"Disabled"}>
                </Image>

                <div className={styles.dropdownContent}>
                    <a>
                        <Image className={styles.buttonImage}
                               src={AdminIconColor}
                               width={30} height={30} alt={"Disabled"}
                               onClick={filter}/>
                    </a>

                </div>
            </div>

        </div>)
}
