import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"
import CredentialsProvider from "next-auth/providers/credentials";

export default NextAuth({

    // Configure one or more authentication providers
    providers: [
        GithubProvider({
            clientId: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET,
        }),

        CredentialsProvider({
            // The name to display on the sign in form (e.g. "Sign in with...")
            name: "Credentials",
            // The credentials is used to generate a suitable form on the sign in page.
            // You can specify whatever fields you are expecting to be submitted.
            // e.g. domain, username, password, 2FA token, etc.
            // You can pass any HTML attribute to the <input> tag through the object.
            credentials: {
                username: { type: "text" },
                password: { type: "password" }
            },
            // Make call to our own api
            async authorize(credentials, req) {
                // Add logic here to look up the user from the credentials supplied
                console.log(credentials)

                // TODO -- Check if users exists in the database

                // @ts-ignore
                const user = { id: 1, name: "J Smith", email: credentials.username }

                console.log(req)
                return user
                //if (user) {
                //    // Any object returned will be saved in `user` property of the JWT
                //    return user
                //} else {
                //    // If you return null then an error will be displayed advising the user to check their details.
                //    return null
//
                //    // You can also Reject this callback with an Error thus the user will be sent to the error page with the error message as a query parameter
                //}
            }
        }),
    ],

    pages: {
        signIn: '/login',
        signOut: '/login'
    }
})
