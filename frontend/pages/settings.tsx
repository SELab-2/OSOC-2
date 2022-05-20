import { NextPage } from "next";
import SessionContext from "../contexts/sessionProvider";
import { useContext, useEffect, useState } from "react";
import { AccountStatus, LoginUser, NotificationType } from "../types";
import { Settings } from "../components/Settings/Settings";
import { NotificationContext } from "../contexts/notificationProvider";

const SettingsPage: NextPage = () => {
    const { getSession } = useContext(SessionContext);

    const defaultUser: LoginUser = {
        person: {
            person_id: -1,
            email: "",
            name: "",
            github: "",
        },
        login_user_id: -1,
        is_admin: false,
        is_coach: false,
        account_status: AccountStatus.DISABLED,
    };

    const [user, setUser] = useState<LoginUser>(defaultUser);
    const { notify } = useContext(NotificationContext);

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
            .catch((err) => {
                console.log(err);
            });
        if (response !== undefined && response.success) {
            setUser(response);
        } else if (response && !response.success && notify) {
            notify(
                "Something went wrong:" + response.reason,
                NotificationType.ERROR,
                2000
            );
        }
    };

    useEffect(() => {
        fetchUser().then();
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
