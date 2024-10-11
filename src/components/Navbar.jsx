import React from 'react'

const Navbar = () => {
  return (
    <nav className='backdrop-blur-lg bg-teal-400 bg-opacity-10'>
      <div className="my-container flex items-center justify-between h-14 px-5 py-5">
        <div className='logo font-bold text-blue-800 text-2xl'>
          <span className='text-teal-500'>&lt; </span>
          <span>Lock</span>
          <span className='text-teal-500'>Safe / &gt;</span>
        </div>
        <ul>
          <li className='flex gap-5'>
            <a className='hover:font-medium text-gray-500' href="/">Home</a>
            <a className='hover:font-medium text-gray-500' href="#">About</a>
            {/* <a className='hover:font-medium text-gray-500' href="#">Contact</a> */}
          </li>
        </ul>

        <button className='flex rounded-full bg-gray-700 text-white items-center justify-center ring-1 ring-gray-400'>
          <img className='w-8 invert p-1' src="/icons/github.svg" alt="" />
          <span className='font-semibold font-mono px-2'>Github</span>
        </button>
      </div>

    </nav>
  )
}

export default Navbar
