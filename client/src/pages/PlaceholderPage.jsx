
import { useLocation } from "react-router-dom";
import Card from "../components/ui/Card";

const pageTitles = {
  "/dashboard": "Dashboard",
  "/issues": "Campus Issues",
  "/report": "Report an Issue",
  "/settings": "Settings",
  "/login": "Login",
  "/register": "Register",
};

export default function PlaceholderPage() {
  const { pathname } = useLocation();
  const title = pageTitles[pathname] ?? "Page not found";

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-6 text-2xl font-bold text-ink">{title}</h1>
      <Card>
        <p className="text-muted">
          {title} page is ready for implementation.
        </p>
      </Card>
    </div>
  );
}
