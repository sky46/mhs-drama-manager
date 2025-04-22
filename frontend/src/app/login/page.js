"use client"; // Need this to be able to use "useState"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation" 
import styles from '../styles/login.module.css';

function Login({}) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [successfulLogin, setSuccessfulLogin] = useState(false);
    const [displayError, setDisplayError] = useState(false);
    
    const router = useRouter();
    useEffect(() => {
        console.log("Router instance:", router);
        if (router && successfulLogin) {
            router.push("/productions");

        }
    }, [router, successfulLogin]);

    const loginUser = async (e) => {
        e.preventDefault();
        const loginCheckResponse = await fetch("http://localhost:3001/users/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password }),
            credentials: 'include'
        });
        if (loginCheckResponse.ok) {
            setSuccessfulLogin(true);
            setDisplayError(false);
            const loginCheckData = await loginCheckResponse.json();
            console.log(loginCheckData);
        } else if (loginCheckResponse.status === 403) {
            setDisplayError(true);
            alert("Incorrect name/email or password.")
        } else {
            setDisplayError(true);
            console.error("Login failed: ", loginCheckResponse.statusText);
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
                    <label className="label">Email</label>
                    <input
                        className={`${styles.input} ${displayError ? styles.invalid : ''}`} 
                        id="email"
                        value={email}
                        type="text"
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div className={styles.inputGroup}>
                    <label className="label">Password</label>
                    <input
                        className={`${styles.input} ${displayError ? styles.invalid : ''}`}
                        id="password"
                        value={password}
                        type={showPassword ? "text" : "password"} 
                        onChange={(e) => setPassword(e.target.value)}
                    />
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