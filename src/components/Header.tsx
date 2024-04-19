import Link from "next/link";

const Header = () => {
    return (
        <header className="mx-8 my-2 flex">
            <div className="flex h-20 w-full items-center">
                <Link href="/">
                    <span className="text-2xl text-gray-200 font-medium">PS5 Controller Tester</span>
                </Link>
            </div>
        </header>
    )
}

export default Header;