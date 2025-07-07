import type { EntityOfType } from "@nodenogg.in/schema";
import type { NodeChange } from "@vue-flow/core";

export interface VueFlowEntity {
  id: string;
  type: string;
  data: EntityOfType<"html"> | EntityOfType<"emoji">;
  position: {
    x: number;
    y: number;
  };
  dimensions: {
    width: number;
    height: number;
  };
  style?: {
    width: string;
    height: string;
  };
}

export interface MicrocosmSpatialViewProps {
  view_id: string;
  ui?: boolean;
  nodes: VueFlowEntity[];
}

export interface MicrocosmSpatialViewEmits {
  "nodes-change": [changes: NodeChange[]];
}
