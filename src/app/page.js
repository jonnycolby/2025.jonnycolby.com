import "server-only";
//
import { redirect } from "next/navigation";
//
//

export default async function Page(props) {
    return redirect(`/home`);
}
