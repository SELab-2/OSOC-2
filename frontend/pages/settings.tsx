import {NextPage} from "next";
import SessionContext from "../contexts/sessionProvider";
import {useContext} from "react";
import {UnderConstruction} from "../components/UnderConstruction/UnderConstruction";


const Settings: NextPage = () => {
    const {getSessionKey, setSessionKey} = useContext(SessionContext);

    console.log(getSessionKey)
    console.log(setSessionKey)
    return (
        <div>
            Test
            <UnderConstruction/>
        </div>
    )
}

export default Settings;
