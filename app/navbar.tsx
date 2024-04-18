import Link from "next/link";

const Navbar = () => {
  return (
    <nav>
      <ul className="flex gap-10 py-5 px-3 bg-white font-bold">
        <li>
          <Link href="/">
            <p className="text-black/80">Rugcheck</p>
          </Link>
        </li>
        <li>
          <Link href="/faq">
            <p className="text-black/80">FAQ</p>
          </Link>
        </li>
        <li>
          <Link href="/about">
            <p className="text-black/80">About</p>
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;