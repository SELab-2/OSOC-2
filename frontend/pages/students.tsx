import {NextPage} from "next";
import {Header} from "../components/Header/Header";
import {StudentCard} from "../components/StudentCard/StudentCard";

const Students: NextPage = () => {
    return (
        <>
            <Header/>
            <StudentCard></StudentCard>
        </>
    )
}

export default Students;
