export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="mx-auto max-w-7xl px-8 py-6">
      {children}
    </main>
  )
}
