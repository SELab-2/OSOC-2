import { Osoc } from "../components/Osoc/Osoc";
import { OsocEdition } from "../types/types";
import { NextPage } from "next";
import React, { useState } from "react";
import styles from "../styles/users.module.css";
import { OsocCreateFilter } from "../components/Osoc/OsocCreate";

/**
 * The `osoc edition` page, only accessible for admins
 * @constructor
 */
const Osocs: NextPage = () => {
    const [osoc_editions, setOsocs] = useState<Array<OsocEdition>>();

    const removeOsoc = (osoc: OsocEdition) => {
        if (osoc_editions !== undefined) {
            const index = osoc_editions.indexOf(osoc, 0);
            if (index > -1) {
                osoc_editions.splice(index, 1);
                setOsocs([...osoc_editions]);
            }
        }
    };
    const updateOsocEditions = (osocs: Array<OsocEdition>) => {
        setOsocs(osocs);
    };

    return (
        <div className={styles.body}>
            <div>
                <OsocCreateFilter updateOsoc={updateOsocEditions} />
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

export default Osocs;
