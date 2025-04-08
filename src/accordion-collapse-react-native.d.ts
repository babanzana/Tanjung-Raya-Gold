declare module "accordion-collapse-react-native" {
  import { ReactNode } from "react";
  import { ViewStyle, TextStyle } from "react-native";

  export interface CollapseProps {
    children?: ReactNode;
    isExpanded?: boolean;
    onToggle?: (isExpanded: boolean) => void;
    style?: ViewStyle;
  }

  export interface CollapseHeaderProps {
    children?: ReactNode;
    style?: ViewStyle;
  }

  export interface CollapseBodyProps {
    children?: ReactNode;
    style?: ViewStyle;
  }

  export const Collapse: React.FC<CollapseProps>;
  export const CollapseHeader: React.FC<CollapseHeaderProps>;
  export const CollapseBody: React.FC<CollapseBodyProps>;
}
