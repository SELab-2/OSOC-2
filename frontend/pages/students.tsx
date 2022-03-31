import {NextPage} from "next";
import {Header} from "../components/Header/Header";
import {StudentCard} from "../components/StudentCard/StudentCard";
import { GetStaticProps } from 'next';



export const getStaticProps: GetStaticProps = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/student/all`);
    const students = (await res.json());
    console.log(students);
    return {
        props: students
    }
}

const Students: NextPage = () => {
    return (
        <>
            <Header/>
            <StudentCard></StudentCard>
        </>
    )
}

export default Students;
