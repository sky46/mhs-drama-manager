"use client"; // Need this to be able to use "useState"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation" //https://nextjs.org/docs/pages/api-reference/functions/use-router#the-nextcompatrouter-export (acts like an app because of use client)
import styles from '../styles/signup.module.css';

function Signup() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordCheck, setPasswordCheck] = useState("");
    const [role, setRole] = useState("student");
    const [showPassword, setShowPassword] = useState(false);
    const [successfulRegistration, setSuccessfulRegistration] = useState(false);
    const [showTooltip, setShowTooltip] = useState({
        name: false,
        email: false,
        password: false,
    });
    const [invalidFields, setInvalidFields] = useState({
        name: false,
        email: false,
        password: false,
        passwordCheck: false
    });
    const [errorMessages, setErrorMessages] = useState ({ // Doing this instead of required field for more customizability
        name: "",
        email: "",
        password: "",
        passwordCheck: ""
    });

    const router = useRouter();
    // Need to use effect to mount router cause normally its in components
    useEffect(() => {
        console.log("Router instance:", router);
        if (router && successfulRegistration) {
            router.push("/profile");
        }
    }, [router, successfulRegistration]);

    const validateSubmission = async() => {
        let newErrors = {};
        let newInvalidFields = { name: false, email: false, password: false, passwordCheck: false };

        if (!name) {
            newErrors.name = "The name field must be filled in.";
            newInvalidFields.name = true;
        }

        const emailPatternChecker = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; //regex -> need characters before @, @, characters after @, ., characters after .
        if (!email || !emailPatternChecker.test(email)) {
            newErrors.email = "Invalid email format."
            newInvalidFields.email = true;
        }

        const emailCheckResponse = await fetch("http://localhost:3001/users/email", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email })
        });
        const emailCheckData = await emailCheckResponse.json();
        if (emailCheckData.exists) {
            newErrors.email = "Email already in use."
            newInvalidFields.email = true;
        }

        //regex -> the ?= is a look ahead (need 1 upper, 1 lower, 1 special, 1 number)
        const passwordPatternChecker = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_])(?=.*\d)/;
        if (!password || !passwordCheck || password !== passwordCheck || password.length < 8 || !passwordPatternChecker.test(password)) {
            newErrors.password = "Invalid password and/or the passwords do not match."
            newErrors.passwordCheck = "Invalid password and/or the passwords do not match."
            newInvalidFields.password = true;
            newInvalidFields.passwordCheck = true;
        }

        setInvalidFields(newInvalidFields);
        setErrorMessages(newErrors);

        let valid = !Object.values(newInvalidFields).includes(true);
        return valid
    }

    // async to allow promises (smth that will be available in the future -> i.e. the response to send to backend)
    const registerUser = async (e) => {
        e.preventDefault(); // Prevent from being submitted right away
        const valid = await validateSubmission();

        if (valid) {
            // Backend request with fetch sending post
            const response = await fetch("http://localhost:3001/users/create", { 
                method: "POST",
                headers: {
                    "Content-Type": "application/json" // Sending json data as expected
                },
                body: JSON.stringify({ name, email, password, passwordCheck, role }),
                credentials: 'include'
            });

            const data = await response.json();
        
            if (response.ok) {
                console.log("User created successfully:", data);
                alert("Signup successful!");
                setSuccessfulRegistration(true);
            } else {
                console.error("Signup error:", data.error);
                alert(data.error);
            }
        };
    };

    const togglePasswordVisibility = () => { // Use state to toggle password visibliity instead of getting element by id because not recognized if text is blank (i.e. before password is typed)
        setShowPassword(!showPassword);
    };
    
    return (
        <div className="form">
            <h1>Sign Up!</h1>
            <form onSubmit={registerUser}>
                <div className={styles.inputGroup}>
                    <label className="label">Name</label>
                    <input
                        className={`${styles.input} ${invalidFields.name ? styles.invalid : ''}`} // Styles = input + either name or invalid
                        id="name"
                        value={name}
                        type="text"
                        onChange={(e) => setName(e.target.value)}
                        placeholder="i.e. Joe Bob"
                    />
                    <div 
                        className={styles.tooltipContainer}
                        onMouseEnter={() => setShowTooltip(prev => ({...prev, name: true}))} // spread rest of data (keep same)
                        onMouseLeave={() => setShowTooltip(prev => ({...prev, name: false}))}
                    >
                        <span className={styles.tooltipIcon}>?</span>
                        <div className={`${styles.tooltipText} ${showTooltip.name ? styles.visible : ''}`}>
                            <ul className={styles.bulletList}>
                                <li className={styles.bulletPoint}>Enter your full name</li>
                            </ul>
                        </div>
                    </div>
                    {errorMessages.name && <div className={styles.errorMessage}>{errorMessages.name}</div>}
                </div>
                <div className={styles.inputGroup}>
                    <label className="label">Email</label>
                    <input
                        className={`${styles.input} ${invalidFields.email ? styles.invalid : ''}`}
                        id="email"
                        value={email}
                        type="text"
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="i.e. joebob@gmail.com"
                    />
                    <div 
                        className={styles.tooltipContainer}
                        onMouseEnter={() => setShowTooltip(prev => ({...prev, email: true}))}
                        onMouseLeave={() => setShowTooltip(prev => ({...prev, email: false}))}
                    >
                        <span className={styles.tooltipIcon}>?</span>
                        <div className={`${styles.tooltipText} ${showTooltip.email ? styles.visible : ''}`}>
                            <ul className={styles.bulletList}>
                                <li className={styles.bulletPoint}>Enter any email with a valid address</li>
                            </ul>
                        </div>
                    </div>
                    {errorMessages.email && <div className={styles.errorMessage}>{errorMessages.email}</div>}
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
                    <div 
                        className={styles.tooltipContainer}
                        onMouseEnter={() => setShowTooltip(prev => ({...prev, password: true}))}
                        onMouseLeave={() => setShowTooltip(prev => ({...prev, password: false}))}
                    >
                        <span className={styles.tooltipIcon}>?</span>
                        <div className={`${styles.tooltipText} ${showTooltip.password ? styles.visible : ''}`}>
                            <ul className={styles.bulletList}>
                                <li className={styles.bulletPoint}>Must include a lowercase character</li>
                                <li className={styles.bulletPoint}>Must include an uppercase character</li>
                                <li className={styles.bulletPoint}>Must include a special character</li>
                                <li className={styles.bulletPoint}>Must include a number</li>
                            </ul>
                        </div>
                    </div>
                    {errorMessages.password && <div className={styles.errorMessage}>{errorMessages.password}</div>}
                </div>
                <div className={styles.inputGroup}>
                    <label className="label">Re-enter Password</label>
                    <input
                        className={`${styles.input} ${invalidFields.passwordCheck ? styles.invalid : ''}`}
                        id="passwordcheck"
                        value={passwordCheck}
                        type={showPassword ? "text" : "password"}
                        onChange={(e) => setPasswordCheck(e.target.value)}
                    />
                    {errorMessages.passwordCheck && <div className={styles.errorMessage}>{errorMessages.passwordCheck}</div>}
                </div>

                <div className={styles.inputGroup}>
                    <input type="checkbox" onClick={togglePasswordVisibility} />
                    <label className="label">Show Password</label>
                </div>

                <div className={styles.inputGroup}>
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
                
                <button className="btn" type="submit">
                    Submit
                </button>
            </form>
        </div>
    );
}

export default Signup;