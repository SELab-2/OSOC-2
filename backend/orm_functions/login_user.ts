import prisma from '../prisma/prisma'


// Create Login User
export function create_login_user(person_id, password, is_admin, is_coach, ){
    prisma.login_user.create({
        data: {
            person_id: person_id,
            password: password,
            is_admin: is_admin,
            is_coach: is_coach
        },
    })
}

// Search Login User by Person
export function search_login_user_by_person(search_string){
    prisma.login_user.findMany({
        where: { person_id : search_string },
    })
}

// Search all admin Login User
export function search_all_admin_login_users(search){
    prisma.login_user.findMany({
        where: { is_admin : search },
    })
}

// Search all coach Login User
export function search_all_coach_login_users(search){
    prisma.login_user.findMany({
        where: { is_coach : search },
    })
}

// Search all coach Login User
export function search_all_admin_and_coach_login_users(search){
    prisma.login_user.findMany({
        where: { 
            AND: [
                {
                    is_admin: search
                },
                {
                    is_coach: search
                },
            ],
        }
    })
}

// Remove Login User by id
export function delete_login_user_by_id(delete_id){
    prisma.login_user.deleteMany({
        where: { login_user_id: delete_id }
    })
}

// Remove Login User by Person id
export function delete_login_user_by_person_id(delete_id){
    prisma.login_user.deleteMany({
        where: { person_id: delete_id},
    })
}
