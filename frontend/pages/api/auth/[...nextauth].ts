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
                email: { type: "text" },
                password: { type: "password" }
            },
            // Make call to our own api
            async authorize(credentials, req) {
                // Add logic here to look up the user from the credentials supplied
                console.log(req)
                console.log(credentials)

                // TODO -- Check if users exists in the database

                let user = null;
                if (credentials) {
                    user = {id: 1, email: credentials.email}
                }

                console.log(user)
                return user
            }
        }),
    ],

    pages: {
        signIn: '/login',
        signOut: '/'
    }
})
