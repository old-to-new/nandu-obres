interface Props {
  modelId: string
}

export default function MatterportEmbed({ modelId }: Props) {
  return (
    <div className="relative w-full overflow-hidden rounded-lg bg-gray-900" style={{ paddingBottom: '56.25%' /* 16:9 */ }}>
      <iframe
        className="absolute inset-0 h-full w-full"
        src={`https://my.matterport.com/show/?m=${modelId}`}
        frameBorder="0"
        allowFullScreen
        allow="autoplay; fullscreen; web-share; xr-spatial-tracking;"
        title="Plànol 3D Matterport"
      />
    </div>
  )
}
