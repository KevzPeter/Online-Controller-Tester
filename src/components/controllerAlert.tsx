import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { RocketIcon, ExclamationTriangleIcon } from "@radix-ui/react-icons"

const ControllerAlert = ({ controllerName }: { controllerName: string }) => {
    if (controllerName) {
        return (
            <Alert>
                <RocketIcon className="h-4 w-4 text-slate-900 dark:text-slate-50" />
                <AlertTitle className="text-green-600">Connected!</AlertTitle>
                <AlertDescription>
                    <span className="font-bold">{controllerName}</span>
                </AlertDescription>
            </Alert>
        )
    }
    else {
        return (
            <Alert variant="destructive">
                <ExclamationTriangleIcon className="h-4 w-4 text-slate-900 dark:text-slate-50" />
                <AlertTitle className="text-red-800">Disconnected!</AlertTitle>
                <AlertDescription>
                    Connect your controller to interact.
                </AlertDescription>
            </Alert>
        )
    }
}

export default ControllerAlert