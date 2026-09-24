"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Customer = {
  id: string;
  name: string;
  email: string;
  mobile: string;
};

export default function AccountClient() {

  const [customer, setCustomer] =
    useState<Customer | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [mode, setMode] =
    useState<"login" | "register">("login");

  const [error, setError] =
    useState("");

  const [busy, setBusy] =
    useState(false);

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [mobile, setMobile] =
    useState("");

  const [password, setPassword] =
    useState("");


  useEffect(() => {

    fetch("/api/customer/me")
      .then((response) => response.json())
      .then((body) =>
        setCustomer(body.customer || null)
      )
      .finally(() =>
        setLoading(false)
      );

  }, []);


  async function submit(
    event: React.FormEvent
  ) {

    event.preventDefault();

    setError("");
    setBusy(true);

    try {

      const endpoint =
        mode === "register"
          ? "/api/customer/register"
          : "/api/customer/login";

      const response =
        await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            mode === "register"
              ? {
                  name,
                  email,
                  mobile,
                  password,
                }
              : {
                  email,
                  password,
                }
          ),
        });

      const body =
        await response.json();

      if (!response.ok) {
        throw new Error(
          body.error ||
          "Something went wrong."
        );
      }

      setCustomer(body.customer);

      window.dispatchEvent(
        new Event("eurofoam:account")
      );

    } catch (error) {

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );

    } finally {

      setBusy(false);

    }
  }


  async function logout() {

    await fetch(
      "/api/customer/logout",
      {
        method: "POST",
      }
    );

    setCustomer(null);

    window.dispatchEvent(
      new Event("eurofoam:account")
    );
  }


  if (loading) {
    return (
      <div className="site-account-loading">
        LOADING YOUR CORNER…
      </div>
    );
  }


  if (customer) {

    return (
      <section className="site-account">

        <div className="site-utility-heading">

          <p className="site-orange">
            TERA GADDA ACCOUNT
          </p>

          <h1>
            HI,
            <br />
            {customer.name.split(" ")[0].toUpperCase()}.
          </h1>

        </div>


        <div className="site-account-grid">

          <section className="site-account-card">

            <p className="site-orange">
              YOUR DETAILS
            </p>

            <div>
              <small>NAME</small>
              <strong>{customer.name}</strong>
            </div>

            <div>
              <small>EMAIL</small>
              <strong>{customer.email}</strong>
            </div>

            {customer.mobile ? (
              <div>
                <small>MOBILE</small>
                <strong>{customer.mobile}</strong>
              </div>
            ) : null}

            <button
              type="button"
              onClick={logout}
            >
              SIGN OUT
            </button>

          </section>


          <nav className="site-account-links">

            <Link href="/cart">
              <small>SHOPPING</small>
              <strong>MERA CART →</strong>
            </Link>

            <Link href="/wishlist">
              <small>SAVED</small>
              <strong>PASAND WALE →</strong>
            </Link>

            <Link href="/sleep-quiz">
              <small>CONFUSED?</small>
              <strong>KAUNSA GADDA? →</strong>
            </Link>

          </nav>

        </div>

      </section>
    );
  }


  return (
    <section className="site-account-auth">

      <div className="site-account-auth-copy">

        <p className="site-orange">
          YOUR CORNER OF GADDA.
        </p>

        <h1>
          WAPAS
          <br />
          AA GAYA?
        </h1>

        <p>
          Save your shortlist, come back to your cart,
          and keep the buying process in one place.
        </p>

      </div>


      <section className="site-account-form">

        <div className="site-account-tabs">

          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError("");
            }}
            className={
              mode === "login"
                ? "is-active"
                : ""
            }
          >
            SIGN IN
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("register");
              setError("");
            }}
            className={
              mode === "register"
                ? "is-active"
                : ""
            }
          >
            CREATE ACCOUNT
          </button>

        </div>


        <h2>
          {mode === "login"
            ? "GOOD TO SEE YOU."
            : "JOIN THE GADDA SIDE."}
        </h2>


        <form onSubmit={submit}>

          {mode === "register" ? (
            <>
              <input
                required
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder="Full name"
              />

              <input
                value={mobile}
                onChange={(e) =>
                  setMobile(e.target.value)
                }
                placeholder="Mobile number"
                inputMode="tel"
              />
            </>
          ) : null}


          <input
            required
            type="email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            placeholder="Email address"
          />


          <input
            required
            type="password"
            minLength={8}
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            placeholder="Password"
          />


          {error ? (
            <div className="site-account-error">
              {error}
            </div>
          ) : null}


          <button
            disabled={busy}
            className="site-account-submit"
          >
            {busy
              ? "PLEASE WAIT…"
              : mode === "login"
                ? "SIGN IN →"
                : "CREATE ACCOUNT →"}
          </button>

        </form>

      </section>

    </section>
  );
}
