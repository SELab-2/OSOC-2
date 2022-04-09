import {NextPage} from "next";
import SessionContext from "../contexts/sessionProvider";
import {useContext, useEffect, useState} from "react";
import {StudentCard} from "../components/StudentCard/StudentCard";
import {StudentFilter} from "../components/StudentFilter/StudentFilter";
import {Role} from "../types/types";


const Students: NextPage = () => {
    const {getSessionKey, setSessionKey} = useContext(SessionContext);
    //const [students, setStudents] = useState<Array<InternalTypes.Student>>([]);
    const [roles, setRoles] = useState<Array<Role>>([]);


    const fetchStudentsAndRoles = async () => {
        let sessionKey = getSessionKey != undefined ? getSessionKey() : ""
        const responseStudents = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/student/all`, {
            method: 'GET',
            headers: {
                'Authorization': `auth/osoc2 ${sessionKey}`
            }
        }).then(response => response.json()).catch(error => console.log(error));
        console.log(responseStudents);
        if (responseStudents.success) {
            sessionKey = responseStudents.sessionkey
        }
        const responseRoles = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/role/all`, {
            method: 'GET',
            headers: {
                'Authorization': `auth/osoc2 ${sessionKey}`
            }
        })
            .then(response => response.json()).then(json => {
                if (!json.success) {
                    //TODO popup van dat het is gefaald.
                    return {success: false};
                } else return json;
            })
            .catch(err => {
                console.log(err)
                //TODO popup van dat het is gefaald.
                return {success: false};
            });
        if (setSessionKey) {
            setSessionKey(responseRoles.sessionkey);
        }
        setRoles(responseRoles.data);
    }

    useEffect(() => {
        fetchStudentsAndRoles().then();
        // We do not want to reload the data when the data changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <StudentFilter roles={roles}/>
            <StudentCard student={undefined}/>
        </>
    )
}

export default Students;
