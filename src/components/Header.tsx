import Link from "next/link";

const Header = () => {
    return (
        <header className="container px-8 m-0">
            <div className="flex h-20 w-full items-center">
                <Link href="/">
                    <span className="text-2xl text-gray-300 font-medium">PS5 Controller Tester</span>
                </Link>
            </div>
        </header>
    )
}

export default Header;