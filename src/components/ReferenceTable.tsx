import { useId, useState } from "react";
import type { FormEvent } from "react";
import { errorMessage } from "../lib/format";

// Tableau éditable générique pour une liste de données de référence :
// ajout, modification en ligne et suppression.

export type ReferenceField = {
  key: string;
  label: string;
  type?: "text" | "number";
  required?: boolean;
  className?: string; // largeur de la colonne
};

export type ReferenceValues = Record<string, string>;

type Props<T extends { id: string }> = {
  title: string;
  help?: string;
  items: T[];
  fields: ReferenceField[];
  // Valeurs de l'élément converties en chaînes pour les champs
  toValues: (item: T) => ReferenceValues;
  onCreate: (values: ReferenceValues) => Promise<void>;
  onUpdate: (id: string, values: ReferenceValues) => Promise<void>;
  // Gère elle-même la confirmation (et ne fait rien si l'utilisateur annule)
  onDelete: (item: T) => Promise<void>;
  // Élément non modifiable (ex. type « Inconnu »)
  isLocked?: (item: T) => boolean;
};

function emptyValues(fields: ReferenceField[]): ReferenceValues {
  return Object.fromEntries(fields.map((f) => [f.key, ""]));
}

const inputClass = "w-full border border-gray-300 rounded-md p-1 bg-white";
const smallButton =
  "px-2 py-1 rounded-md text-sm border disabled:opacity-50 whitespace-nowrap";

export default function ReferenceTable<T extends { id: string }>({
  title,
  help,
  items,
  fields,
  toValues,
  onCreate,
  onUpdate,
  onDelete,
  isLocked,
}: Props<T>) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<ReferenceValues>({});
  const [newValues, setNewValues] = useState(() => emptyValues(fields));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formIdPrefix = useId();

  async function run(action: () => Promise<void>, fallback: string) {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (e) {
      console.error(fallback, e);
      setError(errorMessage(e, fallback));
    } finally {
      setBusy(false);
    }
  }

  function startEdit(item: T) {
    setEditingId(item.id);
    setEditValues(toValues(item));
    setError(null);
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    await run(async () => {
      await onCreate(newValues);
      setNewValues(emptyValues(fields));
    }, "Impossible d'ajouter l'élément.");
  }

  async function handleUpdate(e: FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    await run(async () => {
      await onUpdate(editingId, editValues);
      setEditingId(null);
    }, "Impossible d'enregistrer les modifications.");
  }

  async function handleDelete(item: T) {
    await run(async () => {
      await onDelete(item);
    }, "Impossible de supprimer l'élément.");
  }

  function renderInput(
    field: ReferenceField,
    values: ReferenceValues,
    setValues: (v: ReferenceValues) => void,
    formId: string,
  ) {
    return (
      <input
        form={formId}
        aria-label={field.label}
        type={field.type ?? "text"}
        min={field.type === "number" ? 0 : undefined}
        required={field.required}
        className={inputClass}
        value={values[field.key] ?? ""}
        onChange={(e) => setValues({ ...values, [field.key]: e.target.value })}
      />
    );
  }

  const createFormId = `${formIdPrefix}-create`;
  const editFormId = `${formIdPrefix}-edit`;

  return (
    <section className="bg-white rounded-xl shadow-sm p-4">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      {help && <p className="mt-1 text-sm text-gray-600">{help}</p>}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {/* Formulaires détachés du tableau (attribut form des champs) */}
      <form id={createFormId} onSubmit={handleCreate} />
      <form id={editFormId} onSubmit={handleUpdate} />

      <div className="mt-3 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-100 text-left text-gray-600">
            <tr>
              {fields.map((field) => (
                <th
                  key={field.key}
                  className={`px-2 py-2 ${field.className ?? ""}`}
                >
                  {field.label}
                </th>
              ))}
              <th className="px-2 py-2 w-40" />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const locked = isLocked?.(item) ?? false;
              const values = toValues(item);

              if (editingId === item.id) {
                return (
                  <tr key={item.id} className="bg-indigo-50">
                    {fields.map((field) => (
                      <td key={field.key} className="px-2 py-1">
                        {renderInput(
                          field,
                          editValues,
                          setEditValues,
                          editFormId,
                        )}
                      </td>
                    ))}
                    <td className="px-2 py-1">
                      <div className="flex gap-1">
                        <button
                          type="submit"
                          form={editFormId}
                          disabled={busy}
                          className={`${smallButton} border-indigo-600 bg-indigo-600 text-white`}
                        >
                          Enregistrer
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className={`${smallButton} border-gray-300`}
                        >
                          Annuler
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={item.id} className="odd:bg-white even:bg-gray-50">
                  {fields.map((field) => (
                    <td key={field.key} className="px-2 py-2">
                      {values[field.key]}
                    </td>
                  ))}
                  <td className="px-2 py-2">
                    {locked ? (
                      <span className="text-xs text-gray-500">
                        Non modifiable
                      </span>
                    ) : (
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => startEdit(item)}
                          disabled={busy || editingId !== null}
                          className={`${smallButton} border-gray-300 hover:bg-gray-50`}
                        >
                          Modifier
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item)}
                          disabled={busy || editingId !== null}
                          className={`${smallButton} border-red-300 text-red-700 hover:bg-red-50`}
                        >
                          Supprimer
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}

            {/* Ligne d'ajout */}
            <tr className="border-t">
              {fields.map((field) => (
                <td key={field.key} className="px-2 py-2">
                  {renderInput(field, newValues, setNewValues, createFormId)}
                </td>
              ))}
              <td className="px-2 py-2">
                <button
                  type="submit"
                  form={createFormId}
                  disabled={busy || editingId !== null}
                  className={`${smallButton} border-indigo-600 text-indigo-700 hover:bg-indigo-50`}
                >
                  Ajouter
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
