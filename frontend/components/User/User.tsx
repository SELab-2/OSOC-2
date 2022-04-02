import styles from "./User.module.css";
import AdminIcon from "../../public/images/admin_icon.png";
import AdminIconColor from "../../public/images/admin_icon_color.png";
import CoachIcon from "../../public/images/coach_icon.png";
import CoachIconColor from "../../public/images/coach_icon_color.png";
import ForbiddenIcon from "../../public/images/forbidden_icon.png";
import ForbiddenIconColor from "../../public/images/forbidden_icon_color.png";
import Image, {StaticImageData} from "next/image";
import React from "react";


export const User: React.FC = () => {
    //boilerplate for the admin/coaches route (pass admin/coach as string)
    const getAlluser = async (route: string) => {
        console.log(`${process.env.NEXT_PUBLIC_API_URL}/` + route + "/all")
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/` + route + "/all", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'sessionKey': 'TODO'
            }
        })
            .then(response => response.json()).then(json => {
                if (!json.success) {

                    //TODO logica van niet gelukt
                    return {success: false};
                } else return json;
            })
            .catch(err => {
                console.log(err)
                //TODO logica van niet gelukt
                return {success: false};
            });
        console.log(response)
    }
    //TODO dit moet nog afgewerkt worden
    function button(image1: StaticImageData, image2: StaticImageData, usage: string) {
        return (<button className={styles.button}>
            <span> {usage}
                <span>
                   <Image className={styles.buttonImage}
                          width={30}
                          height={30}
                          src={image1}
                          alt={"black and white version"}
                   />
                    <Image className={styles.displayNone}
                           src={image2}
                           width={30}
                           height={30}
                           alt={"colored version"}

                    />
                </span>
            </span>
        </button>)
    }
    //TODO dit sta hier voor tslint
    console.log(getAlluser("admin"))
    return (
        <div className={styles.row}>
            <div className={styles.column}>
                <p>name <b>[Status pending]</b></p>
            </div>
            <div className={styles.column}>
                <p>email</p>
            </div>
            <div className={styles.column}>
                {button(AdminIcon, AdminIconColor, "admin")}
                {button(CoachIcon, CoachIconColor, "coach")}
                {button(ForbiddenIcon, ForbiddenIconColor, "admin")}

            </div>
        </div>)
}
