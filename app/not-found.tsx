import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-8 py-24 text-center">
      <div className="flex flex-col gap-2">
        <span className="font-mono text-8xl font-bold tracking-tighter text-muted-foreground/30">
          404
        </span>
        <h1 className="text-2xl font-semibold tracking-tight">
          Page not found
        </h1>
        <p className="max-w-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
      </div>

      <Link
        href="/"
        className="rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
      >
        Go home
      </Link>
    </div>
  )
}
