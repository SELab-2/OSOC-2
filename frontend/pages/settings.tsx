import { NextPage } from "next";
import SessionContext from "../contexts/sessionProvider";
import { useContext, useEffect, useState } from "react";
import { AccountStatus, LoginUser } from "../types";
import { Settings } from "../components/Settings/Settings";

const SettingsPage: NextPage = () => {
    const { getSession } = useContext(SessionContext);

    const defaultUser: LoginUser = {
        person: {
            person_id: -1,
            email: "",
            name: "",
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
        const { sessionKey } =
            getSession !== undefined ? await getSession() : { sessionKey: "" };
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
        if (response !== undefined && response.success) {
            setUser(response.data.login_user);
        }
    };

    useEffect(() => {
        // We do not want to reload the data when the data changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div>
            <Settings person={user} fetchUser={fetchUser} />
        </div>
    );
};

export default SettingsPage;
