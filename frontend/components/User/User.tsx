import styles from "./User.module.css";

export const User: React.FC = () => {
    //boilerplate for the admin/coaches route (pass admin/coach as string)
    const getAlluser = async (route: string) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/` + route, {
            method: 'GET',
            //body: JSON.stringify({pass: loginPassword, name: loginEmail}),
            body: JSON.stringify({sessionKey: "TODO"}),
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        })
            .then(response => response.json()).then(json => {
                if (!json.success) {

                    //TODO logica van niet gelukt
                    return {success: false};
                } else return json;
            })
            .catch(err => {
                console.log(err)
                //TODO logica van niet gelukt
                return {success: false};
            });
        console.log(response)
    }

    console.log(getAlluser("admin"))
    return (<div className={styles.container}>
        <h1>Users</h1>
    </div>)
}
