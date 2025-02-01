import { Calendar, Home, ChartNoAxesColumn, Settings, PanelLeft, BadgeCheck, Settings2, LogOut, ChevronsUpDown } from "lucide-react"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter } from "@/components/ui/sidebar"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import Link from "next/link"

const SidebarLinks = [
  {
    label: "Home",
    href: "/overview",
    icon: ChartNoAxesColumn,
  },
  {
    label: "Properties",
    href: "/properties",
    icon: Home,
  },
  {
    label: "Bookings",
    href: "#",
    icon: Calendar,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
]

const DropdownLinks = [
  {
      label: "Account",
      href: "/user/account",
      icon: BadgeCheck
  },
  {
      label: "Settings",
      href: "/user/settings",
      icon: Settings2
  }
]

export function DashboardSidebar() {
  return (
    <Sidebar collapsible="icon" className="dashboard-sidebar">
      <SidebarHeader>
        <SidebarMenu className="dashboard-sidebar__header-menu">
          <SidebarMenuItem className="dashboard-sidebar__header-menu-item">
            <SidebarMenuButton className="dashboard-sidebar__header-menu-button" asChild>
              <div className="dashboard-sidebar__header-logo-container group">
                <div className="dashboard-sidebar__header-logo-wrapper">
                  <Avatar className="dashboard-sidebar__header-logo">
                      <AvatarImage src="https://github.com/shadcn.png"/>
                      <AvatarFallback>logo</AvatarFallback>
                  </Avatar>
                  <p className="dashboard-sidebar__header-title">TRIPA</p>
                </div>
                <PanelLeft className="dashboard-sidebar__header-collapse-icon" />
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="dashboard-sidebar__nav-menu">
          {SidebarLinks.map((link) => (
            <SidebarMenuItem className="dashboard-sidebar__nav-item" key={link.label}>
              <SidebarMenuButton className="dashboard-sidebar__nav-button" asChild>
                <Link href={link.href} className="dashboard-sidebar__nav-link" scroll={false}>
                    <div className="dashboard-sidebar__nav-icon">
                      <link.icon size={28} strokeWidth="1.2"/>
                    </div> 
                    <span className="dashboard-sidebar__nav-text">{link.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu className="dashboard-sidebar__footer-menu">
          <SidebarMenuItem className="dashboard-sidebar__footer-menu-item">
            <SidebarMenuButton asChild>
                <DropdownMenu>
                    <DropdownMenuTrigger className="dashboard-sidebar__footer-menu-trigger">
                      <div className="dashboard-sidebar__footer-user">
                        <Avatar className="dashboard-sidebar__footer-user-avatar">
                            <AvatarImage src="https://github.com/shadcn.png"/>
                            <AvatarFallback>JT</AvatarFallback>
                        </Avatar>
                        <div className="dashboard-sidebar__footer-user-info">
                          <span className="dashboard-sidebar__footer-user-name">Username</span>
                          <span>User Email</span>
                        </div>
                      </div>
                      <ChevronsUpDown size={20} strokeWidth={1.5}/>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                    side="right"
                    align="end"
                    alignOffset={50}
                    sideOffset={4}
                    className="dashboard-sidebar__footer-user-menu">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator/>
                        {DropdownLinks.map((link) => (
                            <DropdownMenuItem key={link.label}>
                                <Link href={link.href} className="dashboard-sidebar__footer-user-menu-item">
                                  <div className="dashboard-sidebar__footer-user-menu-icon">
                                    <link.icon size={18} strokeWidth="1.5"/>
                                  </div> 
                                  <span className="dashboard-sidebar__footer-user-menu-text">{link.label}</span>
                                </Link>
                            </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Link href="/" className="dashboard-sidebar__footer-user-menu-item"><LogOut size={18} strokeWidth="1.5"/> Log Out</Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
