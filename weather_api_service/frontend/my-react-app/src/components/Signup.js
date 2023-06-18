import React, { useState } from 'react';

const Signup = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('')

    const handleSubmit = () => {
        fetch(`http://127.0.0.1:5900/signup/${username}/${password}/${name}`, {
            method: "POST"
        }).then(res => res.json());
    }
    return (
        <form onSubmit={handleSubmit}>
            <div>
            <   label>Full Name:</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} />

                <label>Username:</label>
                <input type="text" value={username} onChange={e => setUsername(e.target.value)} />
            </div>
            <div>
                <label>Password:</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <button type="submit">Sign Up!</button>
        </form>
    );
}

export default Signup;
