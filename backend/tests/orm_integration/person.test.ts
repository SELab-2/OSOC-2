import prisma from '../../prisma/prisma'
import {CreatePerson} from "../../orm_functions/orm_types";
import {createPerson} from "../../orm_functions/person";

beforeAll(async () => {

    // create products
    await prisma.person.createMany({
        data: [
            {
                email: 'email@testmail.com',
                firstname: "firstNameTest",
                lastname: "lastNameTest",
                gender: "Male"
            },
            {
                github: "test@github.com",
                firstname: "firstNameTest2",
                lastname: "lastNameTest2",
                gender: "Female"
            },
        ],
    })

    // // create the customer
    // await prisma.customer.create({
    //     data: {
    //         name: 'Harry Potter',
    //         email: 'harry@hogwarts.io',
    //         address: '4 Privet Drive',
    //     },
    // })
    //
    // console.log('✨ 1 customer successfully created!')
})

afterAll(async () => {
    const deleteLanguageDetails = prisma.language.deleteMany();
    const deleteJobApplicationSkillDetails = prisma.job_application_skill.deleteMany();
    const deleteAttachmentDetails = prisma.attachment.deleteMany();
    const deleteAppliedRoleDetails = prisma.applied_role.deleteMany();
    const deleteEvaluationDetails = prisma.evaluation.deleteMany();
    const deleteApplicationDetails = prisma.job_application.deleteMany();
    // const deleteSessionKeysDetails = prisam.session_keys.deleteMany();
    const deleteProjectUserDetails = prisma.project_user.deleteMany();
    const deleteContractDetails = prisma.contract.deleteMany();
    const deleteProjectRoleDetails = prisma.project_role.deleteMany();
    const deleteProjectDetails = prisma.project.deleteMany();
    const deleteOsocDetails = prisma.osoc.deleteMany();
    const deleteStudentDetails = prisma.student.deleteMany();
    const deleteLoginUserDetails = prisma.login_user.deleteMany();
    const deleteRoleDetails = prisma.role.deleteMany();
    const deletePersonDetails = prisma.person.deleteMany();

    await prisma.$transaction([
        deleteLanguageDetails,
        deleteJobApplicationSkillDetails,
        deleteAttachmentDetails,
        deleteAppliedRoleDetails,
        deleteEvaluationDetails,
        deleteApplicationDetails,
        //deleteSessionKeysDetails,
        deleteProjectUserDetails,
        deleteContractDetails,
        deleteProjectRoleDetails,
        deleteProjectDetails,
        deleteOsocDetails,
        deleteStudentDetails,
        deleteLoginUserDetails,
        deleteRoleDetails,
        deletePersonDetails,
    ])

    await prisma.$disconnect()
})

it('should create 1 new person', async () => {
    const person: CreatePerson = {
        email: "test@email.be",
        firstname: "first_name",
        lastname: "last_name",
        gender: "Male"
    }

    const created_person = await createPerson(person);
    expect(created_person).toHaveProperty("github", null);
    expect(created_person).toHaveProperty("firstname", person.firstname);
    // expect(created_person.github).toEqual(person.github);
    // expect(created_person.firstname).toEqual(person.firstname);
    // expect(created_person.lastname).toEqual(person.lastname);
    // expect(created_person.email).toEqual(person.email);
    // expect(created_person.gender).toEqual(person.gender);
});

// it('should create 1 new customer with 1 order', async () => {
//     // The new customers details
//     const customer: Customer = {
//         id: 2,
//         name: 'Hermione Granger',
//         email: 'hermione@hogwarts.io',
//         address: '2 Hampstead Heath',
//     }
//     // The new orders details
//     const order: OrderInput = {
//         customer,
//         productId: 1,
//         quantity: 1,
//     }
//
//     // Create the order and customer
//     await createOrder(order)
//
//     // Check if the new customer was created by filtering on unique email field
//     const newCustomer = await prisma.customer.findUnique({
//         where: {
//             email: customer.email,
//         },
//     })
//
//     // Check if the new order was created by filtering on unique email field of the customer
//     const newOrder = await prisma.customerOrder.findFirst({
//         where: {
//             customer: {
//                 email: customer.email,
//             },
//         },
//     })
//
//     // Expect the new customer to have been created and match the input
//     expect(newCustomer).toEqual(customer)
//     // Expect the new order to have been created and contain the new customer
//     expect(newOrder).toHaveProperty('customerId', 2)
// })
//
// it('should create 1 order with an existing customer', async () => {
//     // The existing customers email
//     const customer: Customer = {
//         email: 'harry@hogwarts.io',
//     }
//     // The new orders details
//     const order: OrderInput = {
//         customer,
//         productId: 1,
//         quantity: 1,
//     }
//
//     // Create the order and connect the existing customer
//     await createOrder(order)
//
//     // Check if the new order was created by filtering on unique email field of the customer
//     const newOrder = await prisma.customerOrder.findFirst({
//         where: {
//             customer: {
//                 email: customer.email,
//             },
//         },
//     })
//
//     // Expect the new order to have been created and contain the existing customer with an id of 1 (Harry Potter from the seed script)
//     expect(newOrder).toHaveProperty('customerId', 1)
// })
//
// it("should show 'Out of stock' message if productId doesn't exit", async () => {
//     // The existing customers email
//     const customer: Customer = {
//         email: 'harry@hogwarts.io',
//     }
//     // The new orders details
//     const order: OrderInput = {
//         customer,
//         productId: 3,
//         quantity: 1,
//     }
//
//     // The productId supplied doesn't exit so the function should return an "Out of stock" message
//     await expect(createOrder(order)).resolves.toEqual(new Error('Out of stock'))
// })