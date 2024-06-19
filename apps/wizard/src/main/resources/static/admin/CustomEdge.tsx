import React from 'react'
import { BaseEdge, EdgeLabelRenderer, EdgeProps, getBezierPath } from 'reactflow'
import { EditSVG } from './EditSVG'

export function CustomEdge({ id, data, label, ...props }: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath(props)
  const iconSize = 10
  return (
    <>
      <BaseEdge path={edgePath} id={id} />
      <EdgeLabelRenderer>
        <div
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan edge-label">
          <a
            className={'edit-content-svg-wrapper'}
            href={document.location.origin + data?.enonicEditPath}
            target="_blank"
            rel="noreferrer"
            style={{ width: iconSize, height: iconSize, top: -iconSize / 2, right: -iconSize / 2 }}>
            <EditSVG size={iconSize} />
          </a>
          {label ?? '?'}
        </div>
      </EdgeLabelRenderer>
    </>
  )
}
