import React from 'react'
import { Bell } from 'lucide-react'

const Navbar = () => {
  return (
    <nav className='dashboard-navbar'>
        <div className='dashboard-navbar__container'>
            <div className='dashboard-navbar__actions'>
                <button className='dashboard-navbar__notifications-button'>
                    <span className='dashboard-navbar__notifications-inidicator'></span>
                    <Bell className='dashboard-navbar__notifications-icon'/>
                </button>                
            </div>
        </div>
    </nav>
  )
}

export default Navbar