"use client"; // Need this to be able to use "useState"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation" 
import styles from '../styles/login.module.css';

// ADD ERROR FOR IF LOGIN FAILS

function Login() {
    const [nameOrEmail, setNameOrEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [successfulLogin, setSuccessfulLogin] = useState(false);

    // IMO these error fields are unnecessary for login as it should just be pass/fail for the whole form
    const [invalidFields, setInvalidFields] = useState({
        nameOrEmail: false,
        password: false,
    });
    const [errorMessages, setErrorMessages] = useState ({
        nameOrEmail: "",
        password: "",
    });

    
    const router = useRouter();
    useEffect(() => {
        console.log("Router instance:", router);
        if (router && successfulLogin) {
            router.push("/profile");
        }
    }, [router, successfulLogin]);

    const loginUser = async (e) => {
        e.preventDefault();
        const response = await fetch("http://localhost:3001/users/login", { 
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ nameOrEmail, password }),
            credentials: 'include'
        });
        if (response.ok) {
            setSuccessfulLogin(true);
        } else if (response.status === 403) {
            alert("Incorrect name/email or password.")

            // Separate errors for name/email and password. nameOrEmailMatched also has to be uncommented in backend.
            // let newErrors = {password: 'Incorrect password'};
            // let invalidFields = {nameOrEmail: false, password: true}
            // let responseJson = await response.json()
            // if (!responseJson.nameOrEmailMatched) {
            //     newErrors.nameOrEmail = 'Incorrect name/email';
            //     invalidFields.nameOrEmail = true;
            // }
            // setErrorMessages(newErrors)
            // setInvalidFields(invalidFields)
        } else {
            console.error("Login failed: ", response.statusText);
        }
    };

    const togglePasswordVisibility = () => { 
        setShowPassword(!showPassword);
    };

    return (
        <div className="form">
            <h1>Login!</h1>
            <form onSubmit={loginUser}>
                <div className={styles.inputGroup}>
                    <label className="label">Name or Email</label>
                    <input
                        className={`${styles.input} ${invalidFields.nameOrEmail ? styles.invalid : ''}`} 
                        id="nameOrEmail"
                        value={nameOrEmail}
                        type="text"
                        onChange={(e) => setNameOrEmail(e.target.value)}
                    />
                    {errorMessages.nameOrEmail && <div className={styles.errorMessage}>{errorMessages.nameOrEmail}</div>}
                </div>
                <div className={styles.inputGroup}>
                    <label className="label">Password</label>
                    <input
                        className={`${styles.input} ${invalidFields.password ? styles.invalid : ''}`}
                        id="password"
                        value={password}
                        type={showPassword ? "text" : "password"} // Link up both passwords to same conditional
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    {errorMessages.password && <div className={styles.errorMessage}>{errorMessages.password}</div>}
                </div>

                <div className={styles.inputGroup}>
                    <input type="checkbox" onClick={togglePasswordVisibility} />
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