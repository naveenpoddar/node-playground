import React from "react";
import Skeleton, { SkeletonProps } from "react-loading-skeleton";

type Props = SkeletonProps & {};

const Loading = (props: Props) => {
  return (
    <Skeleton
      className="loading"
      baseColor="#2f2f2f"
      highlightColor="#5a5a5a"
      duration={1}
      {...props}
    />
  );
};

export default Loading;
