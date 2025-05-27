import type { Entity } from "@nodenogg.in/schema";
import type { NodeChange } from "@vue-flow/core";

export interface PositionedNode {
  id: string;
  type: string;
  data: Entity;
  position: { x: number; y: number };
  dimensions: { width: number; height: number };
}

export interface MicrocosmSpatialViewProps {
  view_id: string;
  ui?: boolean;
  nodes: PositionedNode[];
}

export interface ResizableNodeProps {
  entity: Entity;
  NodeResizer?: unknown;
  Editor?: unknown;
}

export interface MicrocosmSpatialViewEmits {
  "nodes-change": [changes: NodeChange[]];
}
