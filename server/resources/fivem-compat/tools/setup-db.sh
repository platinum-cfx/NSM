#!/usr/bin/env bash
# Set up a real MariaDB instance for fivem-compat integration tests.
#
#   bash tools/setup-db.sh
#
# Non-root, user-owned datadir under /tmp/nsm-mysql (TCP 127.0.0.1:3307,
# unix socket /tmp/nsm-mysql/mysql.sock). Re-runnable: skips init if the
# datadir exists, restarts mariadbd if it is not up.
#
# NOTE: this sandbox does not persist installed packages or /tmp between
# sessions — run this script again after a sandbox restart
# (sudo apt-get install -y mariadb-server first if the binary is gone).
set -u

SOCK=/tmp/nsm-mysql/mysql.sock
PORT=3307
DATA=/tmp/nsm-mysql/data
PIDF=/tmp/nsm-mysql/mariadbd.pid

mkdir -p /tmp/nsm-mysql

# mariadbd present?
if ! command -v /usr/sbin/mariadbd >/dev/null 2>&1; then
  echo "[setup-db] mariadbd not found — installing (needs sudo)..."
  sudo apt-get update -qq
  sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq mariadb-server
fi

# already up?
if mariadb -S "$SOCK" -u root -e 'SELECT 1' >/dev/null 2>&1; then
  echo "[setup-db] MariaDB already up on :$PORT"
else
  if [ ! -d "$DATA/mysql" ]; then
    echo "[setup-db] initializing datadir at $DATA..."
    /usr/bin/mariadb-install-db --datadir="$DATA" --auth-root-authentication-method=normal \
      --skip-test-db >/tmp/nsm-mysql/install.log 2>&1 || { tail -5 /tmp/nsm-mysql/install.log; exit 1; }
  fi
  echo "[setup-db] starting mariadbd on 127.0.0.1:$PORT..."
  nohup /usr/sbin/mariadbd --datadir="$DATA" --socket="$SOCK" --port=$PORT \
    --bind-address=127.0.0.1 --skip-name-resolve --pid-file="$PIDF" \
    >/tmp/nsm-mysql/mariadbd.log 2>&1 &
  for i in $(seq 1 30); do
    if mariadb -S "$SOCK" -u root -e 'SELECT 1' >/dev/null 2>&1; then break; fi
    sleep 1
  done
  mariadb -S "$SOCK" -u root -e 'SELECT 1' >/dev/null 2>&1 || { echo "[setup-db] FAILED to start"; tail -20 /tmp/nsm-mysql/mariadbd.log; exit 1; }
  echo "[setup-db] MariaDB up"
fi

# schema: fivem DB with a qb-core-style players table
mariadb -S "$SOCK" -u root <<'SQL'
CREATE DATABASE IF NOT EXISTS fivem CHARACTER SET utf8mb4;
USE fivem;
CREATE TABLE IF NOT EXISTS players (
  id INT AUTO_INCREMENT PRIMARY KEY,
  citizenid VARCHAR(50) NOT NULL UNIQUE,
  cid INT DEFAULT 1,
  license VARCHAR(80) NOT NULL,
  name VARCHAR(80) NOT NULL DEFAULT '',
  money LONGTEXT NOT NULL DEFAULT '{}',
  charinfo LONGTEXT NOT NULL DEFAULT '{}',
  job LONGTEXT NOT NULL DEFAULT '{}',
  gang LONGTEXT NOT NULL DEFAULT '{}',
  position LONGTEXT NOT NULL DEFAULT '{}',
  metadata LONGTEXT NOT NULL DEFAULT '{}',
  inventory LONGTEXT,
  last_seen DATETIME
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS bans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  license VARCHAR(80) NOT NULL,
  reason LONGTEXT,
  expire BIGINT NOT NULL DEFAULT 0,
  added_by VARCHAR(80) NOT NULL DEFAULT ''
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS mp_demo_notes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  src INT NOT NULL,
  name VARCHAR(80) NOT NULL DEFAULT '',
  note VARCHAR(255) NOT NULL DEFAULT '',
  created_at DATETIME
) ENGINE=InnoDB;
SQL
echo "[setup-db] schema ready (db: fivem, table: players)"
