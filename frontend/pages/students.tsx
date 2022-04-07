import {NextPage} from "next";
import {UnderConstruction} from "../components/UnderConstruction/UnderConstruction";
import SessionContext from "../contexts/sessionProvider";
import {useContext, useEffect} from "react";


const Students: NextPage = () => {
    const {sessionKey} = useContext(SessionContext);
    //const [students, setStudents] = useState<Array<InternalTypes.Student>>([]);

    const fetchData = async () => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/student/all`, {
            method: 'GET',
            headers: {
                'Authorization': `auth/osoc2 ${sessionKey}`
            }
        });
        console.log(response);
    }

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <>
            <UnderConstruction/>
        </>
    )
}

export default Students;
