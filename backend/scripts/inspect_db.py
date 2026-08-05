"""
Database Schema Inspector Script
Run from the backend directory:
    python scripts/inspect_db.py
"""

import os
import sys

# Ensure backend root is on Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy import inspect
from app.core.database import engine
from app.core.config import settings

def inspect_database():
    print("=" * 60)
    print(" C A N C E R   A W A R E   B H A R A T")
    print(" Database Schema & Tables Inspector")
    print("=" * 60)
    print(f"Target DB: {settings.database_url}\n")

    try:
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        if not tables:
            print("⚠️ No tables found in the database. Ensure migrations have been run with `alembic upgrade head`.")
            return

        print(f"Found {len(tables)} tables in schema 'public':\n")
        
        for table_name in sorted(tables):
            print(f"📌 Table: {table_name}")
            columns = inspector.get_columns(table_name)
            pk = inspector.get_pk_constraint(table_name)
            pk_cols = pk.get('constrained_columns', [])
            
            for col in columns:
                col_name = col['name']
                col_type = str(col['type'])
                is_pk = " (PK)" if col_name in pk_cols else ""
                nullable = "" if col['nullable'] else " NOT NULL"
                print(f"    - {col_name:<30} {col_type:<20}{nullable}{is_pk}")
            print("-" * 60)

    except Exception as e:
        print(f"❌ Error connecting to database: {e}")
        print("\nTip: Make sure PostgreSQL container is running via `docker-compose up -d` in the backend directory.")

if __name__ == "__main__":
    inspect_database()
