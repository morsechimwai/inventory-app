import { Skeleton } from "../ui/skeleton";

interface TableLoadingProps {
  columns?: number;
  rows?: number;
}

export default function TableLoading({
  columns = 6,
  rows = 10,
}: TableLoadingProps) {
  const templateStyle: React.CSSProperties = {
    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
  };

  return (
    <div className="flex w-full flex-col gap-6">
      <Skeleton className="h-8 w-full" />
      <div className="flex w-full flex-col gap-6">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={`row-${rowIndex}`}
            className="grid w-full gap-8"
            style={templateStyle}
          >
            {Array.from({ length: columns }).map((_, columnIndex) => (
              <Skeleton
                key={`row-${rowIndex}-column-${columnIndex}`}
                className="h-6 w-full"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
