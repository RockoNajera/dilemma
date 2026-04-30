interface SplitBarProps {
  a: number
  b: number
}

export default function SplitBar({ a, b }: SplitBarProps) {
  const total = a + b || 1
  const pctA = Math.round((a / total) * 100)
  const pctB = 100 - pctA

  return (
    <div className="split-bar">
      <div className="a" style={{ flex: pctA }}>
        {pctA}% · A
      </div>
      <div className="b" style={{ flex: pctB }}>
        B · {pctB}%
      </div>
    </div>
  )
}
