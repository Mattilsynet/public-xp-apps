import React from 'react'
import { Handle } from 'reactflow'
import { EditSVG } from './EditSVG'
import { NodeProps } from '@reactflow/core/dist/esm/types/nodes'

export function CustomNode({
  data,
  isConnectable = false,
  targetPosition,
  sourcePosition,
}: NodeProps) {
  return (
    <div className="react-flow__node-default" style={data.style}>
      {data.noTargetHandle ? (
        <></>
      ) : (
        <Handle type={'target'} position={targetPosition} isConnectable={isConnectable} />
      )}
      <a
        className={'edit-content-svg-wrapper'}
        href={document.location.origin + data.enonicEditPath}
        target="_blank"
        rel="noreferrer">
        <EditSVG />
      </a>
      {data.label}
      {data.noSourceHandle ? (
        <></>
      ) : (
        <Handle type={'source'} position={sourcePosition} isConnectable={isConnectable} />
      )}
    </div>
  )
}
