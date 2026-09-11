import {
  NextResponse
} from "next/server";

import {
  createAdminAccount,
  currentAdminRole,
  currentAdminUsername,
  deleteAdminAccount,
  isAdminAuthenticated,
  listAdminAccounts,
  resetAdminPassword,
  setAdminRole,
  type AdminRole
} from "@/lib/admin-auth";


export const runtime =
  "nodejs";


async function requireAdmin() {
  if (
    !(
      await isAdminAuthenticated()
    )
  ) {
    return false;
  }

  return true;
}


async function requireOwner() {
  if (
    !(
      await isAdminAuthenticated()
    )
  ) {
    return false;
  }

  return (
    (
      await currentAdminRole()
    ) === "owner"
  );
}


export async function GET() {
  if (
    !(
      await requireAdmin()
    )
  ) {
    return NextResponse.json(
      {
        error:
          "Unauthorized"
      },
      {
        status: 401
      }
    );
  }

  return NextResponse.json({
    admins:
      await listAdminAccounts(),

    currentUsername:
      await currentAdminUsername(),

    currentRole:
      await currentAdminRole()
  });
}


export async function POST(
  request: Request
) {
  if (
    !(
      await requireOwner()
    )
  ) {
    return NextResponse.json(
      {
        error:
          "Only a Super Admin can create administrators."
      },
      {
        status: 403
      }
    );
  }

  try {
    const body =
      (await request.json()) as {
        username?: string;
        password?: string;
        role?: AdminRole;
      };

    await createAdminAccount({
      username:
        String(
          body.username ||
          ""
        ),

      password:
        String(
          body.password ||
          ""
        ),

      role:
        body.role ||
        "admin"
    });

    return NextResponse.json({
      ok: true,
      admins:
        await listAdminAccounts()
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not create administrator."
      },
      {
        status: 400
      }
    );
  }
}


export async function PATCH(
  request: Request
) {
  if (
    !(
      await requireOwner()
    )
  ) {
    return NextResponse.json(
      {
        error:
          "Only a Super Admin can manage administrators."
      },
      {
        status: 403
      }
    );
  }

  try {
    const body =
      (await request.json()) as {
        username?: string;
        role?: AdminRole;
        newPassword?: string;
      };

    const username =
      String(
        body.username ||
        ""
      ).trim();

    if (!username) {
      throw new Error(
        "Username is required."
      );
    }

    if (body.role) {
      await setAdminRole(
        username,
        body.role
      );
    }

    if (
      body.newPassword
    ) {
      await resetAdminPassword(
        username,
        String(
          body.newPassword
        )
      );
    }

    return NextResponse.json({
      ok: true,
      admins:
        await listAdminAccounts()
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not update administrator."
      },
      {
        status: 400
      }
    );
  }
}


export async function DELETE(
  request: Request
) {
  if (
    !(
      await requireOwner()
    )
  ) {
    return NextResponse.json(
      {
        error:
          "Only a Super Admin can remove administrators."
      },
      {
        status: 403
      }
    );
  }

  try {
    const body =
      (await request.json()) as {
        username?: string;
      };

    const username =
      String(
        body.username ||
        ""
      ).trim();

    const current =
      await currentAdminUsername();

    if (
      username &&
      current &&
      username.toLowerCase() ===
        current.toLowerCase()
    ) {
      throw new Error(
        "You cannot delete the account you are currently signed in with."
      );
    }

    await deleteAdminAccount(
      username
    );

    return NextResponse.json({
      ok: true,
      admins:
        await listAdminAccounts()
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not remove administrator."
      },
      {
        status: 400
      }
    );
  }
}
