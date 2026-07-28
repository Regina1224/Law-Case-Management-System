import { useMsal } from '@azure/msal-react';
import { loginRequest } from '../app/msalConfig';

const AuthButton = () => {
    const { instance, accounts } = useMsal();

    const isLoggedIn = accounts.length > 0;
    const username = isLoggedIn ? accounts[0].name : null;

    const handleLogin = async() => {
        await instance.loginRedirect(loginRequest);
    };

    const handleLogout = async() => {
        await instance.logoutRedirect();
    };

    return (
        <div>
            {isLoggedIn ? (
                <div>
                    <p>{username}</p>
                    <button onClick={handleLogout}>Logout</button>
                </div>
            ) : (
                <button onClick={handleLogin}>Login</button>
            )}
        </div>
    );
}

export default AuthButton;