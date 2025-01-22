import React from 'react'
import { Bell, Search } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from '@/components/ui/dropdown-menu'



const Navbar = () => {
  return (
    <nav className='dashboard-navbar'>
        <div className='dashboard-navbar__container'>
            <div className='dashboard-navbar__search'>
                <div className='flex items-center gap-4'>
                    <div className='relative group'>
                        <Input className='dashboard-navbar__search-input' type='search' placeholder='Search Property'/>
                        <Search className='dashboard-navbar__search-icon' size={18}/>
                    </div>
                </div>
            </div>
            <div className='dashboard-navbar__actions'>
                <button className='dashboard-navbar__notifications-button'>
                    <span className='dashboard-navbar__notifications-inidicator'></span>
                    <Bell className='dashboard-navbar__notifications-icon'/>
                </button>
                <DropdownMenu>
                    <DropdownMenuTrigger>
                        <Avatar>
                            <AvatarImage src="https://github.com/shadcn.png"/>
                            <AvatarFallback>JT</AvatarFallback>
                        </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator/>
                        <DropdownMenuItem>
                            <a href='/user/profile'>Profile</a>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <a href='/user/settings'>Settings</a>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <a href=''>Log Out</a>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                
            </div>
        </div>
    </nav>
  )
}

export default Navbar