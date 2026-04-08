interface FeatureProps {
    title: string;
    text: string | React.ReactNode;
    horizontal?: boolean;
}

const Feature = ({ title, text, horizontal = false }: FeatureProps) => {
    return (
        <div
            className={`flex m-4 ${horizontal ? "w-full flex-col md:flex-row gap-4 md:gap-96" : "flex-1 flex-col"}`}
        >
            <div>
                <div
                    className="w-10 h-1 mb-3"
                    style={{
                        background: "var(--main-gradient)",
                    }}
                />
                <h1 className="font-title font-semibold text-xl md:text-xl text-white-pearl mb-4 md:mb-7">
                    {title}
                </h1>
            </div>
            <div className={horizontal ? "max-w-full md:max-w-xl flex" : ""}>
                <p className="font-text font-medium text-md leading-7 md:leading-10 text-white-pearl">
                    {text}
                </p>
            </div>
        </div>
    );
};

export default Feature;
