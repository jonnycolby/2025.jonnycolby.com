import "server-only";
//
import { redirect } from "next/navigation";
// import { headers as Next_Headers } from "next/headers";
import { cookies as Cookies } from "next/headers";
//
import UI from "./UI";
//
const IS_DEV = process.env.NODE_ENV == "development" ? true : false;
//
//

export default async function Page(props) {
    var params = props.params ? await props.params : {};
    var searchParams = props.searchParams ? await props.searchParams : {};
    //
    return (
        <UI
            page={{ params, searchParams }} //
        />
    );
}

//

// https://beta.nextjs.org/docs/api-reference/segment-config#revalidate
export const revalidate = false; // false (default) allows caching; 0 requires re-render on every load
// When {revalidate} is set in layout.js, it affects all child pages as well.

//
//
