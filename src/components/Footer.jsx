import React from 'react';

const Footer = () => {
    return (
        // <footer className="fixed bottom-0 left-0 w-full bg-gray-400 bg-opacity-20 text-gray-400 py-4">
        //   <div className="container mx-auto text-center">
        //     <p className="text-sm">&copy; 2024 Created by Simarpreet Kaur💗</p>
        //   </div>
        // </footer>
        <div className='bg-gray-400 bg-opacity-20 text-gray-400 flex flex-col justify-center items-center w-full'>
            <div className='logo font-bold text-blue-800 text-xl'>
                <span className='text-teal-500'>&lt; </span>
                <span>Lock</span>
                <span className='text-teal-500'>Safe / &gt;</span>
            </div>
            <div className='flex justify-center items-center'>
                Created with <img className='w-5 m-2' src="icons/heart.png" alt="" /> by Simarpreet

            </div>
        </div>
    );
};

export default Footer;