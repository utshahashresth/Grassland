import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

import { cn } from "@/lib/utils"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function LoginForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const navigate = useNavigate()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError("")
        setLoading(true)
        try {
            const { data } = await api.post("/token/", {
                username: email,
                password,
            })
            localStorage.setItem("token", data.access)
            localStorage.setItem("refresh", data.refresh)
            navigate("/")
        } catch (err) {
            if (axios.isAxiosError(err) && err.response?.status === 401) {
                setError("Incorrect email or password.")
            } else {
                setError("Something went wrong. Please try again.")
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={cn("flex flex-col gap-6 p-6 ", className)} {...props}>
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-xl text-[var(--text-heading)]">
                        Welcome back
                    </CardTitle>

                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <FieldGroup className="gap-4 p-2 ">


                            <Field >
                                <FieldLabel htmlFor="email">Email</FieldLabel>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </Field>
                            <Field>
                                <div className="flex items-center">
                                    <FieldLabel htmlFor="password">Password</FieldLabel>
                                    <a
                                        href="#"
                                        className="ml-auto text-sm text-[var(--text-link)] underline-offset-4 hover:underline"
                                    >
                                        Forgot your password?
                                    </a>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </Field>
                            {error && <FieldError>{error}</FieldError>}
                            <Field>
                                <Button type="submit" disabled={loading}>
                                    {loading ? "Logging in…" : "Login"}
                                </Button>

                            </Field>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>

        </div>
    )
}
