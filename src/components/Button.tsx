import React from "react";

type ButtonProps = {
  children: React.ReactNode;   // contenu du bouton (texte ou icône)
  onClick?: () => void;        // fonction exécutée au clic
  disabled?: boolean;          // état désactivé
};

export default function Button({ children, onClick, disabled }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-lg font-semibold 
                  ${disabled
                    ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                    : "bg-indigo-600 text-white hover:bg-indigo-700"}`}
    >
      {children}
    </button>
  );
}
