interface PageHeaderProps {
  title: string
  right?: React.ReactNode
}

export default function PageHeader({ title, right }: PageHeaderProps) {
  return (
    <header className="bg-green-600 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40">
      <h1 className="text-lg font-semibold">{title}</h1>
      {right && <div>{right}</div>}
    </header>
  )
}
