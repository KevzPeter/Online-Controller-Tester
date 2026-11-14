import { GitHubLogoIcon, GlobeIcon } from "@radix-ui/react-icons"

const Footer = () => {
    const currentYear = (new Date).getFullYear();

    return (
        <footer className="m-0 flex flex-col items-center justify-between gap-3 border-t border-slate-200 px-4 py-5 text-xs text-slate-500 sm:flex-row sm:px-6 dark:border-slate-800 dark:text-slate-400">
            <span>© {currentYear} Kevin Peter</span>
            <span className="flex gap-4">
                <a href="https://github.com/KevzPeter/Online-Controller-Tester" target="_blank" rel="noreferrer" className="font-medium hover:text-slate-900 dark:hover:text-slate-100">
                    <span className="flex items-center gap-1.5"><GitHubLogoIcon className="h-4 w-4" /> GitHub</span>
                </a>
                <a href="https://kevzpeter.com" target="_blank" rel="noreferrer" className="font-medium hover:text-slate-900 dark:hover:text-slate-100">
                    <span className="flex items-center gap-1.5"><GlobeIcon className="h-4 w-4" /> KevzPeter</span>
                </a>
            </span>
        </footer>
    )
}

export default Footer;
