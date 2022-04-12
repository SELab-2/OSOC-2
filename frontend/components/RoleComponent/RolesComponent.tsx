import styles from "./RoleComponent.module.css";
import React, { SyntheticEvent} from "react";
import {Role} from "../../types/types";

export const RolesComponent: React.FC<{ role: Role, setSelected: (newRoles: string) => void }> = ({
                                                                                             role,
                                                                                             setSelected

                                                                                         }) => {

    const onClick = (e: SyntheticEvent) => {
        e.preventDefault()
        setSelected(role.name)
    }
    return (
        <div className={styles.filter}>
            <button onClick={onClick}> {role.name}</button>
        </div>)
}