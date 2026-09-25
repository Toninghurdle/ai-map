import Link from "next/link";

export default function NotFound() {
  return (
    <main className="fm-page fm-not-found">
      <h1>Page not found</h1>
      <p className="fm-lede">
        There is nothing at this address. It may have moved, or the link may
        be wrong.
      </p>
      <p>
        <Link href="/">Back to the field map</Link>
      </p>
    </main>
  );
}
