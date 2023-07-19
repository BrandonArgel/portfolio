import { Link } from "react-router-dom";
import * as React from "react";
import { LanguageContext } from "@context";
import { useScrollDirection } from "@hooks";
import { Select } from "@components/Select";
import { KEY_CODES } from "@utils";
import { Logo } from "@components";
import styles from "./Header.module.scss";

interface NavItemProps {
  name: string;
  hash: string;
}

const Header = () => {
  const {
    texts: { header },
    language,
    setLanguage,
  } = React.useContext(LanguageContext);
  const [isOpen, setIsOpen] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(
    null
  ) as React.MutableRefObject<HTMLButtonElement>;
  const asideRef = React.useRef<HTMLDivElement>(
    null
  ) as React.MutableRefObject<HTMLDivElement>;
  const scrollDirection = useScrollDirection({
    initialDirection: "down",
  });
  const [scrolledToTop, setScrolledToTop] = React.useState(true);

  type Focusables = HTMLButtonElement | HTMLAnchorElement;

  let menuFocusables: Focusables[] = [];
  let firstFocusableEl: Focusables | null = null;
  let lastFocusableEl: Focusables | null = null;

  const setFocusables = () => {
    menuFocusables = [
      buttonRef.current,
      ...Array.from(asideRef.current.querySelectorAll("a")),
    ];
    firstFocusableEl = menuFocusables[0];
    lastFocusableEl = menuFocusables[menuFocusables.length - 1];
  };

  const handleBackwardTab = (e: KeyboardEvent) => {
    if (document.activeElement === firstFocusableEl) {
      e.preventDefault();
      lastFocusableEl && lastFocusableEl.focus();
    }
  };

  const handleForwardTab = (e: KeyboardEvent) => {
    if (document.activeElement === lastFocusableEl) {
      e.preventDefault();
      firstFocusableEl && firstFocusableEl.focus();
    }
  };

  const onKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case KEY_CODES.ESCAPE: {
        setIsOpen(false);
        break;
      }

      case KEY_CODES.TAB: {
        if (menuFocusables && menuFocusables.length === 1) {
          e.preventDefault();
          break;
        }
        if (e.shiftKey) {
          handleBackwardTab(e);
        } else {
          handleForwardTab(e);
        }
        break;
      }

      default: {
        break;
      }
    }
  };

  const handleScroll = () => {
    setScrolledToTop(window.pageYOffset < 50);
  };

  React.useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    document.addEventListener("keydown", onKeyDown);
    setFocusables();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("keydown", onKeyDown);
    };
  });

  return (
    <header
      className={`${styles.header} ${
        scrollDirection === "down" && !scrolledToTop ? styles.hide : ""
      }`}
    >
      <div className={styles.container}>
        <Link
          className={styles.header__logo}
          to="/"
          aria-label={header.logo}
          title={header.logo}
        >
          <Logo />
        </Link>
        <nav className={styles.header__nav}>
          <ul className={styles.header__nav_list}>
            {header.nav.map(({ name, hash }: NavItemProps, i: number) => (
              <li key={name} style={{ animationDelay: `${i * 0.1 + 0.1}s` }}>
                <a href={`#${hash}`}>{name}</a>
              </li>
            ))}
            <li style={{ animationDelay: `${header.nav.length * 0.1 + 0.1}s` }}>
              <Select
                title={header.select.title}
                options={header.select.options}
                setValue={setLanguage}
                value={language}
              />
            </li>
          </ul>
        </nav>
        <button
          aria-label={isOpen ? header.menu.close : header.menu.open}
          className={`${styles.header__hamburger} ${
            isOpen ? styles.header__hamburger_active : ""
          }`}
          onClick={() => setIsOpen(!isOpen)}
          ref={buttonRef}
          type="button"
        >
          <svg height="32" width="32">
            <line
              className={styles.header__hamburger_top}
              x1="10%"
              y1="20%"
              x2="50%"
              y2="20%"
            />
            <line
              className={styles.header__hamburger_middle}
              x1="10%"
              y1="50%"
              x2="90%"
              y2="50%"
            />
            <line
              className={styles.header__hamburger_bottom}
              x1="50%"
              y1="80%"
              x2="90%"
              y2="80%"
            />
          </svg>
        </button>
        <aside
          ref={asideRef}
          className={`${styles.header__menu} ${
            isOpen ? styles.header__menu_open : ""
          }`}
          aria-hidden={!isOpen}
          tabIndex={isOpen ? 1 : -1}
        >
          <nav>
            <ul className={styles.header__menu_list}>
              {header.nav.map(({ name, hash }: NavItemProps, i: number) => (
                <li key={name}>
                  <a
                    onClick={() => setIsOpen(!isOpen)}
                    href={`#${hash}`}
                    aria-hidden={!isOpen}
                    tabIndex={isOpen ? 1 : -1}
                  >
                    {name}
                  </a>
                </li>
              ))}
              <li>
                <Select
                  title={header.select.title}
                  options={header.select.options}
                  setValue={setLanguage}
                  value={language}
                  tabIndex={isOpen ? 1 : -1}
                />
              </li>
            </ul>
          </nav>
        </aside>
        {isOpen && (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={styles.header__backdrop}
          ></button>
        )}
      </div>
    </header>
  );
};

export { Header };
