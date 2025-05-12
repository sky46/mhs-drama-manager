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

        // //regex -> the ?= is a look ahead (need 1 upper, 1 lower, 1 special, 1 number)
        // const passwordPatternChecker = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_])(?=.*\d)/;
        // if (!password || !passwordCheck || password !== passwordCheck || password.length < 8 || !passwordPatternChecker.test(password)) {
        if (!password || password.length < 8 || password !== passwordCheck) {
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
        <div className="flex justify-center">
            <div className="bg-secondary-100 w-11/12 sm:w-3/4 md:w-1/2 rounded-lg py-10 flex flex-col items-center">
                <h1 className="text-3xl mb-5">Sign up</h1>
                <form onSubmit={registerUser} className="w-2/3 lg:w-1/2 flex flex-col gap-3">
                    <div>
                        <label className="label block">Name</label>
                        <input // Styles = input + either name or invalid
                            id="name"
                            value={name}
                            type="text"
                            onChange={(e) => {
                                setName(e.target.value);
                                var newInvalidFields = invalidFields;
                                newInvalidFields.name = false;
                                setInvalidFields(newInvalidFields);
                            }}
                            className={clsx(invalidFields.name && "ring-2 ring-red-300 focus:ring-secondary-300", "w-full bg-white my-1 inline-block py-1.5 px-2 rounded-sm border border-secondary-200 focus:ring-2 focus:ring-secondary-300 focus:outline-none")}
                        />
                        {errorMessages.name && <div className="text-red-600">{errorMessages.name}</div>}
                    </div>
                    <div>
                        <label className="label block">Email</label>
                        <input
                            id="email"
                            value={email}
                            type="text"
                            onChange={(e) => {
                                setEmail(e.target.value);
                                var newInvalidFields = invalidFields;
                                newInvalidFields.email = false;
                                setInvalidFields(newInvalidFields);
                            }}
                            className={clsx(invalidFields.email && "ring-2 ring-red-300 focus:ring-secondary-300", "w-full bg-white my-1 inline-block py-1.5 px-2 rounded-sm border border-secondary-200 focus:ring-2 focus:ring-secondary-300 focus:outline-none")}
                        />
                        {errorMessages.email && <div className="text-red-600">{errorMessages.email}</div>}
                    </div>
                    <div className="inline-block my-1">
                        <label className="label block">Password (min. 8 characters)</label>
                        <input
                            id="password"
                            value={password}
                            type={showPassword ? "text" : "password"} // Link up both passwords to same conditional
                            onChange={(e) => {
                                setPassword(e.target.value);
                                var newInvalidFields = invalidFields;
                                newInvalidFields.password = false;
                                setInvalidFields(newInvalidFields);
                            }}
                            className={clsx(invalidFields.password && "ring-2 ring-red-300 focus:ring-secondary-300", "w-full bg-white my-1 inline-block py-1.5 px-2 rounded-sm border border-secondary-200 focus:ring-2 focus:ring-secondary-300 focus:outline-none")}
                        />
                        {errorMessages.password && <div className="text-red-600">{errorMessages.password}</div>}
                    </div>
                    <div>
                        <label className="label block">Confirm password</label>
                        <input
                            id="passwordcheck"
                            value={passwordCheck}
                            type={showPassword ? "text" : "password"}
                            onChange={(e) => {
                                setPasswordCheck(e.target.value);
                                var newInvalidFields = invalidFields;
                                newInvalidFields.passwordCheck = false;
                                setInvalidFields(newInvalidFields);
                            }}
                            className={clsx(invalidFields.passwordCheck && "ring-2 ring-red-300 focus:ring-secondary-300", "w-full bg-white my-1 inline-block py-1.5 px-2 rounded-sm border border-secondary-200 focus:ring-2 focus:ring-secondary-300 focus:outline-none")}
                        />
                        {errorMessages.passwordCheck && <div className="text-red-600">{errorMessages.passwordCheck}</div>}
                    </div>

                    <div className="text-center">
                        <input type="checkbox" onClick={togglePasswordVisibility} className="mx-1" />
                        <label className="label">Show password</label>
                    </div>

                    {/* <div>
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
                    </div> */}
                    
                    <div className="text-center">
                        <button type="submit" className="hover:cursor-pointer py-2 px-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 active:ring-primary-300 active:ring-3">
                            Sign up
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Signup;