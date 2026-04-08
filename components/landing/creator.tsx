interface CreatorProps {
    name: string;
    email: string;
    github: string;
    linkedin: string;
}

const Creator = ({ name, email, github, linkedin }: CreatorProps) => {
    const githubUsername = github.split("/").pop() || "";
    const linkedinUsername = linkedin.split("/in/")[1]?.replace("/", "") || "";

    return (
        <div className="text-center">
            <h3 className="font-title font-semibold text-xl md:text-2xl text-white-pearl mb-2">
                {name}
            </h3>
            <a
                href={`mailto:${email}`}
                className="font-text text-xs md:text-sm text-white-pearl mb-3 block"
            >
                {email}
            </a>
            <a
                href={github}
                className="font-text text-xs md:text-sm text-white-pearl flex gap-2 mb-3 justify-center"
            >
                <img src="github-icon.svg" alt="GitHub" className="w-5 h-5" />
                {githubUsername}
            </a>
            <a
                href={linkedin}
                className="font-text text-xs md:text-sm text-white-pearl flex gap-2 mb-3 justify-center"
            >
                <img
                    src="linkedin-icon.svg"
                    alt="LinkedIn"
                    className="w-5 h-5"
                />
                {linkedinUsername}
            </a>
        </div>
    );
};

export default Creator;
