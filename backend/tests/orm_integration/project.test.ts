import {
    CreateProject,
    FilterProjects,
    UpdateProject,
} from "../../orm_functions/orm_types";
import { getOsocByYear } from "../../orm_functions/osoc";
import {
    createProject,
    getAllProjects,
    getProjectByName,
    getProjectsByOsocEdition,
    getProjectsByPartner,
    getProjectsByStartDate,
    getProjectsByEndDate,
    getProjectsStartedBeforeDate,
    getProjectsStartedAfterDate,
    getProjectsEndedBeforeDate,
    getProjectsByNumberPositions,
    updateProject,
    deleteProject,
    deleteProjectByOsocEdition,
    deleteProjectByPartner,
    getProjectsLessPositions,
    getProjectsMorePositions,
    filterProjects,
} from "../../orm_functions/project";

const project1: CreateProject = {
    name: "test-project",
    osocId: 0,
    partner: "test-partner",
    startDate: new Date("2022-07-13"),
    endDate: new Date("2022-07-15"),
    positions: 7,
};

const project2: UpdateProject = {
    projectId: 2,
    name: "different-test",
    osocId: 0,
    partner: "different-partner",
    startDate: new Date("2022-08-13"),
    endDate: new Date("2022-08-15"),
    positions: 8,
};

const filteredProject1: FilterProjects = {
    project_id: 1,
    name: "project 1",
    osoc_id: 1,
    partner: "partner 1",
    start_date: new Date("2022-08-13"),
    end_date: new Date("2022-08-15"),
    positions: 8,
    description: "description 1",
    project_role: [
        {
            positions: 3,
            role: {
                name: "Front-end developer",
            },
            _count: {
                contract: 3,
            },
        },
        {
            positions: 5,
            role: {
                name: "Back-end developer",
            },
            _count: {
                contract: 3,
            },
        },
    ],
    project_user: [
        {
            login_user: {
                login_user_id: 1,
                is_coach: true,
            },
        },
        {
            login_user: {
                login_user_id: 2,
                is_coach: true,
            },
        },
    ],
};

import "../integration_setup";

it("should create 1 new project where osoc is 2022", async () => {
    const osoc = await getOsocByYear(2022);
    if (osoc) {
        project1.osocId = osoc.osoc_id;
        const project0: CreateProject = {
            name: "test-project",
            osocId: osoc.osoc_id,
            partner: "test-partner",
            startDate: new Date("2022-07-13"),
            endDate: new Date("2022-07-15"),
            positions: 7,
        };

        const created_project = await createProject(project0);
        expect(created_project).toHaveProperty("name", project0.name);
        expect(created_project).toHaveProperty("osoc_id", project0.osocId);
        expect(created_project).toHaveProperty("partner", project0.partner);
        expect(created_project).toHaveProperty(
            "start_date",
            project0.startDate
        );
        expect(created_project).toHaveProperty("end_date", project0.endDate);
        expect(created_project).toHaveProperty("positions", project0.positions);
    }
});

it("should find all the projects in the db, 3 in total", async () => {
    const searched_projects = await getAllProjects();
    expect(searched_projects.length).toEqual(4);
    expect(searched_projects[3]).toHaveProperty("name", project1.name);
    expect(searched_projects[3]).toHaveProperty("osoc_id", project1.osocId);
    expect(searched_projects[3]).toHaveProperty("partner", project1.partner);
    expect(searched_projects[3]).toHaveProperty(
        "start_date",
        project1.startDate
    );
    expect(searched_projects[3]).toHaveProperty("end_date", project1.endDate);
    expect(searched_projects[3]).toHaveProperty(
        "positions",
        project1.positions
    );
});

it("should return the project, by searching for its name", async () => {
    const searched_project = await getProjectByName(project1.name);
    expect(searched_project[0]).toHaveProperty("name", project1.name);
    expect(searched_project[0]).toHaveProperty("osoc_id", project1.osocId);
    expect(searched_project[0]).toHaveProperty("partner", project1.partner);
    expect(searched_project[0]).toHaveProperty(
        "start_date",
        project1.startDate
    );
    expect(searched_project[0]).toHaveProperty("end_date", project1.endDate);
    expect(searched_project[0]).toHaveProperty("positions", project1.positions);
});

it("should return the project, by searching for its osoc edition", async () => {
    const osoc = await getOsocByYear(2022);
    if (osoc) {
        const searched_project = await getProjectsByOsocEdition(osoc.osoc_id);
        expect(searched_project[1]).toHaveProperty("name", project1.name);
        expect(searched_project[1]).toHaveProperty("osoc_id", project1.osocId);
        expect(searched_project[1]).toHaveProperty("partner", project1.partner);
        expect(searched_project[1]).toHaveProperty(
            "start_date",
            project1.startDate
        );
        expect(searched_project[1]).toHaveProperty(
            "end_date",
            project1.endDate
        );
        expect(searched_project[1]).toHaveProperty(
            "positions",
            project1.positions
        );
    }
});

