import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { logout, useAuthUser } from "@/lib/auth";
import { ThemeToggle } from "./ThemeToggle";

function Navbar() {
  const navigate = useNavigate();
  const user = useAuthUser();
  const [isOpen, setIsOpen] = useState(false); // Mobile menu state

  const links = [
    { to: "/", label: "Home" },
    { to: "/market", label: "Marketplace" },
    ...(user?.role === "farmer" ? [{ to: "/farmer", label: "Farmer" }] : []),
    ...(user?.role === "admin" ? [{ to: "/admin/verification", label: "Admin" }] : []),
    { to: "/transactions", label: "Transactions" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
    setIsOpen(false);
  };

  return (
    <>
      <nav className="flex items-center gap-3">
        {/* DESKTOP NAV: Hidden on mobile (md:flex) */}
        <div className="hidden md:flex items-center gap-1 rounded-full border border-border bg-card/80 backdrop-blur-sm px-2 py-1 text-sm shadow-sm">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-full px-3 py-1 font-medium transition ${
                  isActive
                    ? "bg-primary/15 text-primary ring-1 ring-primary/40"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* DESKTOP ACTIONS */}
        <div className="hidden md:flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Hi, {user.username}</span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>Logout</Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <NavLink to="/login"><Button variant="ghost" size="sm">Login</Button></NavLink>
              <NavLink to="/register"><Button size="sm">Get Started</Button></NavLink>
            </div>
          )}
        </div>

        {/* MOBILE TOGGLE: Visible only on small screens */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
            {/* Hamburger Icon / Close Icon */}
            {isOpen ? (
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            ) : (
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
            )}
          </Button>
        </div>
      </nav>

      {/* MOBILE MENU DROPDOWN */}
      {isOpen && (
        <div className="absolute top-16 left-0 right-0 z-50 flex flex-col gap-4 border-b border-border bg-background p-6 shadow-xl md:hidden animate-in slide-in-from-top-5">
          <div className="flex flex-col gap-2">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `px-4 py-3 rounded-lg text-sm font-medium transition ${
                    isActive ? "bg-primary/10 text-primary" : "text-foreground hover:bg-accent"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
          <div className="border-t border-border pt-4 flex flex-col gap-3">
            {user ? (
              <>
                <p className="text-sm text-muted-foreground px-2">Signed in as <span className="font-semibold text-foreground">{user.username}</span></p>
                <Button onClick={handleLogout} className="w-full" variant="destructive">Logout</Button>
              </>
            ) : (
              <>
                <NavLink to="/login" onClick={() => setIsOpen(false)}><Button variant="outline" className="w-full">Login</Button></NavLink>
                <NavLink to="/register" onClick={() => setIsOpen(false)}><Button className="w-full">Get Started</Button></NavLink>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;