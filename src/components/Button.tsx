import React from "react";

type ButtonProps = {
  children: React.ReactNode;   // contenu du bouton (texte ou icône)
  onClick?: () => void;        // fonction exécutée au clic
  disabled?: boolean;          // état désactivé
  loading?: boolean;
};

export default function Button({ children, onClick, disabled, loading }: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-busy={loading}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold transition
                  ${isDisabled
                    ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                    : "bg-indigo-600 text-white hover:bg-indigo-700"}`}
    >
    {loading && (
        <svg
          className="animate-spin h-4 w-4 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      )}
      <span>{children}</span>
    </button>
  );
}
