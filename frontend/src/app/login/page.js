"use client"; // Need this to be able to use "useState"
import { useState } from "react";

function Login() {
    const [nameOrEmail, setNameOrEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log({nameOrEmail, password, role });
        // MAKE API CALL TO BACKEND TO SAVE
    };

    const togglePasswordVisibility = () => { 
        setShowPassword(!showPassword);
    };

    return (
        <div className="form">
            <h1>Login!</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label className="label">Name or Email</label>
                    <input
                        className="input"
                        value={nameOrEmail}
                        type="text"
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label className="label">Password</label>
                    <input
                        className="input"
                        id="password-login"
                        value={password}
                        type={showPassword ? "text" : "password"}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <input type="checkbox" onClick={togglePasswordVisibility}/>
                    <label className="label">Show Password</label>
                </div>
                <button className="btn" type="submit">
                    Submit
                </button>
            </form>
        </div>
    );
}

export default Login;