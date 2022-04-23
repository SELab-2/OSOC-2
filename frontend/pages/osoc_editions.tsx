import { Osoc } from "../components/Osoc/Osoc";
import { OsocEdition } from "../types/types";
import { NextPage } from "next";
import React, { useContext, useEffect, useState } from "react";
import styles from "../styles/users.module.css";
import SessionContext from "../contexts/sessionProvider";

/**
 * The `osoc edition` page, only accessible for admins
 * @constructor
 */
const Osoc_editions: NextPage = () => {
    const { getSessionKey, setSessionKey } = useContext(SessionContext);
    const [osoc_editions, setOsocs] = useState<Array<OsocEdition>>();

    const fetchOsocEditions = async () => {
        if (getSessionKey !== undefined) {
            getSessionKey().then(async (sessionKey) => {
                if (sessionKey !== "") {
                    const response = await fetch(
                        `${process.env.NEXT_PUBLIC_API_URL}/osoc/all`,
                        {
                            method: "GET",
                            headers: {
                                Authorization: `auth/osoc2 ${sessionKey}`,
                            },
                        }
                    )
                        .then((response) => response.json())
                        .catch((error) => console.log(error));
                    if (response !== undefined && response.success) {
                        if (setSessionKey) {
                            setSessionKey(response.sessionkey);
                        }
                        setOsocs(response.data);
                    }
                }
            });
        }
    };

    useEffect(() => {
        fetchOsocEditions().then();
        // We do not want to reload the data when the data changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const removeOsoc = (osoc: OsocEdition) => {
        if (osoc_editions !== undefined) {
            const index = osoc_editions.indexOf(osoc, 0);
            if (index > -1) {
                osoc_editions.splice(index, 1);
                setOsocs([...osoc_editions]);
            }
        }
    };

    return (
        <div className={styles.body}>
            <div>
                {osoc_editions !== undefined
                    ? osoc_editions.map((osoc) => {
                          return (
                              <Osoc
                                  osoc={osoc}
                                  key={osoc.osoc_id}
                                  removeOsoc={removeOsoc}
                              />
                          );
                      })
                    : null}
            </div>
        </div>
    );
};

export default Osoc_editions;