it("should return the projects, by searching for its partner name", async () => {
    const searched_projects = await getProjectsByPartner(project1.partner);
    expect(searched_projects[0]).toHaveProperty("name", project1.name);
    expect(searched_projects[0]).toHaveProperty("osoc_id", project1.osocId);
    expect(searched_projects[0]).toHaveProperty("partner", project1.partner);
    expect(searched_projects[0]).toHaveProperty(
        "start_date",
        project1.startDate
    );
    expect(searched_projects[0]).toHaveProperty("end_date", project1.endDate);
    expect(searched_projects[0]).toHaveProperty(
        "positions",
        project1.positions
    );
});

it("should return the projects, by searching for its start date", async () => {
    const searched_projects = await getProjectsByStartDate(project1.startDate);
    expect(searched_projects[0]).toHaveProperty("name", project1.name);
    expect(searched_projects[0]).toHaveProperty("osoc_id", project1.osocId);
    expect(searched_projects[0]).toHaveProperty("partner", project1.partner);
    expect(searched_projects[0]).toHaveProperty(
        "start_date",
        project1.startDate
    );
    expect(searched_projects[0]).toHaveProperty("end_date", project1.endDate);
    expect(searched_projects[0]).toHaveProperty(
        "positions",
        project1.positions
    );
});

it("should return the projects, by searching for its end date", async () => {
    const searched_projects = await getProjectsByEndDate(project1.endDate);
    expect(searched_projects[0]).toHaveProperty("name", project1.name);
    expect(searched_projects[0]).toHaveProperty("osoc_id", project1.osocId);
    expect(searched_projects[0]).toHaveProperty("partner", project1.partner);
    expect(searched_projects[0]).toHaveProperty(
        "start_date",
        project1.startDate
    );
    expect(searched_projects[0]).toHaveProperty("end_date", project1.endDate);
    expect(searched_projects[0]).toHaveProperty(
        "positions",
        project1.positions
    );
});

it("should return the projects, by searching for all projects starting before date", async () => {
    const searched_projects = await getProjectsStartedBeforeDate(
        new Date("2022-07-31")
    );
    expect(searched_projects[1]).toHaveProperty("name", project1.name);
    expect(searched_projects[1]).toHaveProperty("osoc_id", project1.osocId);
    expect(searched_projects[1]).toHaveProperty("partner", project1.partner);
    expect(searched_projects[1]).toHaveProperty(
        "start_date",
        project1.startDate
    );
    expect(searched_projects[1]).toHaveProperty("end_date", project1.endDate);
    expect(searched_projects[1]).toHaveProperty(
        "positions",
        project1.positions
    );
});

it("should return the projects, by searching for all projects starting after date", async () => {
    const searched_projects = await getProjectsStartedAfterDate(
        new Date("2022-07-01")
    );
    expect(searched_projects[2]).toHaveProperty("name", project1.name);
    expect(searched_projects[2]).toHaveProperty("osoc_id", project1.osocId);
    expect(searched_projects[2]).toHaveProperty("partner", project1.partner);
    expect(searched_projects[2]).toHaveProperty(
        "start_date",
        project1.startDate
    );
    expect(searched_projects[2]).toHaveProperty("end_date", project1.endDate);
    expect(searched_projects[2]).toHaveProperty(
        "positions",
        project1.positions
    );
});

it("should return the projects, by searching for all projects ending before date", async () => {
    const searched_projects = await getProjectsEndedBeforeDate(
        new Date("2022-07-31")
    );
    expect(searched_projects[1]).toHaveProperty("name", project1.name);
    expect(searched_projects[1]).toHaveProperty("osoc_id", project1.osocId);
    expect(searched_projects[1]).toHaveProperty("partner", project1.partner);
    expect(searched_projects[1]).toHaveProperty(
        "start_date",
        project1.startDate
    );
    expect(searched_projects[1]).toHaveProperty("end_date", project1.endDate);
    expect(searched_projects[1]).toHaveProperty(
        "positions",
        project1.positions
    );
});

it("should return the projects, by searching for all projects ending after date", async () => {
    const searched_projects = await getProjectsEndedBeforeDate(
        new Date("2022-07-31")
    );
    expect(searched_projects[1]).toHaveProperty("name", project1.name);
    expect(searched_projects[1]).toHaveProperty("osoc_id", project1.osocId);
    expect(searched_projects[1]).toHaveProperty("partner", project1.partner);
    expect(searched_projects[1]).toHaveProperty(
        "start_date",
        project1.startDate
    );
    expect(searched_projects[1]).toHaveProperty("end_date", project1.endDate);
    expect(searched_projects[1]).toHaveProperty(
        "positions",
        project1.positions
    );
});

