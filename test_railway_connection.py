#!/usr/bin/env python3
"""
Railway Connection Test Script
Run this to diagnose Railway database and Redis connectivity issues
"""

import os
import sys

def test_environment_variables():
    """Check if required environment variables are set"""
    print("=" * 60)
    print("ENVIRONMENT VARIABLES CHECK")
    print("=" * 60)
    
    required_vars = {
        "DATABASE_URL": os.getenv("DATABASE_URL"),
        "REDIS_URL": os.getenv("REDIS_URL"),
        "PORT": os.getenv("PORT"),
        "RAILWAY_ENVIRONMENT": os.getenv("RAILWAY_ENVIRONMENT"),
    }
    
    all_present = True
    for var, value in required_vars.items():
        status = "✅" if value else "❌"
        display_value = value[:50] + "..." if value and len(value) > 50 else value or "NOT SET"
        print(f"{status} {var}: {display_value}")
        if not value:
            all_present = False
    
    print("\n")
    return all_present

def test_database_connection():
    """Test PostgreSQL database connection"""
    print("=" * 60)
    print("DATABASE CONNECTION TEST")
    print("=" * 60)
    
    try:
        import psycopg2
        database_url = os.getenv("DATABASE_URL")
        
        if not database_url:
            print("❌ DATABASE_URL not set")
            return False
        
        print(f"🔍 Attempting connection to: {database_url[:50]}...")
        
        conn = psycopg2.connect(database_url, connect_timeout=10)
        cursor = conn.cursor()
        cursor.execute("SELECT version();")
        version = cursor.fetchone()
        
        print(f"✅ PostgreSQL connection successful!")
        print(f"✅ Database version: {version[0][:80]}...")
        
        cursor.close()
        conn.close()
        return True
        
    except ImportError:
        print("❌ psycopg2 not installed. Install with: pip install psycopg2-binary")
        return False
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        print(f"❌ Error type: {type(e).__name__}")
        return False
    finally:
        print("\n")

def test_redis_connection():
    """Test Redis connection"""
    print("=" * 60)
    print("REDIS CONNECTION TEST")
    print("=" * 60)
    
    try:
        import redis
        redis_url = os.getenv("REDIS_URL")
        
        if not redis_url:
            print("❌ REDIS_URL not set")
            return False
        
        print(f"🔍 Attempting connection to: {redis_url[:50]}...")
        
        r = redis.from_url(redis_url, socket_connect_timeout=10)
        r.ping()
        
        print(f"✅ Redis connection successful!")
        print(f"✅ Redis responding to PING")
        
        # Test basic operations
        r.set("test_key", "test_value", ex=10)
        value = r.get("test_key")
        r.delete("test_key")
        
        print(f"✅ Redis read/write operations working")
        return True
        
    except ImportError:
        print("❌ redis not installed. Install with: pip install redis")
        return False
    except Exception as e:
        print(f"❌ Redis connection failed: {e}")
        print(f"❌ Error type: {type(e).__name__}")
        return False
    finally:
        print("\n")

def test_sqlalchemy_connection():
    """Test SQLAlchemy connection (what the app actually uses)"""
    print("=" * 60)
    print("SQLALCHEMY CONNECTION TEST")
    print("=" * 60)
    
    try:
        from sqlalchemy import create_engine, text
        database_url = os.getenv("DATABASE_URL")
        
        if not database_url:
            print("❌ DATABASE_URL not set")
            return False
        
        print(f"🔍 Creating SQLAlchemy engine...")
        
        engine = create_engine(
            database_url,
            pool_pre_ping=True,
            pool_recycle=300,
            pool_size=5,
            max_overflow=10,
            connect_args={
                "connect_timeout": 10,
                "options": "-c timezone=utc"
            }
        )
        
        print(f"✅ Engine created successfully")
        
        # Test connection
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            print(f"✅ SQLAlchemy connection successful!")
            print(f"✅ Test query result: {result.fetchone()}")
        
        return True
        
    except ImportError as e:
        print(f"❌ Required package not installed: {e}")
        return False
    except Exception as e:
        print(f"❌ SQLAlchemy connection failed: {e}")
        print(f"❌ Error type: {type(e).__name__}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        print("\n")

def main():
    """Run all connection tests"""
    print("\n")
    print("🚀 RAILWAY CONNECTION DIAGNOSTIC TOOL")
    print("=" * 60)
    print("\n")
    
    results = {
        "Environment Variables": test_environment_variables(),
        "PostgreSQL (psycopg2)": test_database_connection(),
        "Redis": test_redis_connection(),
        "SQLAlchemy": test_sqlalchemy_connection(),
    }
    
    print("=" * 60)
    print("SUMMARY")
    print("=" * 60)
    
    for test_name, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status} - {test_name}")
    
    print("\n")
    
    if all(results.values()):
        print("🎉 All tests passed! Your Railway services are configured correctly.")
        return 0
    else:
        print("⚠️  Some tests failed. Check the errors above and:")
        print("   1. Verify services are linked in Railway dashboard")
        print("   2. Check environment variables are set correctly")
        print("   3. Ensure services are in the same Railway project")
        print("   4. Try using public connection URLs if internal DNS fails")
        return 1

if __name__ == "__main__":
    sys.exit(main())

