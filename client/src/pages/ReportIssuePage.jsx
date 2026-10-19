
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getCategories,
  getBuildings,
  findSimilarIssues,
  uploadImages,
  createIssue,
  addIssueReport,
} from "../api/reports.api";

const OPEN_STATUSES = [
  "Reported",
  "Assigned",
  "In Progress",
  "Reopened",
];

const inputClass =
  "w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100";

const labelClass = "mb-2 block text-sm font-medium text-ink";

function unwrap(value) {
  return value?.data ?? value;
}

function normalizeList(value) {
  const result = unwrap(value);

  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.items)) return result.items;
  if (Array.isArray(result?.categories)) return result.categories;
  if (Array.isArray(result?.buildings)) return result.buildings;
  if (Array.isArray(result?.issues)) return result.issues;

  return [];
}

function getId(item) {
  return item?._id ?? item?.id ?? item?.value ?? "";
}

function getName(item) {
  return item?.name ?? item?.title ?? item?.label ?? "";
}

function getStatus(issue) {
  return issue?.status ?? "Reported";
}

function isRecentlyResolved(issue) {
  if (!["Resolved", "Closed"].includes(getStatus(issue))) {
    return false;
  }

  const date = issue?.resolvedAt ?? issue?.updatedAt;
  if (!date) return false;

  const elapsed = Date.now() - new Date(date).getTime();
  return elapsed >= 0 && elapsed <= 48 * 60 * 60 * 1000;
}

