"use client"; // Need this to be able to use "useState"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation" 
import styles from '../styles/login.module.css';

// Login works (ish) but need to fix if not a valid thing entered
    // Can't figure out how to stay logged in

function Login() {
    const [nameOrEmail, setNameOrEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [successfulLogin, setSuccessfulLogin] = useState(false);
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
    

    const validateSubmission = async() => {
        let newErrors = {};
        let newInvalidFields = { nameOrEmail: false, password: false };

        // Check if everything matched up
        const loginCheckResponse = await fetch("http://localhost:3001/users/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ nameOrEmail, password })
        });
        if (!loginCheckResponse.ok) {
            console.error("Failed to log in: ", loginCheckResponse.statusText);
            return;
        }
        const loginCheckData = await loginCheckResponse.json();
        if (!loginCheckData.nameOrEmailMatched) {
            newErrors.nameOrEmail = "Submitted information does not exist."
            newInvalidFields.nameOrEmail = true;
        }
        if (!loginCheckData.passwordMatched) {
            newErrors.password = "Submitted password is incorrect."
            newInvalidFields.password = true;
        }
        setInvalidFields(newInvalidFields);
        setErrorMessages(newErrors);

        let valid = !Object.values(newInvalidFields).includes(true);

        return valid
    }

    const loginUser = async (e) => {
        e.preventDefault();
        console.log({nameOrEmail, password });
        const valid = await validateSubmission();
        if (valid) {
            console.log("User successfully logged in:");
            alert("Login successful!");
            setSuccessfulLogin(true);
        } else {
            console.error("Login error");
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