import Logo from "./Logo";
import NavLinks from "./NavLinks";
import NavLinksLoggedIn from "./NavLinksLoggedIn";
import AuthButtons from "./AuthButtons";
import UserMenu from "./UserMenu";
import MobileMenu from "./MobileMenu";
import { useAuth } from "../../context/AuthContext";

function HeaderSkeleton() {
  return (
    <div className="hidden items-center gap-3 lg:flex">
      <div className="h-8 w-[300px] animate-pulse rounded-xl bg-slate-100/80" />
    </div>
  );
}

function Header() {
  const { isLoggedIn, isLoading } = useAuth();

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 w-full"
      style={{
        fontFamily: "'Cairo', system-ui, sans-serif",
      }}
    >
      <div className="relative w-full border-b border-[#E6EDF1]/80 bg-white/92 backdrop-blur-xl">
        {/* لمعة بسيطة أعلى الهيدر */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#BFE8DD] to-transparent"
        />

        <div className="mx-auto flex h-[74px] max-w-[1380px] items-center justify-between px-4 sm:px-6 lg:h-[82px] lg:px-8 xl:px-10">
          {/* Logo */}
          <Logo />

          {/* Desktop Navigation */}
          <div className="flex min-w-0 flex-1 items-center justify-center px-5">
            {isLoading ? (
              <HeaderSkeleton />
            ) : isLoggedIn ? (
              <NavLinksLoggedIn />
            ) : (
              <NavLinks />
            )}
          </div>

          {/* Right Actions */}
          {isLoading ? (
            <div className="hidden h-10 w-28 animate-pulse rounded-full bg-slate-100 lg:block" />
          ) : isLoggedIn ? (
            <UserMenu />
          ) : (
            <AuthButtons />
          )}

          {/* Mobile */}
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}

export default Header;