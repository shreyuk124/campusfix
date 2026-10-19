
import { AlertTriangle } from "lucide-react";
import Button from "./Button";

export default function ErrorState({
  title = "Something went wrong",
  description = "We couldn't load this information. Please try again.",
  onRetry,
}) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-red-200 bg-danger-50 p-5"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle
          size={21}
          className="mt-0.5 shrink-0 text-danger"
          aria-hidden="true"
        />

        <div>
          <h3 className="font-semibold text-ink">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-body">
            {description}
          </p>

          {onRetry && (
            <Button
              variant="secondary"
              size="sm"
              className="mt-4"
              onClick={onRetry}
            >
              Try again
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
