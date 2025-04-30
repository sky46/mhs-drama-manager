"use client"; // Need this to be able to use "useState"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation" 

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
        <div className="flex justify-center">
            <div className="bg-secondary-100 w-1/2 rounded-lg py-10 flex flex-col items-center">
                <h1 className="text-3xl mb-5">Log in</h1>
                <form onSubmit={loginUser} className="w-1/2 flex flex-col gap-3">
                    <div>
                        <label className="label block">Email</label>
                        <input 
                            id="email"
                            value={email}
                            type="text"
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-white my-1 inline-block p-1.5 rounded-sm"
                        />
                    </div>
                    <div>
                        <label className="label block">Password</label>
                        <input
                            id="password"
                            value={password}
                            type={showPassword ? "text" : "password"} 
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-white my-1 inline-block p-1.5 rounded-sm"
                        />
                    </div>

                    <div className="text-center">
                        <input type="checkbox" onClick={togglePasswordVisibility} />
                        <label className="label">Show Password</label>
                    </div>
                    
                    <div className="text-center">
                        <button type="submit">
                            Log in
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Login;