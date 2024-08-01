import { Link } from "react-router-dom";


function Header() {
    return( 
        <div className="header">
                <ul className="navigation">
                    <li> <Link to="/"> Showcase</Link> </li>
                    <li> <Link to="/3dscene"> 3DScene </Link> </li>
                </ul>
        </div>
    )
}

export default Header;