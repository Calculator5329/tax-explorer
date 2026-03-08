import { TAX_LAYERS } from '../data/types'

export default function Legend() {
  return (
    <div className="legend">
      {TAX_LAYERS.map(layer => (
        <div className="legend-item" key={layer.key}>
          <span className="legend-swatch" style={{ background: layer.color }} />
          {layer.label}
        </div>
      ))}
    </div>
  )
}
