export function publicUrl(
  request: Request,
  pathname: string
) {
  /*
   * Only force the configured public domain
   * when actually running in production.
   *
   * This prevents localhost development from
   * suddenly redirecting to eurofoam.in.
   */
  if (process.env.NODE_ENV === "production") {
    const configured =
      process.env.PUBLIC_SITE_URL
        ?.trim()
        .replace(/\/+$/, "");

    if (configured) {
      return new URL(
        pathname,
        `${configured}/`
      );
    }
  }

  /*
   * Respect reverse-proxy headers where present.
   */
  const forwardedHost =
    request.headers
      .get("x-forwarded-host")
      ?.split(",")[0]
      ?.trim();

  const forwardedProto =
    request.headers
      .get("x-forwarded-proto")
      ?.split(",")[0]
      ?.trim();

  const host =
    forwardedHost ||
    request.headers.get("host");

  if (host) {
    const proto =
      forwardedProto ||
      (
        process.env.NODE_ENV === "production"
          ? "https"
          : "http"
      );

    return new URL(
      pathname,
      `${proto}://${host}`
    );
  }

  /*
   * Final fallback.
   */
  return new URL(
    pathname,
    request.url
  );
}
