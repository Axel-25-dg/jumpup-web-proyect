interface PlaceholderPageProps {
  title: string
}

export default function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 p-8">
      <p className="text-lg text-muted-foreground">{title}</p>
    </div>
  )
}
