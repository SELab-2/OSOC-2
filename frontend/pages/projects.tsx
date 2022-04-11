/**
 * Projects overview page
 * TODO
 */
import {NextPage} from "next";
import {useContext, useEffect, useState} from "react";
import SessionContext from "../contexts/sessionProvider";
import {Project} from "../types/types"
import {ProjectCard} from "../components/ProjectCard/ProjectCard";

const Projects: NextPage = () => {
    const {getSessionKey, setSessionKey} = useContext(SessionContext);
    const [projects, setProjects] = useState<(Project)[]>([]);

    const fetchProjects = async () => {
        const sessionKey = getSessionKey != undefined ? getSessionKey() : ""
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/project/all`, {
            method: 'GET',
            headers: {
                'Authorization': `auth/osoc2 ${sessionKey}`
            }
        }).then(response => response.json()).catch(error => console.log(error));
        if (response !== undefined && response.success) {
            if (setSessionKey) {
                setSessionKey(response.sessionkey)
            }
            setProjects(response.data)
        }
    }

    const setProjectsHTML = () => {
        const array = []
        for (let i = 0; i < projects.length; i++) {
            const m = <ProjectCard project={projects[i]}/>
            array.push(m)
        }
        return array
    }
    useEffect(() => {
        fetchProjects().then();
        // We do not want to reload the data when the data changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div>
            {setProjectsHTML()}
        </div>
    )
}

export default Projects;
