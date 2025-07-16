interface ColorScaleProps {
    width?: number;
    height?: number;
    min?: number;
    max?: number;
}

export const ColorScale = ({
    width = 200,
    height = 16,
    min = -1,
    max = 1,
}: ColorScaleProps) => {
    return (
        <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">{min}</span>
            <div
                className="rounded border border-mutetext-muted-foreground"
                style={{
                    width: `${width}px`,
                    height: `${height}px`,
                    background: "linear-gradient(to right, rgb(255, 128, 51), rgb(255, 255, 255), rgb(51,128, 255))",
                }}
            />
            <span className="text-xs text-muted-foreground">{max}</span>
        </div>
    );
};