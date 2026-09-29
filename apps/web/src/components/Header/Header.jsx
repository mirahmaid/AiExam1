import Logo from "./Logo";
import NavLinks from "./NavLinks";
import NavLinksLoggedIn from "./NavLinksLoggedIn";
import AuthButtons from "./AuthButtons";
import UserMenu from "./UserMenu";
import MobileMenu from "./MobileMenu";
import { useAuth } from "../../context/AuthContext";

function HeaderSkeleton() {
  return (
    <div className="hidden items-center gap-10 lg:flex">
      <div className="h-4 w-[420px] animate-pulse rounded-full bg-slate-100" />
    </div>
  );
}

function Header() {
  const { isLoggedIn, isLoading } = useAuth();

  return (
    <header className="fixed top-0 right-0 left-0 z-40 w-full border-b border-slate-200 bg-white backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-20 lg:px-8">
        <Logo />

        {isLoading ? (
          <HeaderSkeleton />
        ) : isLoggedIn ? (
          <NavLinksLoggedIn />
        ) : (
          <NavLinks />
        )}

        {isLoading ? (
          <div className="hidden h-9 w-24 animate-pulse rounded-full bg-slate-100 lg:block" />
        ) : isLoggedIn ? (
          <UserMenu />
        ) : (
          <AuthButtons />
        )}

        <MobileMenu />
      </div>
    </header>
  );
}

export default Header;
