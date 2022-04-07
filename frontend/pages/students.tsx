import {NextPage} from "next";
import SessionContext from "../contexts/sessionProvider";
import {useContext, useEffect} from "react";
import {StudentCard} from "../components/StudentCard/StudentCard";
import {StudentFilter} from "../components/StudentFilter/StudentFilter";


const Students: NextPage = () => {
    const {getSessionKey, setSessionKey} = useContext(SessionContext);
    //const [students, setStudents] = useState<Array<InternalTypes.Student>>([]);

    const fetchStudents = async () => {
        const sessionKey = getSessionKey != undefined ? getSessionKey() : ""
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/student/all`, {
            method: 'GET',
            headers: {
                'Authorization': `auth/osoc2 ${sessionKey}`
            }
        }).then(response => response.json()).catch(error => console.log(error));
        console.log(response);
        if (response.success) {
            if (setSessionKey) {
                setSessionKey(response.sessionkey)
            }
        }
    }

    useEffect(() => {
        fetchStudents().then();
        // We do not want to reload the data when the data changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <StudentFilter/>
            <StudentCard student={undefined}/>
        </>
    )
}

export default Students;
