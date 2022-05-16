import { Osoc } from "../components/Osoc/Osoc";
import { OsocEdition } from "../types";
import { NextPage } from "next";
import React, { useState } from "react";
import styles from "../styles/users.module.css";
import { OsocCreateFilter } from "../components/Filters/OsocFilter";

/**
 * The `osoc edition` page, only accessible for admins
 * @constructor
 */
const Osocs: NextPage = () => {
    const [osocEditions, setEditions] = useState<Array<OsocEdition>>([]);

    const removeOsoc = (osoc: OsocEdition) => {
        if (osocEditions !== undefined) {
            const index = osocEditions.indexOf(osoc, 0);
            if (index > -1) {
                osocEditions.splice(index, 1);
                setEditions([...osocEditions]);
            }
        }
    };
    const updateOsocEditions = (osocs: Array<OsocEdition>) => {
        setEditions(osocs);
    };

    return (
        <div className={styles.body}>
            <div>
                <OsocCreateFilter updateOsoc={updateOsocEditions} />
                {osocEditions !== undefined
                    ? osocEditions.map((osoc) => {
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
