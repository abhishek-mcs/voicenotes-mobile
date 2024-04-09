import { Tooltip, TooltipProps } from "@rneui/themed";
import React from "react";

export default (props:any) => {
    const [open, setOpen] = React.useState(false);
    return (
      <Tooltip
        visible={open}
        onOpen={() => {
          setOpen(true);
        }}
        onClose={() => {
          setOpen(false);
        }}
        {...props}
      >{props?.children}</Tooltip>
    );
  };