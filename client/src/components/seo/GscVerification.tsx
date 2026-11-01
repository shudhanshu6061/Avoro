const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default async function GscVerification() {
  try {
    const res = await fetch(`${API_BASE}/api/seo/gsc`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const data = await res.json();
    const code = data.verificationCode?.trim();
    if (!code) return null;
    return <meta name="google-site-verification" content={code} />;
  } catch {
    return null;
  }
}