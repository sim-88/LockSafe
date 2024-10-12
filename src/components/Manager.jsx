import React, { useEffect, useRef, useState } from 'react'
import { ToastContainer, toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { v4 as uuid } from 'uuid';

const Manager = () => {
    const ref = useRef()
    const passwordRef = useRef()
    const [form, setform] = useState({ site: "", username: "", password: "" })
    const [passwordArray, setPasswordArray] = useState([])

    const getPasswords = async () => {
        let req = await fetch('http://localhost:3000/')
        let passwords = await req.json()
        console.log(passwords)
        setPasswordArray(passwords)
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
        // if (form.site === "" || form.username === "" || form.password === "") {
        //     alert('Please fill all the fields')
        // }
        if (form.site.length > 3 && form.username.length > 3 && form.password.length > 3) {
            setPasswordArray([...passwordArray, { ...form, id: uuid() }])

            let res=await fetch("http://localhost:3000/",{
                method:'POST',
                headers:{
                    'Content-Type':'application/json'
                },
                body:JSON.stringify({ ...form, id: uuid() })
            })
            setform({ site: "", username: "", password: "" })
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
        }
        else {
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

    const deletePassword = async (id) => {
        console.log("Deleting password with id ", id)
        let c = confirm("Are you sure you want to delete this password ?")
        if (c) {
            setPasswordArray(passwordArray.filter(item => item.id !== id))
            // localStorage.setItem("passwords", JSON.stringify(passwordArray.filter(item => item.id !== id)))

            let res=await fetch("http://localhost:3000/",{
                method:'DELETE',
                headers:{
                    'Content-Type':'application/json'
                },
                body:JSON.stringify({id})
            })
            toast('Password deleted successfully !', {
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
    const editPassword = async (id) => {
        console.log("Editing password with id ", id)
        setform(passwordArray.filter(i => i.id === id)[0])
        setPasswordArray(passwordArray.filter(item => item.id !== id))
        let res=await fetch("http://localhost:3000/",{
            method:'DELETE',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify({id})
        })
    }
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
                    <div className='flex flex-col md:flex-row w-full justify-between gap-5'>
                        <input value={form.username} onChange={handleChange} placeholder='Enter Username' className='text-blue-900 rounded-full border border-teal-500 w-full p-4 py-1' type="text" name="username" id="username" />
                        <div className="relative">
                            <input ref={passwordRef} value={form.password} onChange={handleChange} placeholder='Enter Password' className='text-blue-900 rounded-full border border-teal-500 w-full p-4 py-1' type="password" name="password" id="password" />
                            <span className='absolute right-[3px] top-[3px] cursor-pointer' onClick={showPassword}>
                                <img ref={ref} className='p-1' width={25} src="/icons/eye.png" alt="" />
                            </span>
                        </div>
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
                            return <tr key={index}>
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
                                        <span>{item.password}</span>
                                        <div className='size-7 cursor-pointer lordiconcopy' onClick={() => { copyText(item.password) }}>
                                            <lord-icon
                                                style={{ width: '25px', height: '25px', "paddingTop": '3px', "paddingLeft": '3px' }}
                                                src="https://cdn.lordicon.com/iykgtsbt.json"
                                                trigger="hover">
                                            </lord-icon>
                                        </div>
                                    </div>

                                </td>
                                <td className='py-2 border border-white text-center'>
                                    <span className='cursor-pointer mx-1' onClick={() => { editPassword(item.id) }}>
                                        <lord-icon
                                            src="https://cdn.lordicon.com/gwlusjdu.json"
                                            trigger="hover"
                                            style={{ "width": "25px", "height": "25px" }}>
                                        </lord-icon>
                                    </span>
                                    <span className='cursor-pointer mx-1' onClick={() => { deletePassword(item.id) }}>
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

            </div>

        </>


    )
}

export default Manager
