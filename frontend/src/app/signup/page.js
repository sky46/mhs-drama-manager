"use client"; // Need this to be able to use "useState"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation" //https://nextjs.org/docs/pages/api-reference/functions/use-router#the-nextcompatrouter-export (acts like an app because of use client)

import clsx from "clsx";

function Signup({}) {
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
            router.refresh();
            router.push("/productions");
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
            <h1 className="font-bold">Sign Up!</h1>
            <form onSubmit={registerUser} className="flex flex-col">
                <div className="inline-block my-1">
                    <label className="label">Name</label>
                    <input // Styles = input + either name or invalid
                        id="name"
                        value={name}
                        type="text"
                        onChange={(e) => setName(e.target.value)}
                        placeholder="i.e. Joe Bob"
                        className={clsx("mx-1.5", invalidFields.name ? "border border-red-500" : "border border-gray-300")}
                    />
                    <div 
                        className="relative inline-block"
                        onMouseEnter={() => setShowTooltip(prev => ({...prev, name: true}))} // spread rest of data (keep same)
                        onMouseLeave={() => setShowTooltip(prev => ({...prev, name: false}))}
                    >
                        <span className="bg-gray-300 py-1 px-1.5 border">?</span>
                        <div className={clsx("absolute left-full top-0 ml-2 z-10 bg-white border p-2 shadow-md rounded w-48", showTooltip.name ? "block" : "hidden")}>
                            <ul>
                                <li>Enter your full name</li>
                            </ul>
                        </div>
                    </div>
                    {errorMessages.name && <div className="text-red-500">{errorMessages.name}</div>}
                </div>
                <div className="inline-block my-1">
                    <label className="label">Email</label>
                    <input
                        id="email"
                        value={email}
                        type="text"
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="i.e. joebob@gmail.com"
                        className={clsx("mx-1.5", invalidFields.email ? "border border-red-500" : "border border-gray-300")}
                    />
                    <div 
                        className="relative inline-block"
                        onMouseEnter={() => setShowTooltip(prev => ({...prev, email: true}))}
                        onMouseLeave={() => setShowTooltip(prev => ({...prev, email: false}))}
                    >
                        <span className="bg-gray-300 py-1 px-1.5 border">?</span>
                        <div className={clsx("absolute left-full top-0 ml-2 z-10 bg-white border p-2 shadow-md rounded w-48", showTooltip.email ? "block" : "hidden")}>
                            <ul>
                                <li>Enter any email with a valid address</li>
                            </ul>
                        </div>
                    </div>
                    {errorMessages.email && <div className="text-red-500">{errorMessages.email}</div>}
                </div>
                <div className="inline-block my-1">
                    <label className="label">Password</label>
                    <input
                        id="password"
                        value={password}
                        type={showPassword ? "text" : "password"} // Link up both passwords to same conditional
                        onChange={(e) => setPassword(e.target.value)}
                        className={clsx("mx-1.5", invalidFields.password ? "border border-red-500" : "border border-gray-300")}
                    />
                    <div 
                        className="relative inline-block"
                        onMouseEnter={() => setShowTooltip(prev => ({...prev, password: true}))}
                        onMouseLeave={() => setShowTooltip(prev => ({...prev, password: false}))}
                    >
                        <span className="bg-gray-300 py-1 px-1.5 border">?</span>
                        <div className={clsx("absolute left-full top-0 ml-2 z-10 bg-white border p-2 shadow-md rounded w-48", showTooltip.password ? "block" : "hidden")}>
                            <ul>
                                <li>Must include a lowercase character</li>
                                <li>Must include an uppercase character</li>
                                <li>Must include a special character</li>
                                <li>Must include a number</li>
                            </ul>
                        </div>
                    </div>
                    {errorMessages.password && <div className="text-red-500">{errorMessages.password}</div>}
                </div>
                <div className="flex">
                    <label className="label">Re-enter Password</label>
                    <input
                        id="passwordcheck"
                        value={passwordCheck}
                        type={showPassword ? "text" : "password"}
                        onChange={(e) => setPasswordCheck(e.target.value)}
                        className={clsx("mx-1.5", invalidFields.password ? "border border-red-500" : "border border-gray-300")}
                    />
                    {errorMessages.passwordCheck && <div className="text-red-500">{errorMessages.passwordCheck}</div>}
                </div>

                <div>
                    <input type="checkbox" onClick={togglePasswordVisibility} />
                    <label className="label">Show Password</label>
                </div>

                <div>
                    <button
                    type="button"
                    onClick={() => setRole("teacher")}
                    className={clsx(role === "teacher" ? "bg-emerald-200" : "bg-purple-200")}
                    >
                    Teacher
                    </button>
                    <button
                    type="button"
                    onClick={() => setRole("student")}
                    className={clsx(role === "student" ? "bg-emerald-200" : "bg-purple-200")}
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