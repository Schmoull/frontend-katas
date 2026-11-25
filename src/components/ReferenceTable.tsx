import { useId, useState } from "react";
import type { FormEvent } from "react";
import { useTranslation } from "react-i18next";
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

const inputClass = "champ";
const smallButton = "btn btn-petit whitespace-nowrap";

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
  const { t } = useTranslation();
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
    }, t("adminReference.addError"));
  }

  async function handleUpdate(e: FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    await run(async () => {
      await onUpdate(editingId, editValues);
      setEditingId(null);
    }, t("adminReference.saveError"));
  }

  async function handleDelete(item: T) {
    await run(async () => {
      await onDelete(item);
    }, t("adminReference.deleteError"));
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
    <section>
      <h2 className="titre-2">{title}</h2>
      {help && <p className="corps mt-2 text-encre-douce">{help}</p>}

      {error && (
        <p role="alert" className="corps-fort mt-2 text-danger">
          {error}
        </p>
      )}

      {/* Formulaires détachés du tableau (attribut form des champs) */}
      <form id={createFormId} onSubmit={handleCreate} />
      <form id={editFormId} onSubmit={handleUpdate} />

      <div className="mt-4 overflow-x-auto shadow-posee">
        <table className="tableau">
          <thead>
            <tr>
              {fields.map((field) => (
                <th key={field.key} className={field.className}>
                  {field.label}
                </th>
              ))}
              <th className="w-48" />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const locked = isLocked?.(item) ?? false;
              const values = toValues(item);

              if (editingId === item.id) {
                return (
                  <tr key={item.id} className="bg-signal/25">
                    {fields.map((field) => (
                      <td key={field.key}>
                        {renderInput(
                          field,
                          editValues,
                          setEditValues,
                          editFormId,
                        )}
                      </td>
                    ))}
                    <td>
                      <div className="flex gap-1">
                        <button
                          type="submit"
                          form={editFormId}
                          disabled={busy}
                          className={`${smallButton} btn-secondaire`}
                        >
                          {t("common.save")}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className={`${smallButton} btn-discret`}
                        >
                          {t("common.cancel")}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={item.id}>
                  {fields.map((field) => (
                    <td key={field.key}>{values[field.key]}</td>
                  ))}
                  <td>
                    {locked ? (
                      <span className="legende text-encre-discrete">
                        {t("common.locked")}
                      </span>
                    ) : (
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => startEdit(item)}
                          disabled={busy || editingId !== null}
                          className={`${smallButton} btn-contour`}
                        >
                          {t("common.edit")}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item)}
                          disabled={busy || editingId !== null}
                          className={`${smallButton} btn-contour border-danger text-danger`}
                        >
                          {t("common.delete")}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}

            {/* Ligne d'ajout */}
            <tr className="bg-papier">
              {fields.map((field) => (
                <td key={field.key}>
                  {renderInput(field, newValues, setNewValues, createFormId)}
                </td>
              ))}
              <td>
                <button
                  type="submit"
                  form={createFormId}
                  disabled={busy || editingId !== null}
                  className={`${smallButton} btn-contour`}
                >
                  {t("common.add")}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
