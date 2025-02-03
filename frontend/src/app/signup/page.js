"use client"; // Need this to be able to use "useState"
import { useState } from "react";

function Signup() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordCheck, setPasswordCheck] = useState("");
    const [role, setRole] = useState("student");
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log({ name, email, password, passwordCheck, role });
        // MAKE API CALL TO BACKEND TO SAVE
    };

    const togglePasswordVisibility = () => { // Use state to toggle password visibliity instead of getting element by id because not recognized if text is blank (i.e. before password is typed)
        setShowPassword(!showPassword);
    };
    
    return (
        <div className="form">
            <h1>Sign Up!</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label className="label">Name</label>
                    <input
                        className="input"
                        value={name}
                        type="text"
                        onChange={(e) => setName(e.target.value)}
                        placeholder="i.e. Joe Bob"
                        required
                    />
                </div>
                <div>
                    <label className="label">Email</label>
                    <input
                        className="input"
                        value={email}
                        type="text"
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="i.e. joebob@gmail.com"
                        required
                    />
                </div>
                <div>
                    <label className="label">Password</label>
                    <input
                        className="input"
                        id="password"
                        value={password}
                        type={showPassword ? "text" : "password"} // Link up both passwords to same conditional
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label className="label">Re-enter Password</label>
                    <input
                        className="input"
                        id="passwordcheck"
                        value={passwordCheck}
                        type={showPassword ? "text" : "password"}
                        onChange={(e) => setPasswordCheck(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <input type="checkbox" onClick={togglePasswordVisibility} />
                    <label className="label">Show Password</label>
                </div>

                <div>
                    <label>Role</label>
                    <div>
                        <button
                        type="button"
                        onClick={() => setRole('teacher')}
                        style={{
                            backgroundColor: role === 'teacher' ? 'lightblue' : '',
                        }}
                        >
                        Teacher
                        </button>
                        <button
                        type="button"
                        onClick={() => setRole('student')}
                        style={{
                            backgroundColor: role === 'student' ? 'lightblue' : '',
                        }}
                        >
                        Student
                        </button>
                    </div>
                </div>
                
                <button className="btn" type="submit">
                    Submit
                </button>
            </form>
        </div>
    );
}

export default Signup;