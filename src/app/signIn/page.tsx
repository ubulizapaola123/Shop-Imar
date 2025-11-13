'use client'
import Image from 'next/image'
import { useState } from 'react'
import {Eye, EyeOff} from 'lucide-react'

const Signin = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    alert(`Email: ${email}\nPassword: ${password}`)
  }

  return (
    <div className='flex h-screen'>
      
      {/*  Left image side */}
      <div className='w-1/2 relative hidden md:block'>
        <Image
          src="/signup.png"
          alt="logo"
          fill
          className="object-cover "
          priority
        />
      </div>

      {/*Right form side */}
      <div className='w-full md:w-1/2 flex justify-center items-center bg-white'>
        <div className='relative flex flex-col items-center justify-center h-[450px] w-[450px] bg-gray-100 rounded-2xl shadow-xl p-8'>

          {/* Logo + Title */}
          <div className='flex flex-col justify-center items-center mb-6'>
            <Image src='/logo.png' alt='Container' width={100} height={100} />
            <h1 className='text-gray-700 text-lg font-semibold font-sans mt-3'>
              Login to your account
            </h1>
          </div>

          {/* Form */}
          <form className="w-full space-y-5" onSubmit={handleSubmit}>
            
            {/* Email Input */}
            <div className='relative'>
              <label className="block text-gray-500 text-lg mb-1">
                Email address
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#68AE3C]/40 placeholder-gray-400 text-black"
                 onChange={(e) => setEmail(e.target.value)}    
                required
              /> 
            </div>

            {/* Password Input */}
            <div className="relative">
              <label className="block text-gray-500 text-lg mb-1">
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Choose your password"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#68AE3C]/40  placeholder-gray-400 text-black"
                 onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[45px] text-gray-500"
              >
                 {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full bg-[#68AE3C] text-white p-3 rounded-lg font-semibold hover:bg-[#5c9936] transition"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Signin
