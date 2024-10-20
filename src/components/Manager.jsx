import React, { useEffect, useRef, useState } from 'react'
import { ToastContainer, toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Manager = () => {
    const ref = useRef()
    const passwordRef = useRef()
    const [form, setform] = useState({ site: "", username: "", password: "" })
    const [passwordArray, setPasswordArray] = useState([])


    const generatePassword = () => {
        const lowerCaseLetters = 'abcdefghijklmnopqrstuvwxyz';
        const upperCaseLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const digits = '0123456789';
        const symbols = '!@#$%^&*()_+[]{}|;:,.<>?';

        const allCharacters = lowerCaseLetters + upperCaseLetters + digits + symbols;

        const passwordLength = 12;
        let newPassword = '';

        // Ensure password contains at least one of each category: lowercase, uppercase, digit, and symbol
        newPassword += lowerCaseLetters[Math.floor(Math.random() * lowerCaseLetters.length)];
        newPassword += upperCaseLetters[Math.floor(Math.random() * upperCaseLetters.length)];
        newPassword += digits[Math.floor(Math.random() * digits.length)];
        newPassword += symbols[Math.floor(Math.random() * symbols.length)];

        // Fill the rest of the password with random characters from all available characters
        for (let i = newPassword.length; i < passwordLength; i++) {
            newPassword += allCharacters[Math.floor(Math.random() * allCharacters.length)];
        }

        // Optionally shuffle the password to avoid predictable patterns
        newPassword = newPassword.split('').sort(() => Math.random() - 0.5).join('');

        // Update the form and input field with the new password
        setform({ ...form, password: newPassword });
        passwordRef.current.value = newPassword;

        // Show success toast
        toast('Password Generated Successfully', {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
            transition: Bounce,
        });
    };

    const getPasswords = async () => {
        try {
            let req = await fetch('http://localhost:3000/passwords', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!req.ok) throw new Error('Failed to fetch passwords');
            let passwords = await req.json();
            setPasswordArray(passwords);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load passwords', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
                transition: Bounce,
            });
        }
    }


    useEffect(() => {
        getPasswords()
    }, [])
    const showPassword = () => {
        passwordRef.current.type = "password"
        if (ref.current.src.includes('/icons/eyecross.png')) {
            ref.current.src = '/icons/eye.png'
            passwordRef.current.type = 'password'
        }
        else {
            ref.current.src = '/icons/eyecross.png'
            passwordRef.current.type = 'text'
        }
    }


    const savePassword = async () => {
        if (form.site.length > 3 && form.username.length > 3 && form.password.length > 3) {
            try {
                let res = await fetch("http://localhost:3000/passwords", {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ passwordData: form })
                });

                if (!res.ok) throw new Error('Failed to save password');
                const data = await res.json();

                setPasswordArray([...passwordArray, { ...form, _id: data.result.insertedId }]);
                setform({ site: "", username: "", password: "" });

                toast('Password Saved', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                    transition: Bounce,
                });
            } catch (error) {
                console.error(error);
                toast.error('Failed to save password', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                    transition: Bounce,
                });
            }
        } else {
            toast.warn('Error: Length of site, username, and password should be greater than 3', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
                transition: Bounce,
            });
        }
    }


    const deletePassword = async (_id) => {
        let confirmDelete = confirm("Are you sure you want to delete this password?");
        if (confirmDelete) {
            try {
                console.log("ID being sent to backend:", _id);
                let res = await fetch("http://localhost:3000/passwords", {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ passwordId: _id })
                });

                if (!res.ok) throw new Error('Failed to delete password');

                setPasswordArray(passwordArray.filter(item => item._id !== _id));

                toast('Password deleted successfully!', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                    transition: Bounce,
                });
            } catch (error) {
                console.error(error);
                toast.error('Failed to delete password', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                    transition: Bounce,
                });
            }
        }
    }

    const editPassword = async (_id) => {
        console.log("Editing password with id ", _id);
        
        // Find the password entry to edit
        const selectedPassword = passwordArray.find(item => item._id === _id);
        
        if (selectedPassword) {
            try {
                // Fetch the decrypted password from the backend
                let res = await fetch(`http://localhost:3000/passwords/${_id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}` // If using JWT
                    }
                });
    
                if (!res.ok) {
                    throw new Error('Failed to retrieve decrypted password');
                }
    
                const result = await res.json();
    
                // Set form with the decrypted password and other data
                setform({
                    site: selectedPassword.site,
                    username: selectedPassword.username,
                    password: result.decryptedPassword // The decrypted password from the backend
                });
    
                // Remove the old entry from the local password array
                setPasswordArray(passwordArray.filter(item => item._id !== _id));
    
                // Make DELETE request to remove the old entry from the backend
                let deleteRes = await fetch("http://localhost:3000/passwords", {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}` // If using JWT
                    },
                    body: JSON.stringify({ passwordId: _id })
                });
    
                if (!deleteRes.ok) {
                    throw new Error('Failed to delete old password');
                }
    
                const deleteResult = await deleteRes.json();
                console.log('Old password deleted successfully:', deleteResult);
    
            } catch (error) {
                console.error('Error during password edit:', error);
            }
        } else {
            console.error('Password not found');
        }
    };
    

    

    const handleChange = (e) => {
        setform({ ...form, [e.target.name]: e.target.value })
    }

    const copyText = (text) => {
        toast('Copied to clipboard !', {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
            transition: Bounce,
        });
        navigator.clipboard.writeText(text)
    }

    const copyPassword = async (passwordId) => {
        try {
            console.log('Copy icon clicked, fetching password for ID:', passwordId); // Log to ensure click event fires

            // Make a GET request using fetch to fetch the decrypted password from the backend
            const response = await fetch(`http://localhost:3000/passwords/${passwordId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`, // Replace with the actual token if necessary
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch password: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('API response:', data); // Log response from API

            const decryptedPassword = data.decryptedPassword;

            // Copy the decrypted password to the clipboard
            if (decryptedPassword) {
                navigator.clipboard.writeText(decryptedPassword).then(() => {
                    toast('Copied to clipboard !', {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "light",
                        transition: Bounce,
                    });
                    console.log('Password copied to clipboard:', decryptedPassword); // Log the copied password
                }).catch(err => {
                    console.error('Failed to copy password:', err);
                });
            }
        } catch (error) {
            console.error('Error fetching decrypted password:', error);
            alert('Failed to copy password.');
        }
    };

    return (
        <>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
                transition="Bounce" />

            {/* <div class="absolute top-0 z-[-2] h-screen w-screen bg-gray-50 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div> */}
            <div className="absolute inset-0 -z-10 h-full w-full bg-gray-50 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"><div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-500 opacity-20 blur-[100px]"></div></div>
            <div className="p-2 md:mycontainer min-h-[82.5vh]">
                <h1 className='text-4xl font-bold text-center'>
                    <span className='text-teal-500'>&lt; </span>
                    <span className='text-blue-800'>Lock</span>
                    <span className='text-teal-500'>Safe / &gt;</span>
                </h1>
                <p className='text-gray-500 text-lg text-center'>Your Own Password Manager</p>

                <div className='flex flex-col p-4 gap-5 items-center'>
                    <input value={form.site} onChange={handleChange} placeholder='Enter Website URL' className='text-blue-900 rounded-full border border-teal-500 w-full p-4 py-1' type="text" name="site" id="site" />
                    <input value={form.username} onChange={handleChange} placeholder='Enter Username' className='text-blue-900 rounded-full border border-teal-500 w-full p-4 py-1' type="text" name="username" id="username" />
                    <div className='flex flex-col md:flex-row w-full gap-5 '>
                        <div className="relative w-full">
                            <input ref={passwordRef} value={form.password} onChange={handleChange} placeholder='Enter Password' className='text-blue-900 rounded-full border border-teal-500 w-full p-4 py-1' type="password" name="password" id="password" />
                            <span className='absolute right-[3px] top-[3px] cursor-pointer' onClick={showPassword}>
                                <img ref={ref} className='p-1' width={25} src="/icons/eye.png" alt="" />
                            </span>
                        </div>
                        <button onClick={generatePassword}
                            className='w-full md:w-auto px-4 py-2 bg-blue-800 hover:bg-blue-700 text-teal-100 font-semibold rounded-full border border-blue-900'>
                            Generate Strong Password
                        </button>
                    </div>

                    <button onClick={savePassword} className='flex items-center justify-center w-fit px-4 py-2 rounded-full bg-teal-400 hover:bg-teal-300 gap-2
                    border border-blue-900'>
                        <lord-icon
                            src="https://cdn.lordicon.com/jgnvfzqg.json"
                            trigger="hover">
                        </lord-icon>
                        Save</button>
                </div>


                <h2 className='font-bold text-2xl py-4'>Your Saved Passwords</h2>
                {passwordArray.length === 0 && <div>No Passwords To Show</div>}
                {passwordArray.length !== 0 && <div className="overflow-x-auto"><table className="table-auto min-w-full overflow-hidden rounded-md mb-10">
                    <thead className='bg-blue-900 text-white'>
                        <tr>
                            <th className='py-2'>Website</th>
                            <th className='py-2'>Username/email</th>
                            <th className='py-2'>Password</th>
                            <th className='py-2'>Actions</th>
                        </tr>
                    </thead>
                    <tbody className='bg-blue-50'>

                        {passwordArray.map((item, index) => {
                            return <tr key={item._id}>
                                <td className='py-2 border border-white text-center'>

                                    <div className='flex items-center justify-center'>
                                        <a href={item.site} target='_blank'>{item.site}</a>
                                        <div className='size-7 cursor-pointer lordiconcopy' onClick={() => { copyText(item.site) }}>
                                            <lord-icon
                                                style={{ width: '25px', height: '25px', "paddingTop": '3px', "paddingLeft": '3px' }}
                                                src="https://cdn.lordicon.com/iykgtsbt.json"
                                                trigger="hover">
                                            </lord-icon>
                                        </div>
                                    </div>
                                </td>
                                <td className='py-2 border border-white text-center'>
                                    <div className='flex items-center justify-center'>
                                        <span>{item.username}</span>
                                        <div className='size-7 cursor-pointer lordiconcopy' onClick={() => { copyText(item.username) }}>
                                            <lord-icon
                                                style={{ width: '25px', height: '25px', "paddingTop": '3px', "paddingLeft": '3px' }}
                                                src="https://cdn.lordicon.com/iykgtsbt.json"
                                                trigger="hover">
                                            </lord-icon>
                                        </div>
                                    </div>

                                </td>
                                <td className='py-2 border border-white text-center'>
                                    <div className='flex items-center justify-center'>
                                        <span>{'*'.repeat(item.password.length)}</span>
                                        <div className='size-7 cursor-pointer lordiconcopy' onClick={() => { copyPassword(item._id) }}>
                                            <lord-icon
                                                style={{ width: '25px', height: '25px', "paddingTop": '3px', "paddingLeft": '3px' }}
                                                src="https://cdn.lordicon.com/iykgtsbt.json"
                                                trigger="hover">
                                            </lord-icon>
                                        </div>
                                    </div>

                                </td>
                                <td className='py-2 border border-white text-center'>
                                    <span className='cursor-pointer mx-1' onClick={() => { editPassword(item._id) }}>
                                        <lord-icon
                                            src="https://cdn.lordicon.com/gwlusjdu.json"
                                            trigger="hover"
                                            style={{ "width": "25px", "height": "25px" }}>
                                        </lord-icon>
                                    </span>
                                    <span className='cursor-pointer mx-1' onClick={() => { deletePassword(item._id) }}>
                                        <lord-icon
                                            src="https://cdn.lordicon.com/skkahier.json"
                                            trigger="hover"
                                            style={{ "width": "25px", "height": "25px" }}>
                                        </lord-icon>
                                    </span>

                                </td>
                            </tr>
                        }
                        )}


                    </tbody>
                </table>
                </div>}

            </div >

        </>


    )
}

export default Manager
