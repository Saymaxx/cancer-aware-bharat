"""Bootstrap a real staff account in production.

`app.seed` is dev/demo only -- it creates accounts with a shared,
publicly-documented password. Use this instead for a real deployment:

    python -m app.create_superadmin --email you@org.org --role superadmin

Prompts for a password interactively (never pass it as a CLI arg --
it'd end up in shell history / process listings).
"""
import argparse
import getpass
import sys

from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.user import User


def run() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--email", required=True)
    parser.add_argument("--name", required=True)
    parser.add_argument("--role", choices=["admin", "superadmin"], required=True)
    args = parser.parse_args()

    password = getpass.getpass("Password: ")
    confirm = getpass.getpass("Confirm password: ")
    if password != confirm:
        print("Passwords did not match.", file=sys.stderr)
        sys.exit(1)
    if len(password) < 12:
        print("Use at least 12 characters for a production account.", file=sys.stderr)
        sys.exit(1)

    db = SessionLocal()
    try:
        if db.query(User).filter(User.email == args.email).first():
            print(f"A user with email {args.email} already exists.", file=sys.stderr)
            sys.exit(1)

        db.add(User(name=args.name, email=args.email, role=args.role, hashed_password=hash_password(password)))
        db.commit()
        print(f"Created {args.role} account for {args.email}.")
    finally:
        db.close()


if __name__ == "__main__":
    run()
