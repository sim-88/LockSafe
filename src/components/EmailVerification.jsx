import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EmailVerification = ({ onVerify }) => {
    const [email, setEmail] = useState('');
    const [securityKey, setSecurityKey] = useState('');
    const [isKeySent, setIsKeySent] = useState(false);

    // Function to handle email submission
    const handleSendSecurityKey = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:3000/send-key', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }), // Send email to backend
            });

            const data = await response.json();

            if (data.success) {
                setIsKeySent(true);
                toast.success('Security Key sent successfully to your email!');
            } else {
                toast.error('Failed to send security key.');
            }
        } catch (error) {
            toast.error('Error sending email.');
        }
    };


    // Function to handle security key verification
    const handleVerifySecurityKey = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:3000/verify-key', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, securityKey }), // Send email and key to backend
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Security Key verified successfully!');
                localStorage.setItem('token', data.token); // Store verification status
                toast.success('Email verified successfully!');
                onVerify(); // Call callback function
            } else {
                toast.error('Invalid Security Key, please try again.');
            }
        } catch (error) {
            toast.error('Error verifying security key.');
        }
    };



    return (
        <div className="relative min-h-screen flex flex-col justify-center items-center">

            <div className="absolute inset-0 -z-10 h-full w-full bg-gray-50 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"><div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-500 opacity-20 blur-[100px]"></div></div>


            {/* Toast Notifications */}
            <ToastContainer />

            {/* LockSafe Title */}
            <div className="p-2 text-center">
                <h1 className='text-4xl font-bold'>
                    <span className='text-teal-500'>&lt; </span>
                    <span className='text-blue-800'>Lock</span>
                    <span className='text-teal-500'>Safe / &gt;</span>
                </h1>
                <p className='text-gray-500 text-lg mb-6'>Your Own Password Manager</p>

                <form
                    onSubmit={isKeySent ? handleVerifySecurityKey : handleSendSecurityKey}
                    className="w-full max-w-md p-8 shadow-lg rounded-lg"
                >
                    {/* Email Input */}
                    {!isKeySent && (
                        <>
                            <label htmlFor="email" className="block text-lg text-gray-700">Enter Your Email</label>
                            <input
                                type="email"
                                id="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-3 mt-2 border border-gray-300 rounded-md focus:outline-none focus:border-teal-500"
                                required
                            />
                            <button
                                type="submit"
                                className="w-full mt-4 bg-blue-700 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none"
                            >
                                Send Security Key
                            </button>
                        </>
                    )}

                    {/* Security Key Input */}
                    {isKeySent && (
                        <>
                            <label htmlFor="securityKey" className="block text-lg text-gray-700">Enter Security Key</label>
                            <input
                                type="text"
                                id="securityKey"
                                placeholder="Enter the security key from email"
                                value={securityKey}
                                onChange={(e) => setSecurityKey(e.target.value)}
                                className="w-full p-3 mt-2 border border-gray-300 rounded-md focus:outline-none focus:border-teal-500"
                                required
                            />
                            <button
                                type="submit"
                                className="w-full mt-4 bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 focus:outline-none"
                            >
                                Verify Security Key
                            </button>
                        </>
                    )}
                </form>
            </div>

        </div>
    );
};

export default EmailVerification;