function StatusBadge({ status }) {
  const styles = {
    Reported: "bg-blue-50 text-blue-700",
    Assigned: "bg-indigo-50 text-indigo-700",
    "In Progress": "bg-amber-50 text-amber-800",
    Reopened: "bg-orange-50 text-orange-800",
    Resolved: "bg-emerald-50 text-emerald-700",
    Closed: "bg-slate-100 text-slate-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
        styles[status] ?? "bg-slate-100 text-slate-700"
      }`}
    >
      {status}
    </span>
  );
}

export default function ReportIssuePage() {
  const [categories, setCategories] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [buildingId, setBuildingId] = useState("");
  const [locationText, setLocationText] = useState("");
  const [description, setDescription] = useState("");
  const [safetyFlag, setSafetyFlag] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [files, setFiles] = useState([]);

  const [similarIssues, setSimilarIssues] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [duplicateGate, setDuplicateGate] = useState(false);

  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadOptions() {
      try {
        const [categoryResponse, buildingResponse] =
          await Promise.all([getCategories(), getBuildings()]);

        if (!active) return;

        setCategories(normalizeList(categoryResponse));
        setBuildings(normalizeList(buildingResponse));
      } catch {
        if (active) {
          setError(
            "Could not load categories and buildings. Please refresh the page."
          );
        }
      } finally {
        if (active) setLoadingOptions(false);
      }
    }

    loadOptions();

    return () => {
      active = false;
    };
  }, []);

  // Search for possible duplicates whenever the issue details change.
  useEffect(() => {
    if (
      !categoryId ||
      !buildingId ||
      (!locationText.trim() && !description.trim())
    ) {
      setSimilarIssues([]);
      setSearchError("");
      setSearching(false);
      return;
    }

    let active = true;
    setSearching(true);
    setSearchError("");

    const timer = setTimeout(async () => {
      try {
        const response = await findSimilarIssues({
          categoryId,
          buildingId,
          locationText: locationText.trim(),
          description: description.trim(),
        });

        if (!active) return;

        const matches = normalizeList(response)
          .filter((issue) => {
            const score = Number(
              issue?.similarity ??
                issue?.similarityScore ??
                issue?.score
            );

            // If the API does not provide a score, trust its returned matches.
            return !Number.isFinite(score) || score > 0.2;
          })
          .slice(0, 5);

        setSimilarIssues(matches);
      } catch {
        if (active) {
          setSimilarIssues([]);
          setSearchError(
            "Similar issues could not be checked. You can still submit your report."
          );
        }
      } finally {
        if (active) setSearching(false);
      }
    }, 400);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [categoryId, buildingId, locationText, description]);

  function resetMessages() {
    setError("");
    setSuccess(null);
    setDuplicateGate(false);
  }

  function validateForm() {
    if (!categoryId || !buildingId || !locationText.trim()) {
      setError("Please select a category and building, and enter the exact location.");
      return false;
    }

    if (description.trim().length < 20) {
      setError("Description must contain at least 20 characters.");
      return false;
    }

    if (description.trim().length > 1000) {
      setError("Description cannot exceed 1000 characters.");
      return false;
    }

    if (files.length > 3) {
      setError("You can upload a maximum of 3 images.");
      return false;
    }

    return true;
  }

  function handleFilesChange(event) {
    resetMessages();

    const selected = Array.from(event.target.files ?? []);
    const validTypes = ["image/jpeg", "image/png"];

    if (selected.length > 3) {
      setError("You can upload a maximum of 3 images.");
      setFiles([]);
      event.target.value = "";
      return;
    }

    const invalidFile = selected.find(
      (file) =>
        !validTypes.includes(file.type) ||
        file.size > 2 * 1024 * 1024
    );

    if (invalidFile) {
      setError(
        "Only JPG and PNG images up to 2 MB each are allowed."
      );
      setFiles([]);
      event.target.value = "";
      return;
    }

    setFiles(selected);
  }

  async function getUploadedImages() {
    if (files.length === 0) return [];

    const response = unwrap(await uploadImages(files));

    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.images)) return response.images;
    if (Array.isArray(response?.urls)) return response.urls;

    throw new Error("Image upload returned an unexpected response.");
  }

  async function submitNewIssue() {
    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      const images = await getUploadedImages();

      const response = unwrap(
        await createIssue({
          categoryId,
          buildingId,
          locationText: locationText.trim(),
          description: description.trim(),
          safetyFlag,
          images,
          isAnonymous,
        })
      );

      setSuccess({
        ...response,
        message: "Your issue report was submitted.",
      });

      setDuplicateGate(false);
    } catch (err) {
      setError(
        err?.response?.data?.message ??
          err?.message ??
          "Could not submit your report. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function reportExistingIssue(issue, reopen = false) {
    if (!validateForm()) return;

    const issueId = getId(issue);

    if (!issueId) {
      setError("This issue does not have a valid ID.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const images = await getUploadedImages();

      const response = unwrap(
        await addIssueReport(issueId, {
          description: description.trim(),
          images,
          isAnonymous,
          ...(reopen ? { reopen: true } : {}),
        })
      );

      setSuccess({
        ...response,
        _id: issueId,
        id: issueId,
        refId: response?.refId ?? issue?.refId,
        message: reopen
          ? "Your report was submitted to reopen the existing issue."
          : "You have been added to the existing issue report.",
      });
    } catch (err) {
      setError(
        err?.response?.data?.message ??
          err?.message ??
          "Could not update the existing issue. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    resetMessages();

    if (!validateForm()) return;

    // Give the user a chance to review possible duplicates first.
    if (similarIssues.length > 0 && !duplicateGate) {
      setDuplicateGate(true);
      return;
    }

    submitNewIssue();
  }

  function clearForm() {
    setCategoryId("");
    setBuildingId("");
    setLocationText("");
    setDescription("");
    setSafetyFlag(false);
    setIsAnonymous(false);
    setFiles([]);
    setSimilarIssues([]);
    setDuplicateGate(false);
    setError("");
    setSuccess(null);
  }

  if (success) {
    const issueId = success._id ?? success.id;
    const isDemo = success.demo === true;

    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <p className="text-sm font-medium text-brand-600">
            CAMPUS MAINTENANCE
          </p>
          <h1 className="mt-2 text-3xl font-bold text-ink">
            Report submitted
          </h1>
        </div>

        <section
          role="status"
          className="rounded-xl border border-emerald-200 bg-white p-6"
        >
          <div className="text-2xl font-semibold text-emerald-700">
            ✓ Success
          </div>

          <p className="mt-3 text-ink">{success.message}</p>

          {success.refId && (
            <p className="mt-2 text-sm text-muted">
              Reference ID:{" "}
              <span className="font-semibold text-ink">
                {success.refId}
              </span>
            </p>
          )}

          {isDemo && (
            <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
              Demo mode: this result is simulated. It has not been saved to
              a real backend.
            </p>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            {issueId && (
              <Link
                to={`/issues/${issueId}`}
                className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:opacity-90"
              >
                View issue
              </Link>
            )}

            <Link
              to="/issues"
              className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-ink hover:bg-canvas"
            >
              Browse issues
            </Link>

            <button
              type="button"
              onClick={clearForm}
              className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-ink hover:bg-canvas"
            >
              Report another issue
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-8">
      <div>
        <p className="text-sm font-medium text-brand-600">
          CAMPUS MAINTENANCE
        </p>
        <h1 className="mt-2 text-3xl font-bold text-ink">
          Report an Issue
        </h1>
        <p className="mt-2 text-muted">
          Provide accurate details so the responsible team can resolve the issue.
        </p>
      </div>

      <section className="overflow-hidden rounded-xl border border-border bg-white">
        <div className="border-b border-border px-5 py-4 sm:px-6">
          <h2 className="text-lg font-semibold text-ink">
            Issue Details
          </h2>
          <p className="mt-1 text-sm text-muted">
            Fields marked with * are required.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
            >
              {error}
            </div>
          )}

          <div>
            <label className={labelClass} htmlFor="category">
              Category *
            </label>
            <select
              id="category"
              value={categoryId}
              onChange={(event) => {
                setCategoryId(event.target.value);
                resetMessages();
                setSimilarIssues([]);
              }}
              className={inputClass}
              required
              disabled={loadingOptions}
            >
              <option value="">
                {loadingOptions ? "Loading categories..." : "Select category"}
              </option>
              {categories.map((category, index) => (
                <option
                  key={getId(category) || index}
                  value={getId(category)}
                >
                  {getName(category)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass} htmlFor="building">
              Building *
            </label>
            <select
              id="building"
              value={buildingId}
              onChange={(event) => {
                setBuildingId(event.target.value);
                resetMessages();
                setSimilarIssues([]);
              }}
              className={inputClass}
              required
              disabled={loadingOptions}
            >
              <option value="">
                {loadingOptions ? "Loading buildings..." : "Select building"}
              </option>
              {buildings.map((building, index) => (
                <option
                  key={getId(building) || index}
                  value={getId(building)}
                >
                  {getName(building)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass} htmlFor="location">
              Exact Location *
            </label>
            <input
              id="location"
              value={locationText}
              onChange={(event) => {
                setLocationText(event.target.value);
                resetMessages();
              }}
              placeholder="e.g. First floor, Room 204, near the lift"
              className={inputClass}
              maxLength={200}
              required
            />
            <p className="mt-1 text-xs text-muted">
              Add the floor, room number or a nearby landmark.
            </p>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <label className="text-sm font-medium text-ink" htmlFor="description">
                Describe the issue *
              </label>
              <span className="text-xs text-muted">
                {description.length}/1000
              </span>
            </div>

            <textarea
              id="description"
              value={description}
              onChange={(event) => {
                setDescription(event.target.value);
                resetMessages();
              }}
              placeholder="Explain what happened and any relevant details..."
              rows={5}
              minLength={20}
              maxLength={1000}
              required
              className={inputClass}
            />

            <p className="mt-1 text-xs text-muted">
              Enter at least 20 characters.
            </p>
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3">
            <input
              type="checkbox"
              checked={safetyFlag}
              onChange={(event) => {
                setSafetyFlag(event.target.checked);
                resetMessages();
              }}
              className="mt-1"
            />
            <span>
              <span className="block text-sm font-medium text-ink">
                Safety hazard
              </span>
              <span className="mt-1 block text-sm text-muted">
                Check this if the issue could cause injury or immediate danger.
              </span>
            </span>
          </label>

          <div>
            <label className={labelClass} htmlFor="images">
              Photos (optional)
            </label>
            <input
              id="images"
              type="file"
              accept="image/jpeg,image/png"
              multiple
              onChange={handleFilesChange}
              className="block w-full text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-canvas file:px-3 file:py-2 file:font-medium file:text-ink"
            />
            <p className="mt-1 text-xs text-muted">
              Up to 3 JPG or PNG images, maximum 2 MB each.
            </p>

            {files.length > 0 && (
              <ul className="mt-3 space-y-1 text-sm text-ink">
                {files.map((file) => (
                  <li key={`${file.name}-${file.size}`}>
                    {file.name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(event) => {
                setIsAnonymous(event.target.checked);
                resetMessages();
              }}
              className="mt-1"
            />
            <span className="text-sm text-ink">
              Submit anonymously
              <span className="mt-1 block text-xs text-muted">
                Hide your identity where supported by the reporting system.
              </span>
            </span>
          </label>

          <div className="border-t border-border pt-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-semibold text-ink">
                Similar Issues
              </h2>
              {searching && (
                <span className="text-xs text-muted">
                  Checking for duplicates...
                </span>
              )}
            </div>

            <p className="mt-1 text-sm text-muted">
              Check whether someone has already reported the same problem.
            </p>

            {searchError && (
              <p role="status" className="mt-3 text-sm text-amber-800">
                {searchError}
              </p>
            )}

            {!searching &&
              !searchError &&
              similarIssues.length === 0 &&
              categoryId &&
              buildingId &&
              (locationText.trim() || description.trim()) && (
                <p className="mt-3 text-sm text-muted">
                  No similar issues found.
                </p>
              )}

            {similarIssues.length > 0 && (
              <div className="mt-4 space-y-3">
                {similarIssues.map((issue, index) => {
                  const status = getStatus(issue);
                  const canJoin = OPEN_STATUSES.includes(status);
                  const canReopen = isRecentlyResolved(issue);

                  return (
                    <article
                      key={getId(issue) || index}
                      className="rounded-lg border border-border p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <h3 className="font-medium text-ink">
                          {issue.title ??
                            issue.name ??
                            issue.description ??
                            "Reported campus issue"}
                        </h3>
                        <StatusBadge status={status} />
                      </div>

                      {issue.refId && (
                        <p className="mt-1 text-xs text-muted">
                          Reference: {issue.refId}
                        </p>
                      )}

                      {issue.locationText && (
                        <p className="mt-2 text-sm text-muted">
                          Location: {issue.locationText}
                        </p>
                      )}

                      {issue.description && issue.title && (
                        <p className="mt-2 text-sm text-muted">
                          {issue.description}
                        </p>
                      )}

                      <div className="mt-3 flex flex-wrap gap-2">
                        {canJoin && (
                          <button
                            type="button"
                            disabled={loading}
                            onClick={() => reportExistingIssue(issue)}
                            className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
                          >
                            I am affected too
                          </button>
                        )}

                        {canReopen && (
                          <button
                            type="button"
                            disabled={loading}
                            onClick={() => reportExistingIssue(issue, true)}
                            className="rounded-lg border border-orange-300 px-3 py-2 text-sm font-medium text-orange-800 disabled:opacity-50"
                          >
                            Still broken (Reopen)
                          </button>
                        )}

                        {issue._id || issue.id ? (
                          <Link
                            to={`/issues/${getId(issue)}`}
                            className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-ink"
                          >
                            View issue
                          </Link>
                        ) : null}
                      </div>
                    </article>
                  );
                })}

                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                  <p className="text-sm text-amber-900">
                    A similar report already exists. Please review it before
                    creating another issue.
                  </p>

                  <button
                    type="button"
                    disabled={loading}
                    onClick={submitNewIssue}
                    className="mt-3 rounded-lg border border-amber-400 bg-white px-3 py-2 text-sm font-medium text-amber-900 disabled:opacity-50"
                  >
                    Report as a New Issue
                  </button>
                </div>
              </div>
            )}
          </div>

          {duplicateGate && similarIssues.length > 0 && (
            <p role="status" className="text-sm text-amber-800">
              Similar issues were found. Review the matches above, join an
              existing report, or choose “Report as a New Issue”.
            </p>
          )}

          <div className="flex flex-wrap gap-3 border-t border-border pt-5">
            <button
              type="submit"
              disabled={loading || loadingOptions}
              className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Submitting..."
                : duplicateGate
                  ? "Confirm New Issue"
                  : "Review and Submit"}
            </button>

            <button
              type="button"
              onClick={clearForm}
              disabled={loading}
              className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-ink hover:bg-canvas disabled:opacity-50"
            >
              Clear Form
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
