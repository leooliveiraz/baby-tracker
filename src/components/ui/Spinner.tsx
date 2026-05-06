interface Props {
  size?: number
  fullPage?: boolean
}

export default function Spinner({ size = 24, fullPage = false }: Props) {
  const spinner = (
    <div
      className="spinner"
      style={{
        width: size,
        height: size,
        borderWidth: Math.max(2, size / 8),
      }}
    />
  )

  if (fullPage) {
    return (
      <div className="spinner-fullpage">
        {spinner}
      </div>
    )
  }

  return spinner
}
