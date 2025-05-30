import type { EntityOfType } from "@nodenogg.in/schema";
import type { NodeChange } from "@vue-flow/core";

export interface PositionedNode {
  id: string;
  type: string;
  data: EntityOfType<"html">;
  position: { x: number; y: number };
  dimensions: { width: number; height: number };
}

export interface MicrocosmSpatialViewProps {
  view_id: string;
  ui?: boolean;
  nodes: PositionedNode[];
}

export interface MicrocosmSpatialViewEmits {
  "nodes-change": [changes: NodeChange[]];
}
