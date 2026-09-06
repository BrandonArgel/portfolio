export function YoutubeEmbed({
  id,
  title = 'YouTube video player',
}: {
  id: string
  title?: string
}) {
  return (
    <div className="not-typeset my-6 aspect-video w-full overflow-hidden rounded-xl border border-border shadow-sm">
      <iframe
        className="h-full w-full"
        src={`https://www.youtube-nocookie.com/embed/${id}`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}
