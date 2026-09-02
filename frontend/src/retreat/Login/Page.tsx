import { LoginForm } from "@/components/ui/login-form"
import { Logo } from "@/retreat/Logo"

export default function LoginPage() {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-[var(--surface-app)] p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">
                <a
                    href="#"
                    className="flex items-center gap-2.5 self-center text-[15px] font-semibold text-[var(--text-heading)]"
                    style={{ fontFamily: "var(--font-display)" }}
                >
                    <Logo size={34} />
                    GrassLand
                </a>
                <LoginForm />
            </div>
        </div>
    )
}
