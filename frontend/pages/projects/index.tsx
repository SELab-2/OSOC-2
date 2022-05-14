import { NextPage } from "next";
import { Projects } from "../../components/Projects/Projects";
import { Students } from "../../components/Students/Students";
import styles from "../../styles/projects.module.scss";

const Index: NextPage = () => {
    return (
        <div className={styles.body}>
            <Students alwaysLimited={true} />
            <Projects />
        </div>
    );
};

export default Index;
