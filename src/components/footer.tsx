import { GitHubLogoIcon, GlobeIcon } from "@radix-ui/react-icons"

const Footer = () => {
    const currentYear = (new Date).getFullYear();

    return (
        <footer className="px-8 py-4 flex justify-between align-bottom bg-slate-200 m-0 gap-4 text-slate-900 dark:bg-slate-800 dark:text-slate-100">
            <span className="text-md font-medium">© {currentYear} Kevin Peter</span>
            <span className="flex gap-4">
                <a href="https://github.com/KevzPeter/Online-Controller-Tester" target="_blank" rel="no-referrer" className="text-md font-medium">
                    <span className="flex gap-2"><GitHubLogoIcon className="h-5 w-5" /> Github</span>
                </a>
                <a href="https://kevzpeter.com" target="_blank" rel="no-referrer" className="text-md font-medium">
                    <span className="flex gap-2"><GlobeIcon className="h-5 w-5" /> KevzPeter</span>
                </a>
            </span>
        </footer>
    )
}

export default Footer;