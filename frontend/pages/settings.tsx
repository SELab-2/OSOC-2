import { NextPage } from "next";
import SessionContext from "../contexts/sessionProvider";
import { useContext, useEffect, useState } from "react";
import { UnderConstruction } from "../components/UnderConstruction/UnderConstruction";
import { AccountStatus, LoginUser } from "../types/types";
import { SettingsComponent } from "../components/Settings/SettingsComponent";

const Settings: NextPage = () => {
    const { getSessionKey, setSessionKey } = useContext(SessionContext);
    const defaultUser: LoginUser = {
        person: {
            person_id: -1,
            email: "",
            firstname: "",
            lastname: "",
            github: "",
            github_id: 0,
        },
        login_user_id: -1,
        person_id: -1,
        is_admin: false,
        is_coach: false,
        account_status: AccountStatus.DISABLED,
    };

    const [user, setUser] = useState<LoginUser>(defaultUser);

    const fetchUser = async () => {
        const sessionKey =
            getSessionKey != undefined ? await getSessionKey() : "";
        console.log(sessionKey);
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/user/self`,
            {
                method: "GET",
                headers: {
                    Authorization: `auth/osoc2 ${sessionKey}`,
                },
            }
        )
            .then((response) => response.json())
            .catch((error) => console.log(error));
        console.log(response);
        if (response !== undefined && response.success) {
            if (setSessionKey) {
                setSessionKey(response.sessionkey);
            }
            setUser(response.data.login_user);
        }
    };

    useEffect(() => {
        fetchUser().then();
        // We do not want to reload the data when the data changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div>
            <SettingsComponent person={user} fetchUser={fetchUser} />
            <UnderConstruction />
        </div>
    );
};

export default Settings;
