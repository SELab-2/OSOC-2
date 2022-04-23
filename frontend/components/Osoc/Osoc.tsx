import styles from "./Osoc.module.css";
import React, { SyntheticEvent, useContext, useState } from "react";
import SessionContext from "../../contexts/sessionProvider";
import { OsocEdition } from "../../types/types";

export const Osoc: React.FC<{
    osoc: OsocEdition;
    removeOsoc: (osoc: OsocEdition) => void;
}> = ({ osoc, removeOsoc }) => {
    const [year] = useState<number>(osoc.year);
    const { sessionKey, setSessionKey } = useContext(SessionContext);
    const osocId = osoc.osoc_id;

    const deleteOsoc = async (e: SyntheticEvent) => {
        e.preventDefault();
        await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/` +
                "admin/" +
                osocId.toString(),
            {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `auth/osoc2 ${sessionKey}`,
                },
            }
        )
            .then((response) => response.json())
            .then(async (json) => {
                if (!json.success) {
                    return { success: false };
                }
                if (setSessionKey) {
                    setSessionKey(json.sessionkey);
                }
                removeOsoc(osoc);
                return json;
            })
            .catch((err) => {
                console.log(err);
                return { success: false };
            });
    };

    return (
        <div className={styles.row}>
            <div className={styles.name}>
                <p>{year}</p>
            </div>

            <p>{year}</p>
            <button
                className={`delete ${styles.delete}`}
                onClick={deleteOsoc}
            />
        </div>
    );
};
