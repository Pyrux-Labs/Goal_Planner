import { FaRegEyeSlash } from "react-icons/fa";
import { FaRegEye } from "react-icons/fa";

interface InputFieldProps {
    label: string;
    type?: "text" | "date" | "email" | "password";
    placeholder?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    labelClassName?: string;
    showPasswordToggle?: boolean;
    isPasswordVisible?: boolean;
    onPasswordToggle?: () => void;
    disabled?: boolean;
}

const InputField = ({
    label,
    type = "text",
    placeholder,
    value,
    onChange,
    labelClassName = "block text-white-pearl mb-4",
    showPasswordToggle = false,
    isPasswordVisible = false,
    onPasswordToggle,
    disabled = false,
}: InputFieldProps) => {
    // Determinar el tipo real del input
    const inputType =
        type === "password" && showPasswordToggle && isPasswordVisible
            ? "text"
            : type;

    return (
        <div>
            <label className={labelClassName}>{label}</label>
            <div className="relative">
                <input
                    type={inputType}
                    className={`w-full h-12 bg-input-bg border border-input-bg text-white-pearl placeholder:text-input-text rounded-2xl px-3 focus:outline-none focus:border-vibrant-orange transition-colors ${
                        showPasswordToggle && type === "password" ? "pr-12" : ""
                    } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                />
                {showPasswordToggle && type === "password" && (
                    <button
                        type="button"
                        onClick={onPasswordToggle}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white-pearl/70 hover:text-white-pearl transition-colors text-lg"
                    >
                        {isPasswordVisible ? <FaRegEye /> : <FaRegEyeSlash />}
                    </button>
                )}
            </div>
        </div>
    );
};

export default InputField;
