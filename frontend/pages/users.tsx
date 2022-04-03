import {NextPage} from "next";
import {Header} from "../components/Header/Header";
import {UsersComponent} from "../components/Users/Users";

const Users: NextPage = () => {
    return (
        <>
            <Header/>
            <UsersComponent>
            </UsersComponent>
        </>
    )
}

export default Users;
