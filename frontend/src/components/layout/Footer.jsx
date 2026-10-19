export default function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-surface py-6 text-center text-sm text-muted">
      <div className="mx-auto max-w-content px-4">
        <p>&copy; {new Date().getFullYear()} CampusFix SDSG4. Campus Maintenance & Issue Resolution.</p>
      </div>
    </footer>
  );
}