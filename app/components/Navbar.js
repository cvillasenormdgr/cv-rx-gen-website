import React from 'react'

import ThemeToggle from './ThemeToggle'

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md rounded-2xl mx-55">
      <div className="w-full px-4">
        <div className="flex justify-between items-center">
          <div className="flex gap-4">
            <div className="flex items-center">
              <img src="/Layer 6.png" alt="logo" className="h-10" />
            </div>
            <div className="hidden md:flex items-center space-x-1">
              <a href="#" className="py-4 px-2 text-muted-foreground hover:text-foreground border-b-2 border-transparent hover:border-primary">Home</a>
              <a href="#" className="py-4 px-2 text-muted-foreground hover:text-foreground border-b-2 border-transparent hover:border-primary">About</a>
              <a href="#" className="py-4 px-2 text-muted-foreground hover:text-foreground border-b-2 border-transparent hover:border-primary">Services</a>
              <a href="#" className="py-4 px-2 text-muted-foreground hover:text-foreground border-b-2 border-transparent hover:border-primary">Contact</a>
            </div>
          </div>
          <div className="flex items-center">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