it("should return the projects, by searching for its number of positions", async () => {
    const searched_projects = await getProjectsByNumberPositions(
        project1.positions
    );
    expect(searched_projects[0]).toHaveProperty("name", project1.name);
    expect(searched_projects[0]).toHaveProperty("osoc_id", project1.osocId);
    expect(searched_projects[0]).toHaveProperty("partner", project1.partner);
    expect(searched_projects[0]).toHaveProperty(
        "start_date",
        project1.startDate
    );
    expect(searched_projects[0]).toHaveProperty("end_date", project1.endDate);
    expect(searched_projects[0]).toHaveProperty(
        "positions",
        project1.positions
    );
});

it("should return the projects, by searching for all projects with less positions", async () => {
    const searched_projects = await getProjectsLessPositions(
        project1.positions + 1
    );
    expect(searched_projects[0]).toHaveProperty("name", project1.name);
    expect(searched_projects[0]).toHaveProperty("osoc_id", project1.osocId);
    expect(searched_projects[0]).toHaveProperty("partner", project1.partner);
    expect(searched_projects[0]).toHaveProperty(
        "start_date",
        project1.startDate
    );
    expect(searched_projects[0]).toHaveProperty("end_date", project1.endDate);
    expect(searched_projects[0]).toHaveProperty(
        "positions",
        project1.positions
    );
});

it("should return the projects, by searching for all projects with more positions", async () => {
    const searched_projects = await getProjectsMorePositions(
        project1.positions - 1
    );
    expect(searched_projects[3]).toHaveProperty("name", project1.name);
    expect(searched_projects[3]).toHaveProperty("osoc_id", project1.osocId);
    expect(searched_projects[3]).toHaveProperty("partner", project1.partner);
    expect(searched_projects[3]).toHaveProperty(
        "start_date",
        project1.startDate
    );
    expect(searched_projects[3]).toHaveProperty("end_date", project1.endDate);
    expect(searched_projects[3]).toHaveProperty(
        "positions",
        project1.positions
    );
});

it("should update project based upon project id", async () => {
    const searched_project = await getProjectByName(project1.name);
    project2.projectId = searched_project[0].project_id;
    project2.osocId = project1.osocId;
    const updated_project = await updateProject(project2);
    expect(updated_project).toHaveProperty("name", project2.name);
    expect(updated_project).toHaveProperty("osoc_id", project2.osocId);
    expect(updated_project).toHaveProperty("partner", project2.partner);
    expect(updated_project).toHaveProperty("start_date", project2.startDate);
    expect(updated_project).toHaveProperty("end_date", project2.endDate);
    expect(updated_project).toHaveProperty("positions", project2.positions);
});

it("should delete the project based upon project id", async () => {
    const deleted_project = await deleteProject(project2.projectId);
    expect(deleted_project).toHaveProperty("name", project2.name);
    expect(deleted_project).toHaveProperty("osoc_id", project2.osocId);
    expect(deleted_project).toHaveProperty("partner", project2.partner);
    expect(deleted_project).toHaveProperty("start_date", project2.startDate);
    expect(deleted_project).toHaveProperty("end_date", project2.endDate);
    expect(deleted_project).toHaveProperty("positions", project2.positions);
});

it("should delete the project based upon project partner", async () => {
    const deleted_project = await deleteProjectByPartner("partner-test-2");
    expect(deleted_project).toHaveProperty("count", 1);
});

it("should delete the project based upon osoc id", async () => {
    const osoc = await getOsocByYear(2023);
    if (osoc) {
        const deleted_project = await deleteProjectByOsocEdition(osoc.osoc_id);
        expect(deleted_project).toHaveProperty("count", 1);
    }
});

it("should return the filtered projects", async () => {
    let sumRoles = 0;
    for (const role of filteredProject1.project_role) {
        sumRoles += role.positions;
    }

    const filtered_projects = await filterProjects(
        filteredProject1.name,
        filteredProject1.partner,
        filteredProject1.project_user.map(
            (user) => user.login_user.login_user_id
        ),
        filteredProject1.positions === sumRoles,
        "asc",
        "desc",
        "asc"
    );

    for (const project of filtered_projects) {
        expect(project).toHaveProperty("name", filteredProject1.name);
        expect(project).toHaveProperty("partner", filteredProject1.partner);
        expect(project).toHaveProperty("positions", filteredProject1.positions);
        expect(project).toHaveProperty(
            "description",
            filteredProject1.description
        );
        expect(project).toHaveProperty(
            "project_id",
            filteredProject1.project_id
        );
        expect(project).toHaveProperty("osoc_id", filteredProject1.osoc_id);
        expect(project).toHaveProperty(
            "project_role",
            filteredProject1.project_role
        );
        expect(project).toHaveProperty("end_date", filteredProject1.end_date);
        expect(project).toHaveProperty(
            "start_date",
            filteredProject1.start_date
        );
        expect(project).toHaveProperty(
            "project_user",
            filteredProject1.project_user
        );
    }
});
