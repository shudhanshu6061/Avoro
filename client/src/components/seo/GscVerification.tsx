export default async function GscVerification() {
  try {
    const base = process.env.SERVER_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const targetUrl = new URL('api/seo/gsc', base.endsWith('/') ? base : `${base}/`).toString();
    const res = await fetch(targetUrl, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const data = await res.json();
    const code = data.verificationCode?.trim();
    if (!code) return null;
    return <meta name="google-site-verification" content={code} />;
  } catch {
    return null;
  }
}