import {NextPage} from "next";
import {Header} from "../components/Header/Header";
import {StudentCard} from "../components/StudentCard/StudentCard";
import SessionContext from "../contexts/sessionProvider";
import {useContext, useEffect} from "react";


const Students: NextPage = () => {
    const {sessionKey} = useContext(SessionContext);
    //const [students, setStudents] = useState<Array<InternalTypes.Student>>([]);

    useEffect(() => {
        const fetchData = async () => {
            //console.log(sessionKey);
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/student/all`, {
                method: 'GET',
                body: JSON.stringify({sessionkey: sessionKey}), //TODO Autherize the user
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                }
            });
            console.log(response)
        }

        fetchData();
    });
    
    return (
        <>
            <Header/>
            <StudentCard></StudentCard>
        </>
    )
}

export default Students;
