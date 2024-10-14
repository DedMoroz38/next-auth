import { getSession } from "next-auth/react"

export default async function MyServerComponent() {

    const session = await getSession()

    // do whatever you need to with the session...

    return (
        <div></div>
    )

}