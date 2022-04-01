# Frontend development with Netx.JS

This little guide will show you the very basic principles of Next.JS and how to get started and also external links to the official documentation for further reading.

## File structure

![image](https://user-images.githubusercontent.com/56763273/160392058-d4109691-2a5a-4ce3-9331-80a07311aba1.png)

Next.JS uses file based routing. This means that every file in the pages folder will result in something like `/login` for the login file. Using nested folders you can achieve longer routes and have dynamic routes. For example when you have a folder named `student` containing a file named `[id].tsx`, it will automatically setup the route given an id and resolve to `/student/02264212` for example where the number is the id representing the student.

Everything else that does not directly correspond to a route should be placed in the `components` directory, where every component lives in its own folder as a `.tsx` and `.module.css` file. Next.JS is allows us to split CSS files into modules to not have name collisions with other css files. More info on CSS will follow once we have chosen a framework.

## .tsx

***But now what should the code for pages and components look like?***

Every file has the [`.tsx` extension](https://www.typescriptlang.org/docs/handbook/jsx.html), which allows us to include XML into our javascript / typescript code.

Next.JS is based upon React and thus has a lot of items in common.

Let's take a look at the Header component located in `/components/Header/Header.tsx`

```typescript
import styles from "./Header.module.css";
import Image from "next/image";
import LogoOsocColor from "../../public/images/logo-osoc-color.svg";
import Link from "next/link";
import React, {SyntheticEvent} from "react";
import {signOut, useSession} from "next-auth/react";

export const Header: React.FC = () => {

    const {status} = useSession()

    const logOut = (e: SyntheticEvent) => {
        e.preventDefault()
        signOut({callbackUrl: "/login"}).then()
    }

    return (
        <header className={styles.header}>
            <div>
                <div className={styles.imagecontainer}>
                    <Image
                        src={LogoOsocColor}
                        layout="intrinsic"
                        alt="OSOC Logo"
                    />
                </div>
                <h1>Selections</h1>
            </div>
            <div className={`${styles.links} ${status === "authenticated" ? "" : styles.displayNone}`}>
                <Link href={"/students"}>Students</Link>
                <Link href={"/projects"}>Projects</Link>
                <Link href={"/users"}>Manage Users</Link>
                <button onClick={logOut}>Log out</button>
            </div>
        </header>
    )
}
```

Every component is a React Functional Component `React.FC` and should return it's representation in XML / HTML format.

Functions and variables can then be declared inside the Functional Component to be used in the returned XML.

Components can also receive props / arguments. We will take the Modal compontent as example. `components/Modal/Modal.tsx`

```typescript
import React, {SyntheticEvent} from "react";
import styles from './Modal.module.css'

/**
 * A popup modal
 * Will display it's children inside the modal
 * @param children - The children to be shown inside the modal
 * @param visible - Set the modal to be visible or not
 * @param handleClose - The callback to close the modal
 */
// eslint-disable-next-line no-unused-vars
export const Modal: React.FC<{ visible: boolean, handleClose: (e :SyntheticEvent) => void }> = ({
                                                                                                        children,
                                                                                                        visible,
                                                                                                        handleClose
                                                                                                    }) => {
    return (
        <div className={`${styles.modal} ${visible ? styles.displayBlock : styles.displayNone}`}>
            <div className={styles.modalMain}>
                <button className={styles.modalButton} type="button" onClick={handleClose}>Close</button>
                {children}
            </div>
        </div>
    )
}
```

We can see the declaration of props given to the component here `React.FC<{ visible: boolean, handleClose: (e :SyntheticEvent) => void }>`. Now if we wish to include this modal like we do in the login page we just write:

```typescript
<Modal handleClose={closeModal} visible={showPasswordReset}>
    <p>Please enter your email below and we will send you a link to reset your password.</p>
    <label className={styles.label}>
        <input type="text" name="loginEmail" value={passwordResetMail === "" ? loginEmail : passwordResetMail}
            onChange={e => setPasswordResetMail(e.target.value)}/>
    </label>
    <p className={`${styles.textFieldError} ${passwordResetMailError !== "" ? styles.anim : ""}`}>{passwordResetMailError}</p>
    <button onClick={resetPassword}>CONFIRM</button>
</Modal>
```

Everything that the modal surrounds will be shown inside the modal.


Pages work very alike but only have a slight difference in initialization. We can't just pass props like we can with components as they are standalone pages. Given the login page as example, a page in Next.JS should look something like this:

```typescript
import type {NextPage} from 'next'
import styles from '../styles/login.module.css'
import Image from "next/image"
import GitHubLogo from "../public/images/github-logo.svg"
import {SyntheticEvent, useState} from "react";
import {Modal} from "../components/Modal/Modal";
import {useRouter} from "next/router";
import {signIn} from "next-auth/react";
import {Header} from "../components/Header/Header";

import * as crypto from 'crypto';

const Login: NextPage = () => {

    const router = useRouter()

    // Login field values with corresponding error messages
    const [loginEmail, setLoginEmail] = useState<string>("");
    const [loginEmailError, setLoginEmailError] = useState<string>("");
    const [loginPassword, setLoginPassword] = useState<string>("");
    const [loginPasswordError, setLoginPasswordError] = useState<string>("");
    const [loginBackendError, setLoginBackendError] = useState<string>("");


    [...] // Rest of the declarations have been truncated as it gets very repetitive

    /**
     * Executed upon trying to login
     * Checks that inputfields are not empty and sends a request to the backend
     * Redirects to the home page if succesfull else returns an error message
     *
     * @param e - The event triggering this function call
     */
    const submitLogin = async (e: SyntheticEvent) => {...}

    /**
     * Executed upon trying to register
     * Checks that inputfields are not empty and sends a request to the backend
     * Redirects to the home page if succesfull else returns an error message
     *
     * @param e - The event triggering this function call
     */
    const submitRegister = async (e: SyntheticEvent) => {...}

    /**
     * When the users want to login with github we follow the github web authentication application flow
     * https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps#web-application-flow
     *
     * Redirect to homepage upon succes
     *
     * @param e - The event triggering this function call
     */
    const githubLogin = (e: SyntheticEvent) => {...}

    /**
     * Handles password reset requests from the popup modal
     *
     * @param e - The event triggering this function call
     */
    const resetPassword = (e: SyntheticEvent) => {...}

    // Show password reset modal
    const showModal = (e: SyntheticEvent) => {...}

    // Close password reset modal
    const closeModal = (e: SyntheticEvent) => {...}

    return (
        <div>
            <Header/>
            <div className={styles.body}>
                <h3>Welcome to OSOC Selections!</h3>
                <h3 className="subtext">Please login, or register to proceed</h3>
                <div className={styles.formContainer}>
                </div>
            </div>
        </div>)
}
```

Note that when working with events you should always do `event.preventDefault()` before anything else. This will prevent their default behavior of reloading the pages which we absolutely do not want.

Also notice that every variable that needs to update the page is part of the page state and thus should be declader with `[variable, setVariable] = useState<T>()` . You can then set the variable with `setVariable` and it will immediatly be shown on the page.

## Further reading

To get an more broad overview and quick start see the official Next.JS quickstart guide: https://nextjs.org/learn

I highly recommend reading through these items:
![image](https://user-images.githubusercontent.com/56763273/160392222-322c4cda-0a60-428a-a141-23e1dfa82c96.png)

Except for **Pre-Rendering and Data Fetching**.

And the official complete documentation can be found here:
https://nextjs.org/docs
