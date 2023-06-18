import React, { useState } from 'react';
import "../Login.css"
async function loginUser(credentials) {
  
 return fetch('http://127.0.0.1:5900/signin', {
   method: 'POST',
   headers: {
     'Content-Type': 'application/json'
   },
   body: JSON.stringify(credentials)
 })
   .then(res => {
      if (res.status == 200){
          localStorage.setItem('items', Date.now().toString())
      }
   })
   .catch(_ => {
    alert("Invalid Username and Password Combination")
   })
}

export default function Login({setToken}) {
  const [username, setUserName] = useState();
  const [password, setPassword] = useState();

  const handleSubmit = async e => {
    e.preventDefault();
    const token = await loginUser({
      username,
      password
    });
    setToken(token);
  }


  return(
    <div class = "body container">
      <h1>Log In</h1>
      <form onSubmit={handleSubmit}>
        <label>
          <p>Username</p>
          <input type="text" name = "username" onChange={e => setUserName(e.target.value)} />
        </label>
        <label>
          <p>Password</p>
          <input type="password" name = "password" onChange={e => setPassword(e.target.value)} />
        </label>
        <div>
          <button type="submit">Submit</button>
        </div>
      </form>
    </div>
  )
}