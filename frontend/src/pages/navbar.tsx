import { NavLink } from "react-router"


const Navbar = () => {

    return <div className="flex gap-x-10">
        <NavLink to="/login">Login</NavLink>
        <NavLink to="/">Home</NavLink>
    </div>
}